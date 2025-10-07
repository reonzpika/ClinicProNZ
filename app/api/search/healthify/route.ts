import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { searchSimilarDocuments } from '@/src/lib/rag';
import { correctMedicalTypos } from '@/src/lib/utils/typo-correction';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey });
}

type SearchResponse = {
  paragraph?: string; // For summary mode
  sources: Array<{ title: string; url: string; index: number }>; // For summary mode
  titles?: Array<{ title: string; url: string }>; // For list mode
  message?: string;
  error?: string;
};

/**
 * Intelligently select most relevant sources using a fast LLM
 */
async function selectRelevantSources(
  query: string,
  healthifyResults: any[],
): Promise<number[]> {
  try {
    // Take top 5 candidates for selection (matching our database limit)
    const candidates = healthifyResults.slice(0, 5);

    // Create summaries for selection - only overallSummary content
    const sourceSummaries = candidates
      .map((result, index) => {
        const summary = result.overallSummary || result.content?.substring(0, 200) || 'No summary available';
        return `[${index}] ${summary}`;
      })
      .join('\n\n');

    console.log(`[SEARCH DEBUG] Selection stage: Reviewing ${candidates.length} candidates for "${query}"`);
    console.log(`[SEARCH DEBUG] LLM input format per article: [index] overallSummary_content`);
    console.log(`[SEARCH DEBUG] Total LLM input size: ~${sourceSummaries.length} characters`);

    const llmSelectionStart = performance.now();
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: process.env.SEARCH_SELECTION_MODEL || 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Select 1-5 most relevant articles for medical query: "${query}"

Review these article summaries and select the most relevant ones that:
- Directly address the query topic
- Provide complementary information (avoid redundant content)  
- Cover different aspects (causes, symptoms, treatments, management)

Article summaries to review:
${sourceSummaries}

Return only a JSON object with selected indices:
{"selected": [0, 2, 4]}`,
      }],
      response_format: { type: 'json_object' },
    });

    const llmSelectionEnd = performance.now();
    console.log(`[SEARCH TIMING] LLM selection call: ${Math.round(llmSelectionEnd - llmSelectionStart)}ms`);

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) {
 throw new Error('Empty response from selection model');
}

    const parsed = JSON.parse(response);
    const selectedIndices = parsed.selected || [];

    // Validate selection (ensure indices are within range and reasonable count)
    const validIndices = selectedIndices
      .filter((idx: number) => typeof idx === 'number' && idx >= 0 && idx < candidates.length)
      .slice(0, 5); // Cap at 5 sources max

    if (validIndices.length === 0) {
 throw new Error('No valid selections returned');
}

    console.log(`[SEARCH DEBUG] Selection complete: Selected ${validIndices.length} sources from ${candidates.length} candidates`);
    console.log(`[SEARCH DEBUG] Selected indices: [${validIndices.join(', ')}]`);

    return validIndices;
  } catch (error) {
    console.error('[SEARCH] Source selection failed:', error);
    // Fallback: return top 3 indices
    console.log('[SEARCH DEBUG] Fallback: Using top 3 sources');
    return [0, 1, 2].slice(0, Math.min(3, healthifyResults.length));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Note: Tier restrictions removed per legacy RBAC policy - all authenticated users have access

    // Parse request body
    const { query, mode = 'list' } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 },
      );
    }

    // Start overall timing
    const overallStart = performance.now();

    // Apply typo correction to improve search results
    const correctedQuery = correctMedicalTypos(query.trim());
    console.log(`[SEARCH DEBUG] Original query: "${query}", Corrected: "${correctedQuery}"`);

    // Step 1: Database search
    console.log(`[SEARCH DEBUG] === STEP 1: DATABASE SEARCH ===`);
    console.log(`[SEARCH DEBUG] Input query for vector search: "${correctedQuery}"`);
    console.log(`[SEARCH DEBUG] Search parameters: limit=5, threshold=0.4, embedding_model=text-embedding-3-small`);

    const searchStart = performance.now();
    const allResults = await searchSimilarDocuments(correctedQuery, 5, 0.4);
    const healthifyResults = allResults.filter(result => result.sourceType === 'healthify');
    const searchEnd = performance.now();

    console.log(`[SEARCH TIMING] Database search: ${Math.round(searchEnd - searchStart)}ms`);
    console.log(`[SEARCH DEBUG] Database query results: ${allResults.length} total, ${healthifyResults.length} from healthify`);
    console.log(`[SEARCH DEBUG] Database fields retrieved: id, title, content, source, sourceType, score, sectionSummaries, overallSummary, sections, enhancementStatus`);
    console.log(`[SEARCH DEBUG] Top 3 scores: [${healthifyResults.slice(0, 3).map(r => r.score?.toFixed(3)).join(', ')}]`);

    if (healthifyResults.length === 0) {
      const overallEnd = performance.now();
      console.log(`[SEARCH TIMING] TOTAL: ${Math.round(overallEnd - overallStart)}ms`);
      return NextResponse.json({
        paragraph: '',
        sources: [],
        titles: [],
        message: 'No relevant information found. Try a different search term.',
      });
    }

    // Branch based on mode
    if (mode === 'list') {
      // LIST MODE: Return top 5 titles only (no LLM processing)
      console.log(`[SEARCH DEBUG] === LIST MODE: Returning top 5 titles only ===`);

      const titles = healthifyResults.slice(0, 5).map(result => ({
        title: result.title,
        url: result.source,
      }));

      const overallEnd = performance.now();
      console.log(`[SEARCH TIMING] ===== PERFORMANCE SUMMARY (LIST MODE) =====`);
      console.log(`[SEARCH TIMING] Database search: ${Math.round(searchEnd - searchStart)}ms (100%)`);
      console.log(`[SEARCH TIMING] TOTAL: ${Math.round(overallEnd - overallStart)}ms`);
      console.log(`[SEARCH TIMING] DATABASE ACCESSES: 1 (vector similarity search only)`);
      console.log(`[SEARCH TIMING] LLM API CALLS: 0 (list mode - no LLM processing)`);

      return NextResponse.json({
        titles,
        sources: [],
      });
    }

    // SUMMARY MODE: Full LLM processing pipeline
    console.log(`[SEARCH DEBUG] === SUMMARY MODE: Full LLM processing pipeline ===`);

    // Step 2: Intelligent source selection using GPT-5 nano
    console.log(`[SEARCH DEBUG] === STEP 2: SOURCE SELECTION (NO DATABASE) ===`);
    console.log(`[SEARCH DEBUG] Input: ${healthifyResults.length} database results from Step 1`);
    console.log(`[SEARCH DEBUG] LLM input data: Article titles + overallSummary (first 150 chars each)`);
    console.log(`[SEARCH DEBUG] LLM model: GPT-5 nano, task: Select 1-8 most relevant articles`);
    console.log(`[SEARCH DEBUG] LLM will review: [${healthifyResults.slice(0, 3).map(r => `"${r.title?.substring(0, 30)}..."`).join(', ')}]`);

    const selectionStart = performance.now();
    const selectedIndices = await selectRelevantSources(query, healthifyResults);
    const searchResults = selectedIndices
      .map(index => healthifyResults[index])
      .filter((result): result is NonNullable<typeof result> => result !== undefined);
    const selectionEnd = performance.now();

    console.log(`[SEARCH TIMING] Source selection: ${Math.round(selectionEnd - selectionStart)}ms`);
    console.log(`[SEARCH DEBUG] LLM selection result: Selected ${searchResults.length} sources from ${healthifyResults.length} candidates`);
    console.log(`[SEARCH DEBUG] Selected articles: [${searchResults.map(r => `"${r.title?.substring(0, 25)}..."`).join(', ')}]`);

    if (searchResults.length === 0) {
      console.log(`[SEARCH DEBUG] No results found for "${correctedQuery}"`);
      return NextResponse.json({
        paragraph: '',
        sources: [],
        message: 'No relevant information found. Try a different search term.',
      });
    }

    console.log(`[SEARCH DEBUG] === STEP 3: CONTENT SYNTHESIS (NO DATABASE) ===`);
    console.log(`[SEARCH DEBUG] Input: ${searchResults.length} selected articles from Step 2`);
    console.log(`[SEARCH DEBUG] Content types used: sectionSummaries (≥0.5 score), overallSummary (<0.5), fallback (missing summaries)`);
    console.log(`[SEARCH DEBUG] LLM model: GPT-5 nano, task: Generate 4-6 bullet points with citations`);

    // Helper function to format section summaries into readable text
    const formatSectionSummaries = (sectionSummaries: any): string => {
      if (!sectionSummaries || typeof sectionSummaries !== 'object') {
 return '';
}

      return Object.entries(sectionSummaries)
        .map(([sectionName, summaries]) => {
          if (!Array.isArray(summaries)) {
 return '';
}
          const capitalizedSection = sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace('_', ' ');
          const bulletPoints = summaries.map(summary => `• ${summary}`).join('\n');
          return `${capitalizedSection}:\n${bulletPoints}`;
        })
        .filter(Boolean)
        .join('\n\n');
    };

    // Format results with smart medical content selection (Option A)
    const contextData = searchResults
      .map((result, index) => {
        let content: string;

        if (result.score >= 0.5 && result.sectionSummaries) {
          // High + Medium: Use structured medical summaries
          content = formatSectionSummaries(result.sectionSummaries);
          console.log(`[SEARCH DEBUG] Article ${index + 1}: Using SECTION SUMMARIES (score: ${result.score?.toFixed(3)}, enhanced: ${result.enhancementStatus})`);
        } else if (result.overallSummary) {
          // Low: Use brief overview
          content = result.overallSummary;
          console.log(`[SEARCH DEBUG] Article ${index + 1}: Using OVERALL SUMMARY (score: ${result.score?.toFixed(3)}, enhanced: ${result.enhancementStatus})`);
        } else {
          // Fallback: Use truncated full content
          content = result.content.substring(0, 400) + (result.content.length > 400 ? '...' : '');
          console.log(`[SEARCH DEBUG] Article ${index + 1}: Using FALLBACK CONTENT (score: ${result.score?.toFixed(3)}, enhanced: ${result.enhancementStatus}) - sectionSummaries: ${result.sectionSummaries ? 'exists' : 'null'}, overallSummary: ${result.overallSummary ? 'exists' : 'null'}`);
        }

        return `[${index + 1}] ${result.title}\n${content}`;
      })
      .join('\n\n');

    // Log total context size for performance monitoring
    const totalContextChars = contextData.length;
    const summaryCount = searchResults.filter(r => r && r.score >= 0.5 && r.sectionSummaries).length;
    const overallCount = searchResults.filter(r => r && r.overallSummary && (!r.sectionSummaries || r.score < 0.5)).length;
    const fallbackCount = searchResults.length - summaryCount - overallCount;

    console.log(`[SEARCH DEBUG] Final LLM input composition: ${summaryCount} section summaries, ${overallCount} overall summaries, ${fallbackCount} fallback`);
    console.log(`[SEARCH DEBUG] Final LLM input size: ${totalContextChars} characters (~${Math.round(totalContextChars / 4)} tokens)`);
    console.log(`[SEARCH DEBUG] LLM synthesis prompt: "Create very concise medical summary in 3-4 bullet points about '${query}'"`);
    console.log(`[SEARCH DEBUG] Expected LLM output: 3-4 bullet points with ALL sources [1] through [${searchResults.length}] cited`);

    // Create system prompt for concise synthesis with comprehensive citations
    const systemPrompt = `Create a very concise medical summary about "${query}" in 3-4 bullet points for a busy GP.

CRITICAL: You MUST cite ALL ${searchResults.length} sources provided. Every source [1] through [${searchResults.length}] must appear at least once in your response.

Rules:
• Use bullet points (•) not numbered lists
• Each bullet point should be concise but clinically accurate
• Add inline citations [1][2][3]etc throughout each point
• Use NZ English spelling
• Focus on the most essential medical information
• Ensure ALL provided sources are referenced

Sources:
${contextData}`;

    // Step 3: Get concise synthesised bullet points from GPT-5 nano
    const synthesisStart = performance.now();
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: process.env.SEARCH_SUMMARY_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Create 3-4 concise bullet points about "${query}" ensuring ALL sources [1] through [${searchResults.length}] are cited.`,
        },
      ],
    });
    const synthesisEnd = performance.now();
    console.log(`[SEARCH TIMING] Content synthesis: ${Math.round(synthesisEnd - synthesisStart)}ms`);

    const bulletPoints = completion.choices[0]?.message?.content?.trim();
    if (!bulletPoints) {
      return NextResponse.json({
        paragraph: '',
        sources: [],
        error: 'Failed to process search results',
      }, { status: 500 });
    }

    // Create sources array with citation indices
    const sources = searchResults
      .filter(result => result !== undefined)
      .map((result, index) => ({
        title: result.title,
        url: result.source,
        index: index + 1,
      }));

    console.log(`[SEARCH DEBUG] Stage 2 complete: Generated bullet points with ${sources.length} selected sources`);
    console.log(`[SEARCH DEBUG] Two-stage search complete: Selection + Synthesis`);

    // Overall timing summary
    const totalTime = Math.round(synthesisEnd - overallStart);
    const searchTime = Math.round(searchEnd - searchStart);
    const selectionTime = Math.round(selectionEnd - selectionStart);
    const synthesisTime = Math.round(synthesisEnd - synthesisStart);
    console.log(`[SEARCH TIMING] ===== PERFORMANCE SUMMARY =====`);
    console.log(`[SEARCH TIMING] Database search: ${searchTime}ms (${Math.round(searchTime / totalTime * 100)}%) - ONLY DB ACCESS`);
    console.log(`[SEARCH TIMING] Source selection: ${selectionTime}ms (${Math.round(selectionTime / totalTime * 100)}%) - GPT-5 nano LLM call`);
    console.log(`[SEARCH TIMING] Content synthesis: ${synthesisTime}ms (${Math.round(synthesisTime / totalTime * 100)}%) - GPT-5 nano LLM call`);
    console.log(`[SEARCH TIMING] TOTAL: ${totalTime}ms`);
    console.log(`[SEARCH TIMING] DATABASE ACCESSES: 1 (vector similarity search only)`);
    console.log(`[SEARCH TIMING] LLM API CALLS: 2 (selection + synthesis)`);
    console.log(`[SEARCH TIMING] ================================`);

    const searchResponse: SearchResponse = {
      paragraph: bulletPoints, // Keep same field name for frontend compatibility
      sources,
      titles: [], // Empty for summary mode
    };

    return NextResponse.json(searchResponse);
  } catch (error) {
    console.error('Search error:', error);

    if (error instanceof Error) {
      return NextResponse.json({
        paragraph: '',
        sources: [],
        titles: [],
        error: error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      paragraph: '',
      sources: [],
      titles: [],
      error: 'An unexpected error occurred during search',
    }, { status: 500 });
  }
}
