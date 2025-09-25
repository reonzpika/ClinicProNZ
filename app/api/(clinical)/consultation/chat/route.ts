import { NextResponse } from 'next/server';

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

// System prompt for NZ GP clinical assistant with structured output and citations
const CHATBOT_SYSTEM_PROMPT = `You are a clinical AI assistant for New Zealand General Practitioners (GPs).

Output format (follow exactly):
- Start with 3–6 bullet points, each \u226412 words, telegraphic, easy to scan. Do NOT include numeric citation markers in these bullets. Do NOT write a heading like "SHORT ANSWER:".
- Do NOT include a SOURCES section or any list of links at the end.

Strictly do NOT include any follow-up questions.

Citation policy:
- Prefer New Zealand sources. Prioritise domains ending with .nz, .org.nz, .co.nz (e.g., bpac.org.nz, tewhatuora.govt.nz/health.govt.nz, healthify.nz, starship.org.nz, medsafe.govt.nz). Use these wherever applicable.
- If suitable NZ pages are unavailable, use trusted international clinical resources (e.g., nice.org.uk, cochranelibrary.com, who.int, cdc.gov, ema.europa.eu).
- Use specific guideline/article pages (not homepages). Always include HTTPS URL. Avoid news sites, general blogs, forums, or opinion pieces.

Clinical style:
- Professional, clear, GP-focused. Support safe reasoning; avoid definitive diagnoses. Flag red flags and referral triggers when appropriate.
- When consultation context is provided, adapt advice to that scenario.
- Be concise.
`;

const CONSULTATION_CONTEXT_PREFIX = `

CONSULTATION CONTEXT:
The following consultation note provides clinical context for this conversation:

---
`;

const CONSULTATION_CONTEXT_SUFFIX = `
---

Please use this consultation context to provide relevant, specific guidance for this clinical scenario.`;

export async function POST(req: Request) {
  try {
    const { messages, consultationNote, useContext, rawConsultationData } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Messages array is required' },
        { status: 400 },
      );
    }

    // Build system prompt with context based on two-phase logic
    let systemPrompt = CHATBOT_SYSTEM_PROMPT;

    if (useContext) {
      if (consultationNote && consultationNote.trim()) {
        // Phase 2: Generated notes exist - use only the structured notes
        systemPrompt += CONSULTATION_CONTEXT_PREFIX + consultationNote + CONSULTATION_CONTEXT_SUFFIX;
      } else if (rawConsultationData) {
        // Phase 1: No generated notes - use raw consultation data
        let rawContext = '';

        if (rawConsultationData.transcription && rawConsultationData.transcription.trim()) {
          rawContext += `TRANSCRIPTION:\n${rawConsultationData.transcription}\n\n`;
        }

        if (rawConsultationData.typedInput && rawConsultationData.typedInput.trim()) {
          rawContext += `TYPED INPUT:\n${rawConsultationData.typedInput}\n\n`;
        }

        if (rawContext.trim()) {
          systemPrompt += `

RAW CONSULTATION DATA:
The following raw consultation data provides clinical context for this conversation:

---
${rawContext.trim()}
---

Please use this raw consultation data to provide relevant guidance. This is unstructured consultation information that may need clarification or organisation.`;
        }
      }
    }

    // Prepare messages for Perplexity API
    const pplxMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
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

    // Extract citation metadata from various possible locations
    let citations: Array<{ url?: string; title?: string }> = [];
    if (Array.isArray(pplxJson?.citations)) citations = pplxJson.citations;
    if (!citations.length && Array.isArray(pplxJson?.choices?.[0]?.message?.citations)) {
      citations = pplxJson.choices[0].message.citations;
    }
    if (!citations.length && Array.isArray(pplxJson?.choices?.[0]?.citations)) {
      citations = pplxJson.choices[0].citations;
    }
    if (!citations.length && Array.isArray(pplxJson?.metadata?.citations)) {
      citations = pplxJson.metadata.citations;
    }

    // Clean main content: remove label lines and inline numeric markers like [1]
    const cleanedContent = (content || '')
      .split('\n')
      .filter((line: string) => {
        const upper = line.trim().toUpperCase();
        if (upper.startsWith('SHORT ANSWER:')) return false;
        if (upper.startsWith('FOLLOW-UPS:')) return false;
        if (upper === 'SOURCES:') return false;
        return true;
      })
      .map((line: string) => line.replace(/\s*\[\d+\]/g, ''))
      .join('\n')
      .trim();

    // Prepare all unique citations with sanitised HTTPS URLs (no cap)
    const seen = new Set<string>();
    const topCitations: Array<{ index: number; url: string; title: string }> = [];
    for (const c of citations || []) {
      const urlMatch = typeof c?.url === 'string' ? c.url : (typeof (c as any) === 'string' ? (c as any) : undefined);
      if (!urlMatch) continue;
      const cleaned = sanitiseUrl(urlMatch);
      if (!cleaned) continue;
      if (seen.has(cleaned)) continue;
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

    function escapeTitle(t: string): string {
      return t.replace(/"/g, '\\"');
    }

    // Insert inline citations: one per paragraph or bullet, cycling through sources
    function insertInlineCitations(text: string): string {
      if (topCitations.length === 0) return text;
      const lines: string[] = text.split('\n');
      const out: string[] = [];
      let srcIdx = 0;
      for (let i = 0; i < lines.length; i++) {
        let line: string = lines[i] ?? '';
        const trimmed = line.trim();
        const nextLine: string = i + 1 < lines.length ? (lines[i + 1] ?? '') : '';
        const nextTrim = nextLine.trim();
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const isParagraphEnd = trimmed !== '' && !isBullet && (i + 1 === lines.length || nextTrim === '');
        if (isBullet || isParagraphEnd) {
          const idx = srcIdx % topCitations.length;
          const src = topCitations[idx];
          srcIdx++;
          if (src) {
            line = `${line} [${src.index}](${src.url} "${escapeTitle(src.title)}")`;
          }
        }
        out.push(line);
      }
      return out.join('\n');
    }

    const finalResponse = insertInlineCitations(cleanedContent);

    return NextResponse.json({ response: finalResponse });
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
