import { NextResponse } from 'next/server';

// Perplexity API configuration
const PPLX_API_URL = 'https://api.perplexity.ai/chat/completions';
function getPerplexityConfig() {
  const apiKey = process.env.PPLX_API_KEY;
  if (!apiKey) {
    throw new Error('Missing PPLX_API_KEY');
  }
  const model = process.env.PPLX_MODEL || 'sonar-small-online';
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

function createSourceFilter(controller: ReadableStreamDefaultController<Uint8Array>) {
  const encoder = new TextEncoder();
  let buffer = '';
  let inSources = false;
  let lastLineWasBlank = false;
  let sourcesProcessed = 0;
  const maxSources = 3;

  function emit(text: string) {
    if (!text) return;
    controller.enqueue(encoder.encode(text));
  }

  async function processLine(line: string) {
    // Strip unwanted headings if present
    if (line.trim().toUpperCase().startsWith('SHORT ANSWER:')) {
      return; // drop label line
    }
    if (line.trim().toUpperCase().startsWith('FOLLOW-UPS:')) {
      return; // drop label line
    }

    if (!inSources) {
      const trimmed = line.trim();
      // Drop any standalone question lines (no follow-ups allowed)
      if (trimmed.endsWith('?')) {
        // ensure a single blank line before SOURCES later
        if (!lastLineWasBlank) emit('\n');
        lastLineWasBlank = true;
        return;
      }

      // When encountering SOURCES, ensure a blank line before label
      if (trimmed === 'SOURCES:') {
        if (!lastLineWasBlank) {
          emit('\n');
        }
        inSources = true;
        emit('SOURCES:' + '\n');
        lastLineWasBlank = false;
        return;
      }

      // Remove inline numeric citation markers like [1], [2] from answer bullets
      if (trimmed) {
        const cleanedLine = line.replace(/\s*\[\d+\]/g, '');
        emit(cleanedLine + '\n');
        lastLineWasBlank = cleanedLine.trim() === '';
        return;
      }

      emit(line + '\n');
      lastLineWasBlank = trimmed === '';
      return;
    }

    if (sourcesProcessed >= maxSources) {
      // pass through remaining lines after cap
      emit(line + '\n');
      return;
    }

    // Validate URLs in source lines; replace disallowed or unreachable URLs
    const urlMatch = line.match(/https?:\/\/\S+/);
    if (!urlMatch) {
      emit(line + '\n');
      return;
    }
    const originalUrl = urlMatch[0];
    const cleaned = sanitiseUrl(originalUrl);
    if (cleaned) {
      if (cleaned !== originalUrl) {
        const replaced = line.replace(originalUrl, cleaned);
        emit(replaced + '\n');
      } else {
        emit(line + '\n');
      }
      sourcesProcessed += 1;
    } else {
      const replaced = line.replace(originalUrl, '(removed invalid source)');
      emit(replaced + '\n');
      sourcesProcessed += 1;
    }
  }

  return {
    async write(chunk: string) {
      buffer += chunk;
      let idx;
      while ((idx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        await processLine(line);
      }
    },
    async end() {
      if (buffer) {
        await processLine(buffer);
        buffer = '';
      }
    },
  };
}

// System prompt for NZ GP clinical assistant with structured output and citations
const CHATBOT_SYSTEM_PROMPT = `You are a clinical AI assistant for New Zealand General Practitioners (GPs).

Output format (follow exactly):
- Start with 3–6 bullet points that directly answer the question. Use terse keywords/phrases. Do NOT include numeric citation markers in these bullets. Do NOT write a heading like "SHORT ANSWER:".
- Then a blank line, then the line "SOURCES:" followed by all relevant sources, each on its own line in the format: Title — https://domain/path

Strictly do NOT include any follow-up questions.

Citation policy:
- Prefer New Zealand sources (e.g., bpac.org.nz, tewhatuora.govt.nz/health.govt.nz, healthify.nz, starship.org.nz, medsafe.govt.nz) over international where applicable.
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
        return true;
      })
      .map((line: string) => line.replace(/\s*\[\d+\]/g, ''))
      .join('\n')
      .trim();

    // Build SOURCES block from all citation metadata URLs (no cap)
    const seen = new Set<string>();
    const sourceLines: string[] = [];
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
      sourceLines.push(`${title} — ${cleaned}`);
    }

    const finalResponse = sourceLines.length
      ? `${cleanedContent}\n\nSOURCES:\n${sourceLines.join('\n')}`
      : cleanedContent;

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
