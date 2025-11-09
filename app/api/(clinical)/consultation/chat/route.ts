import { getDb } from 'database/client';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { patientSessions, users } from '@/db/schema';
import { trackPerplexityUsage } from '@/src/features/admin/cost-tracking/services/costTracker';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

// Perplexity API configuration
const PPLX_API_URL = 'https://api.perplexity.ai/chat/completions';
function getPerplexityConfig() {
  const apiKey = process.env.PPLX_API_KEY;
  if (!apiKey) {
    throw new Error('Missing PPLX_API_KEY');
  }
  const model = process.env.PPLX_MODEL || 'sonar';
  return { apiKey, model };
}

// URL cleaner (no allowlist enforcement; HTTPS required; tracking params removed)
function sanitiseUrl(urlStr: string): string | null {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== 'https:') {
      return null;
    }
    // Strip common tracking params
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    for (const p of paramsToRemove) {
      u.searchParams.delete(p);
    }
    return u.toString();
  } catch {
    return null;
  }
}

// Note: streaming filter removed (non-streaming Perplexity path)

// Minimal system prompt: bullets-only style and clinical tone
const CHATBOT_SYSTEM_PROMPT = `You are a clinical AI assistant for New Zealand General Practitioners (GPs).

Output format (follow exactly):
- ONLY 3–6 bullet points, each \u226410 words, telegraphic, keywords/phrases; grammar may be minimal. Do NOT write any headings.
- Do NOT write any paragraphs after the bullets. Stop after the bullet list.
- Professional, clear, GP-focused. Support safe reasoning; avoid definitive diagnoses.
`;

// (Deprecated) legacy context wrappers removed; context now appended in user prompt

export async function POST(req: Request) {
  try {
    // Extract user context for cost tracking
    const context = await extractRBACContext(req);

    const { messages, consultationNote, useContext, rawConsultationData } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Messages array is required' },
        { status: 400 },
      );
    }

    // Build user prompt dynamically: inject query + NZ search instruction, and optionally consultation context
    const systemPrompt = CHATBOT_SYSTEM_PROMPT;

    // Determine latest user query (fallback to last user message content)
    const lastUserMsg = [...messages].reverse().find((m: any) => m?.role === 'user');
    const queryText = (lastUserMsg?.content || '').toString().trim();

    let dynamicUserContent = '';
    dynamicUserContent += `I want to know more about this: "${queryText}"\n`;
    dynamicUserContent += `Search instruction:\n`;
    dynamicUserContent += `- Actively search New Zealand websites to answer the query. Prioritise domains ending with .nz, .co.nz, .org.nz, .net.nz.\n`;
    dynamicUserContent += `- Avoid news sites, general blogs, forums, or opinion pieces.\n`;

    if (useContext) {
      if (consultationNote && consultationNote.trim()) {
        dynamicUserContent += `\nBelow is additional context about the patient.\n${consultationNote.trim()}\n`;
      } else if (rawConsultationData) {
        const parts: string[] = [];
        if (rawConsultationData.transcription && rawConsultationData.transcription.trim()) {
          parts.push(rawConsultationData.transcription.trim());
        }
        if (rawConsultationData.typedInput && rawConsultationData.typedInput.trim()) {
          parts.push(rawConsultationData.typedInput.trim());
        }
        if ((rawConsultationData as any).additionalNote && (rawConsultationData as any).additionalNote.trim()) {
          parts.push((rawConsultationData as any).additionalNote.trim());
        }
        if (parts.length > 0) {
          dynamicUserContent += `\nBelow is additional context about the patient.\n${parts.join('\n')}\n`;
        }
      }
    }

    // Prepare messages for Perplexity API
    // Replace latest user message with dynamic user content
    const transformed = [...messages];
    const lastUserIndex = [...transformed].map((m: any, idx: number) => ({ m, idx }))
      .reverse()
      .find(({ m }) => m?.role === 'user')?.idx;
    if (typeof lastUserIndex === 'number') {
      transformed[lastUserIndex] = { ...transformed[lastUserIndex], content: dynamicUserContent };
    } else {
      transformed.push({ role: 'user', content: dynamicUserContent });
    }

    const pplxMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...transformed.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];
    // Call Perplexity (non-streaming for reliable citation metadata)
    const { apiKey, model } = getPerplexityConfig();
    const pplxResp = await fetch(PPLX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: pplxMessages,
        temperature: 0.2,
        max_tokens: 400,
        stream: false,
        return_citations: true,
      }),
    });

    if (!pplxResp.ok) {
      const text = await pplxResp.text().catch(() => '');
      console.error('Perplexity API error:', pplxResp.status, text);
      return NextResponse.json(
        { code: 'UPSTREAM_ERROR', message: 'Failed to fetch from Perplexity' },
        { status: 502 },
      );
    }

    const pplxJson: any = await pplxResp.json();

    // Extract content
    const content: string = pplxJson?.choices?.[0]?.message?.content || '';

    // Extract token usage for cost tracking
    const usage = pplxJson?.usage || {};
    const inputTokens = usage.prompt_tokens || 0;
    const outputTokens = usage.completion_tokens || 0;

    // Extract citation metadata from various possible locations
    let citations: Array<{ url?: string; title?: string }> = [];
    if (Array.isArray(pplxJson?.citations)) {
 citations = pplxJson.citations;
}
    if (!citations.length && Array.isArray(pplxJson?.choices?.[0]?.message?.citations)) {
      citations = pplxJson.choices[0].message.citations;
    }
    if (!citations.length && Array.isArray(pplxJson?.choices?.[0]?.citations)) {
      citations = pplxJson.choices[0].citations;
    }
    if (!citations.length && Array.isArray(pplxJson?.metadata?.citations)) {
      citations = pplxJson.metadata.citations;
    }

    // Clean main content: keep only initial bullet list; drop any prose/links; strip inline numeric markers like [1]
    const lines = (content || '').split('\n');
    const bullets: string[] = [];
    let foundAnyBullet = false;
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i] ?? '';
      const trimmed = raw.trim();
      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
      const isSourceLine = /\s—\shttps?:\/\//.test(raw) || trimmed.toUpperCase() === 'SOURCES:';
      const isLabel = trimmed.toUpperCase().startsWith('SHORT ANSWER:') || trimmed.toUpperCase().startsWith('FOLLOW-UPS:');
      if (isSourceLine || isLabel) {
        continue;
      }
      if (isBullet) {
        foundAnyBullet = true;
        bullets.push(raw.replace(/\s*\[\d+\]/g, ''));
      } else if (foundAnyBullet) {
        // stop at first non-bullet after bullets start
        break;
      }
    }
    const cleanedContent = bullets.join('\n').trim();

    // Prepare all unique citations with sanitised HTTPS URLs (no cap)
    const seen = new Set<string>();
    const topCitations: Array<{ index: number; url: string; title: string }> = [];
    for (const c of citations || []) {
      const urlMatch = typeof c?.url === 'string' ? c.url : (typeof (c as any) === 'string' ? (c as any) : undefined);
      if (!urlMatch) {
 continue;
}
      const cleaned = sanitiseUrl(urlMatch);
      if (!cleaned) {
 continue;
}
      if (seen.has(cleaned)) {
 continue;
}
      seen.add(cleaned);
      let title = c?.title;
      if (!title) {
        try {
          const u = new URL(cleaned);
          title = u.hostname;
        } catch {
          title = cleaned;
        }
      }
      topCitations.push({ index: topCitations.length + 1, url: cleaned, title });
    }

    // Build citations payload for client dropdown
    const citationsPayload = topCitations.map(c => ({ title: c.title, url: c.url }));

    // Track Perplexity usage cost
    try {
      // Fetch current session id for user (if available)
      let currentSessionId: string | null = null;
      try {
        if (context.userId) {
          const db = getDb();
          // Prefer user's currentSessionId
          const current = await db
            .select({ currentSessionId: users.currentSessionId })
            .from(users)
            .where(eq(users.id, context.userId))
            .limit(1);
          currentSessionId = current?.[0]?.currentSessionId || null;
          // Fallback: latest active patient session
          if (!currentSessionId) {
            const latestActive = await db
              .select({ id: patientSessions.id })
              .from(patientSessions)
              .where(and(eq(patientSessions.userId, context.userId), eq(patientSessions.status, 'active'), isNull(patientSessions.deletedAt)))
              .orderBy(desc(patientSessions.createdAt))
              .limit(1);
            currentSessionId = latestActive?.[0]?.id || null;
          }
        }
      } catch {}

      await trackPerplexityUsage(
        { userId: context.userId, sessionId: currentSessionId || undefined },
        inputTokens,
        outputTokens,
        1, // 1 request
        'low', // Assume low context size for now
      );
    } catch (error) {
      console.warn('[Chat] Failed to track Perplexity cost:', error);
    }

    return NextResponse.json({ response: cleanedContent, citations: citationsPayload });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process chat request',
      },
      { status: 500 },
    );
  }
}
