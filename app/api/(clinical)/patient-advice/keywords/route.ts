// @ts-nocheck
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';
import { cacheGet, cacheSet, hoursToSeconds } from '@/src/lib/cache/redis';

type KeywordsResponse = {
  keywords: string[];
  debug?: { parsed?: any };
};

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey, timeout: 30000 });
}

function normalise(term: string): string {
  return String(term || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s\-]/g, '')
    .replace(/\s+/g, ' ');
}

function uniqLimit(arr: string[], cap: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of arr) {
    const n = normalise(t);
    if (!n) continue;
    if (seen.has(n)) continue;
    out.push(n);
    seen.add(n);
    if (out.length >= cap) break;
  }
  return out;
}

function selectKeywords(parsed: any, cap: number): string[] {
  // Prioritise complaint → medications → diagnoses → nonMed → screenings → other
  const complaints = Array.isArray(parsed?.complaints) ? parsed.complaints : [];
  const meds = Array.isArray(parsed?.treatments?.medications) ? parsed.treatments.medications : [];
  const diagnoses = Array.isArray(parsed?.diagnoses) ? parsed.diagnoses : [];
  const nonMed = Array.isArray(parsed?.treatments?.nonMed) ? parsed.treatments.nonMed : [];
  const screenings = Array.isArray(parsed?.screenings) ? parsed.screenings : [];
  const other = Array.isArray(parsed?.other) ? parsed.other : [];
  const suggested = Array.isArray(parsed?.topKeywords) ? parsed.topKeywords : [];

  const ordered = [suggested, complaints, meds, diagnoses, nonMed, screenings, other].flat();
  return uniqLimit(ordered, cap);
}

export async function POST(req: Request) {
  try {
    const context = await extractRBACContext(req);
    const permission = await checkCoreAccess(context);
    if (!permission.allowed) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { note, max = 10 } = await req.json();
    const noteText: string = String(note || '').slice(0, 20000);
    if (!noteText.trim()) {
      return NextResponse.json({ keywords: [] } satisfies KeywordsResponse);
    }

    const cap = Math.max(1, Math.min(10, Number(max) || 10));
    const ttlHrs = Number(process.env.SEARCH_CACHE_TTL_HOURS || '72');
    const ttl = hoursToSeconds(ttlHrs);
    const cacheKey = `advice:kw:v2:${Buffer.from(noteText).toString('base64').slice(0, 64)}:cap:${cap}`;

    const cached = await cacheGet<KeywordsResponse>(cacheKey);
    if (cached && Array.isArray(cached.keywords)) {
      return NextResponse.json(cached);
    }

    const openai = getOpenAI();
    const model = process.env.PATIENT_ADVICE_MODEL || 'gpt-5-mini';

    const system = `You extract concise, patient-friendly search keywords from clinical notes to find content on healthify.nz.
Rules:
- Output STRICT JSON only. No prose. Use this schema:
  {
    "complaints": string[],
    "diagnoses": string[],
    "treatments": { "medications": string[], "nonMed": string[] },
    "screenings": string[],
    "other": string[],
    "topKeywords": string[]
  }
- Make terms lay-friendly, lowercase; prefer common NZ phrasing.
- If a category is absent in the note, return an empty array for it.
- Map clinical terms to patient terms when suitable:
  - "cervical swab" → "cervical screening"
  - "gastro-oesophageal reflux" → "heartburn" (if appropriate)
- Keep 1–3 words per keyword; no punctuation; dedupe.`.trim();

    const user = `Extract search terms from this clinical note.
Focus on: presenting complaint, diagnoses, treatments (medications and non-med), and relevant screenings.
Also include helpful related terms if explicit items are missing.
Return 3–5 best terms in "topKeywords", but include up to 10 in total across fields.

NOTE:
${noteText}`;

    const resp = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.1,
      max_tokens: 400,
    });

    const content = resp?.choices?.[0]?.message?.content || '';
    let parsed: any = null;
    try {
      // Try direct JSON parse
      parsed = JSON.parse(content);
    } catch {
      // Fallback: find first JSON object substring
      const m = content.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch {}
      }
    }

    let keywords: string[] = [];
    if (parsed) {
      keywords = selectKeywords(parsed, cap);
    }

    // Final guard: if empty, fallback to naive split on newlines/commas
    if (!Array.isArray(keywords) || keywords.length === 0) {
      const rough = content
        .toLowerCase()
        .replace(/[^a-z0-9\s,\-]/g, ' ')
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(Boolean);
      keywords = uniqLimit(rough, cap);
    }

    const response: KeywordsResponse = { keywords, debug: { parsed: parsed || null } };
    await cacheSet(cacheKey, response, ttl);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ keywords: [] } satisfies KeywordsResponse, { status: 200 });
  }
}

