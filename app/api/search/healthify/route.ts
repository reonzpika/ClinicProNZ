import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { searchSimilarDocuments } from '@/src/lib/rag';
import { correctMedicalTypos } from '@/src/lib/utils/typo-correction';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type SearchResponse = {
  paragraph?: string;
  sources: Array<{ title: string; url: string; index: number }>;
  message?: string;
  error?: string;
};

/**
 * Enhance search query using LLM for better semantic matching
 */
async function enhanceSearchQuery(query: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Improve this medical search query to find more relevant information. Add related medical terms, symptoms, conditions, and treatments. Keep it concise but comprehensive for semantic search.

Original query: "${query}"

Return only the enhanced search terms, separated by spaces. Focus on medical terminology and related concepts.`,
      }],
      temperature: 0.1,
    });

    const enhancedQuery = completion.choices[0]?.message?.content?.trim();
    return enhancedQuery || query; // Fallback to original if enhancement fails
  } catch (error) {
    console.error('[SEARCH] Query enhancement failed:', error);
    return query; // Fallback to original query
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has standard tier or higher (basic users can't use search)
    const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';
    if (userTier === 'basic') {
      return NextResponse.json({
        error: 'Standard tier or higher required for clinical search',
      }, { status: 403 });
    }

    // Parse request body
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 },
      );
    }

    // Apply typo correction to improve search results
    const correctedQuery = correctMedicalTypos(query.trim());
    console.log(`[SEARCH DEBUG] Original query: "${query}", Corrected: "${correctedQuery}"`);

    // Enhance query with LLM for better semantic search
    const enhancedQuery = await enhanceSearchQuery(correctedQuery);
    console.log(`[SEARCH DEBUG] Enhanced query: "${enhancedQuery}"`);

    // Search existing database for relevant articles using enhanced query
    const allResults = await searchSimilarDocuments(enhancedQuery, 10, 0.5); // More targeted search
    const healthifyResults = allResults.filter(result => result.sourceType === 'healthify');
    console.log(`[SEARCH DEBUG] Found ${allResults.length} total results, ${healthifyResults.length} from healthify`);

    if (healthifyResults.length === 0) {
      return NextResponse.json({
        paragraph: '',
        sources: [],
        message: 'No relevant information found. Try a different search term.',
      });
    }

    // Use top 5 results for paragraph synthesis (all articles are pre-enhanced)
    const searchResults = healthifyResults.slice(0, 5);
    console.log(`[SEARCH DEBUG] Using ${searchResults.length} pre-enhanced results for synthesis`);

    if (searchResults.length === 0) {
      console.log(`[SEARCH DEBUG] No results found for "${enhancedQuery}"`);
      return NextResponse.json({
        paragraph: '',
        sources: [],
        message: 'No relevant information found. Try a different search term.',
      });
    }

    console.log(`[SEARCH DEBUG] Processing ${searchResults.length} results with OpenAI for paragraph synthesis`);

    // Format results for OpenAI processing
    const contextData = searchResults
      .map((result, index) => {
        return `[${index + 1}] ${result.title}\n${result.content}\n`;
      })
      .join('\n---\n');

    // Create system prompt for paragraph synthesis
    const systemPrompt = `You are a clinical information assistant. Your task is to synthesise medical information into a single coherent paragraph.

Instructions:
- Write approximately 150 words in a single paragraph
- Focus on content most relevant to the user's query: "${query}"
- Use inline numbered citations [1][2] at the end of sentences
- Each citation number corresponds to the source document number
- Use NZ English spelling (e.g., recognise, colour, centre)
- Be factual and evidence-based
- Write in professional but accessible language suitable for healthcare providers
- Prioritise clinically relevant information (symptoms, causes, treatments, management)

Return only the paragraph text with inline citations. Do not include any JSON formatting or additional structure.

Available sources:
${contextData}`;

    // Get synthesised paragraph from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Synthesise the medical information above into a coherent paragraph about "${query}". Use inline citations [1][2] to reference the sources.`,
        },
      ],
      temperature: 0.2,
    });

    const paragraph = completion.choices[0]?.message?.content?.trim();
    if (!paragraph) {
      return NextResponse.json({
        paragraph: '',
        sources: [],
        error: 'Failed to process search results',
      }, { status: 500 });
    }

    // Create sources array with citation indices
    const sources = searchResults.map((result, index) => ({
      title: result.title,
      url: result.source,
      index: index + 1,
    }));

    console.log(`[SEARCH DEBUG] Generated paragraph with ${sources.length} sources`);

    const searchResponse: SearchResponse = {
      paragraph,
      sources,
    };

    return NextResponse.json(searchResponse);
  } catch (error) {
    console.error('Search error:', error);

    if (error instanceof Error) {
      return NextResponse.json({
        paragraph: '',
        sources: [],
        error: error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      paragraph: '',
      sources: [],
      error: 'An unexpected error occurred during search',
    }, { status: 500 });
  }
}
