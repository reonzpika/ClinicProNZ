import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { formatContextForRag, searchSimilarDocuments } from '@/src/lib/rag';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has standard tier or higher (basic users can't use RAG)
    const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';
    if (userTier === 'basic') {
      return NextResponse.json({ error: 'Standard tier or higher required' }, { status: 403 });
    }

    // Parse request body
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return new Response('Query is required', { status: 400 });
    }

    // Search for relevant documents
    const relevantDocs = await searchSimilarDocuments(query, 5, 0.7);
    const context = formatContextForRag(relevantDocs);

    // Create system prompt for NZ clinical context
    const systemPrompt = `You are a clinical assistant for New Zealand GPs and healthcare professionals. 

Instructions:
- Answer based ONLY on the provided context from NZ clinical guidelines
- Always cite sources using the format: [Source Title](URL)
- If no relevant information is found, state this clearly
- Use NZ medical terminology and spelling
- Be concise but thorough
- Focus on evidence-based recommendations

Context Information:
${context}`;

    // Create AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 0.1, // Low temperature for factual responses
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return new Response('No response from AI', { status: 500 });
    }

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('RAG query error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
