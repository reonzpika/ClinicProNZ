import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { searchSimilarDocuments } from '@/src/lib/rag';
import { EnhancedHealthifyScraper } from '@/src/lib/scrapers/enhanced-healthify-scraper';
import { checkEnhancementStatus } from '@/src/lib/scrapers/enhancement-utils';
import { correctMedicalTypos } from '@/src/lib/utils/typo-correction';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type SearchResult = {
  title: string;
  source: string;
  content: string[];
  score: number;
};

type SearchResponse = {
  results: SearchResult[];
  message?: string;
  enhancing?: boolean;
  enhancedCount?: number;
};

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
    console.log(`[SEARCH DEBUG] Original query: "${query}", Corrected: "${correctedQuery}", User tier: ${userTier}`);

    // Search existing database for relevant articles
    const allResults = await searchSimilarDocuments(correctedQuery, 15, 0.4); // Cast wider net
    const healthifyResults = allResults.filter(result => result.sourceType === 'healthify');
    console.log(`[SEARCH DEBUG] Found ${allResults.length} total results, ${healthifyResults.length} from healthify`);

    if (healthifyResults.length === 0) {
      return NextResponse.json({
        results: [],
        message: 'No relevant information found. Try a different search term.',
      });
    }

    // Check enhancement status and enhance up to 10 articles if needed
    let enhancedCount = 0;
    let enhancingMessage = '';

    const topResults = healthifyResults.slice(0, 10);
    const articlesToEnhance = await checkEnhancementStatus(topResults);

    let searchResults: typeof healthifyResults;

    if (articlesToEnhance.length > 0) {
      enhancingMessage = `🔍 Building comprehensive knowledge base for "${query}"... This will take about ${Math.ceil(articlesToEnhance.length * 2)} seconds.`;
      console.log(`[SEARCH DEBUG] Enhancing ${articlesToEnhance.length} articles`);

      const scraper = new EnhancedHealthifyScraper();
      for (const article of articlesToEnhance) {
        try {
          await scraper.scrapeAndIngest(article.source);
          enhancedCount++;
          console.log(`[SEARCH DEBUG] Enhanced article: ${article.title}`);
        } catch (error) {
          console.error(`[SEARCH DEBUG] Failed to enhance ${article.source}:`, error);
        }
      }

      // Re-search after enhancement to get updated content
      const enhancedResults = await searchSimilarDocuments(correctedQuery, 10, 0.4);
      const updatedHealthifyResults = enhancedResults.filter(result => result.sourceType === 'healthify');
      console.log(`[SEARCH DEBUG] After enhancement: ${updatedHealthifyResults.length} results available`);

      // Use enhanced results
      searchResults = updatedHealthifyResults.slice(0, 3);
    } else {
      // Use existing results
      searchResults = topResults.slice(0, 3);
    }

    if (searchResults.length === 0) {
      console.log(`[SEARCH DEBUG] No results found for "${correctedQuery}"`);
      return NextResponse.json({
        results: [],
        message: 'No relevant information found. Try a different search term.',
      });
    }

    console.log(`[SEARCH DEBUG] Processing ${searchResults.length} results with OpenAI`);

    // Format results for OpenAI processing - use summaries if available
    const contextData = searchResults
      .map((result, index) => {
        // Try to use structured content first, fall back to raw content
        const contentToUse = result.content; // Note: We'll need to access overallSummary from DB if available
        return `Document ${index + 1}:\nTitle: ${result.title}\nURL: ${result.source}\nContent: ${contentToUse}\n`;
      })
      .join('\n---\n');

    // Create system prompt for bullet point formatting
    const systemPrompt = `You are a clinical information assistant. Your task is to create concise bullet points from medical content.

Instructions:
- Extract 2-4 key bullet points from each document provided
- Each bullet point should be 1-2 sentences maximum
- Focus on clinically relevant information (symptoms, treatments, recommendations)
- Use NZ English spelling
- Be factual and avoid speculation
- Do not include URLs or source references in the bullet points

Format your response as a JSON array with this structure:
[
  {
    "title": "Document title",
    "source": "Document URL", 
    "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
    "score": similarity_score
  }
]

Context Data:
${contextData}`;

    // Get formatted results from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Format the above documents into bullet points for the query: "${query}". 
          
          Return ONLY valid JSON without any markdown formatting or code blocks.`,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return NextResponse.json(
        { error: 'Failed to process search results' },
        { status: 500 },
      );
    }

    try {
      // Parse OpenAI response as JSON (handle markdown wrapping)
      let jsonString = response.trim();

      // Remove markdown code block formatting if present
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      console.log(`[SEARCH DEBUG] Parsing JSON response: ${jsonString.substring(0, 100)}...`);
      const formattedResults = JSON.parse(jsonString);

      // Handle different response structures from OpenAI
      let resultsArray = formattedResults;
      if (formattedResults.results) {
        resultsArray = formattedResults.results;
      } else if (formattedResults.result) {
        resultsArray = formattedResults.result;
      } else if (!Array.isArray(formattedResults)) {
        console.error('[SEARCH DEBUG] Unexpected JSON structure:', formattedResults);
        throw new Error('Invalid response format from OpenAI');
      }

      console.log(`[SEARCH DEBUG] Processing ${resultsArray.length} formatted results`);

              // Validate and enhance results with scores
        const results: SearchResult[] = resultsArray.map((result: any, index: number) => ({
          title: result.title || searchResults[index]?.title || 'Untitled',
          source: result.source || searchResults[index]?.source || '',
          content: Array.isArray(result.content) ? result.content : ['Information not available'],
          score: searchResults[index]?.score || 0,
        })).slice(0, 3); // Ensure max 3 results

                  const response: SearchResponse = {
              results,
              message: enhancedCount > 0 ? `✅ Enhanced ${enhancedCount} articles with detailed medical summaries` : undefined,
            };

            return NextResponse.json(response);
          } catch (parseError) {
            console.error('Failed to parse OpenAI response:', parseError);

            // Fallback: return raw results with basic formatting
            const fallbackResults: SearchResult[] = searchResults.map(result => ({
              title: result.title,
              source: result.source,
              content: [`${result.content.slice(0, 200)}...`], // Truncate content
              score: result.score,
            })).slice(0, 3);

            const response: SearchResponse = {
              results: fallbackResults,
              message: enhancedCount > 0 ? `✅ Enhanced ${enhancedCount} articles (using fallback formatting)` : undefined,
            };

            return NextResponse.json(response);
          }
  } catch (error) {
    console.error('Search error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred during search' },
      { status: 500 },
    );
  }
}
