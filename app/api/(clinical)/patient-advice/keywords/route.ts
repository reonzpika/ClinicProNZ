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
  // New priority based on user rules: diagnoses (max 3) → symptom labels (if needed) → screenings/vaccinations/self-care → other
  const diagnoses: string[] = Array.isArray(parsed?.diagnoses) ? parsed.diagnoses : [];
  const otherDiagnoses: string[] = Array.isArray(parsed?.otherDiagnoses) ? parsed.otherDiagnoses : [];
  const symptomLabels: string[] = Array.isArray(parsed?.symptomLabels) ? parsed.symptomLabels : [];
  const screenings: string[] = Array.isArray(parsed?.related?.screenings) ? parsed.related.screenings : [];
  const vaccinations: string[] = Array.isArray(parsed?.related?.vaccinations) ? parsed.related.vaccinations : [];
  const selfCare: string[] = Array.isArray(parsed?.related?.selfCare) ? parsed.related.selfCare : [];
  const suggested: string[] = Array.isArray(parsed?.topKeywords) ? parsed.topKeywords : [];

  const primaryDiagnoses = uniqLimit(diagnoses, 3);
  const fillWithSymptoms = primaryDiagnoses.length < 3 ? uniqLimit(symptomLabels, 3 - primaryDiagnoses.length) : [];
  const supportive = uniqLimit([...screenings, ...vaccinations, ...selfCare], 5);

  const ordered = [primaryDiagnoses, fillWithSymptoms, supportive, otherDiagnoses, suggested].flat();
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

    const system = `Identify patient-friendly diagnoses and closely related patient topics from clinical notes for search.

Output STRICT JSON only. Use this schema (omit nothing; use empty arrays when absent):
{
  "diagnoses": string[],               // primary current/past problems and suspected diagnoses; patient-friendly, NZ spelling, singular; collapse subtypes unless anatomically specific (e.g., "breast pain")
  "otherDiagnoses": string[],          // additional diagnoses beyond the top 1–3
  "symptomLabels": string[],           // use symptoms (e.g., "headache") if no diagnoses are present
  "related": {
    "screenings": string[],            // e.g., "cervical screening"
    "vaccinations": string[],          // e.g., "flu vaccine", "covid vaccine"
    "selfCare": string[]               // e.g., "sleep hygiene", "jet lag management"
  },
  "topKeywords": string[]              // 3–5 best terms prioritising diagnoses (max 3), then symptom labels, then screenings/vaccinations/self-care
}

Rules:
- Include current consultation problems and past medical history; include suspected/provisional diagnoses.
- If no diagnosis is explicit, symptom-only labels are acceptable.
- Infer likely diagnosis from medicines when reasonable (e.g., "citalopram" → "anxiety" or "depression").
- Patient-friendly terms; NZ spelling; singular; 1–3 words; no qualifiers (no severity, laterality, timeframe). Keep anatomical specificity when it changes meaning (e.g., "breast pain").
- Dedupe terms; keep total unique terms ≤ 10.`.trim();

    const user = `Extract diagnoses from this clinical note. Be flexible: include suspected diagnoses and past medical problems if relevant. If diagnoses are unclear, provide symptom labels. Also add useful patient topics such as screenings, vaccinations, or self-care.

Return JSON only per the schema above.

NOTE:
${noteText}`;

    let resp: any = null;
    try {
      resp = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.1,
        max_tokens: 400,
      });
    } catch (e: any) {
      // Fallback to a widely available small model if the requested model is unavailable
      const altModel = 'gpt-4o-mini';
      try {
        resp = await openai.chat.completions.create({
          model: altModel,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.1,
          max_tokens: 400,
        });
      } catch (e2: any) {
        console.error('[PatientAdvice] Keyword extraction failed', { error: e2?.message || String(e2) });
        return NextResponse.json({ error: 'Keyword extraction failed' }, { status: 503 });
      }
    }

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
  } catch (error: any) {
    console.error('[PatientAdvice] Keywords endpoint error', { error: error?.message || String(error) });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

