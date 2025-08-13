import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const q = (body.q as string | undefined)?.trim() || '';
    const topK = Math.min(Number(body.topK ?? 5), 8);

    if (!q) {
      return NextResponse.json({ summary: '', references: [] }, { status: 200 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';
    const searchUrl = new URL('/api/nz-med-search/query', origin);
    searchUrl.searchParams.set('q', q);
    searchUrl.searchParams.set('perPage', String(topK));
    searchUrl.searchParams.set('withSnippet', 'true');

    const res = await fetch(searchUrl.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Search upstream failed');
    const data = (await res.json()) as { items: Array<{ title: string; url: string; snippet?: string }>; };

    const contextBlocks = data.items.map((it, i) => `[#${i + 1}] ${it.title}\n${it.url}\n${it.snippet ?? ''}`).join('\n\n');

    const prompt = `You are assisting NZ clinicians. Using ONLY the referenced content below, write a concise answer (<=150 words) and include inline numeric citations like [1], [2] matching the sources. If unsure, say so.

References:\n${contextBlocks}`;

    const chat = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You answer with concise, factual clinical guidance and numeric citations.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 400,
    });

    const summary = chat.choices[0]?.message?.content ?? '';
    const references = data.items.map((it, i) => ({ id: i + 1, title: it.title, url: it.url }));

    return NextResponse.json({ summary, references }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Summarization failed', details: err?.message }, { status: 500 });
  }
}