import OpenAI from 'openai';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey });
}

/**
 * Classify headings into medical content sections using LLM
 */
export async function classifyHeadings(headings: string[]): Promise<Record<string, string>> {
  if (headings.length === 0) {
 return {};
}

  try {
    const prompt = `Classify these medical article headings into standard sections. 

HEADINGS:
${headings.map((h, i) => `${i + 1}. ${h}`).join('\n')}

STANDARD SECTIONS:
- overview: What is the condition, key points, definitions
- symptoms: Signs, symptoms, what to look for
- causes: Risk factors, what causes it, contributing factors  
- diagnosis: How it's diagnosed, tests, examinations
- treatment: How it's treated, management, therapies, medications
- prevention: How to prevent, lifestyle changes, strategies
- when_to_see_doctor: When to seek help, urgency, red flags

Return as JSON mapping heading number to section name. If a heading doesn't fit any section, use "other".

Example: {"1": "overview", "2": "symptoms", "3": "treatment"}`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (response) {
      try {
        const classifications = JSON.parse(response);

        // Convert back to heading → section mapping
        const result: Record<string, string> = {};
        Object.entries(classifications).forEach(([index, section]) => {
          const headingIndex = Number.parseInt(index) - 1;
          if (
            headingIndex >= 0
            && headingIndex < headings.length
            && section !== 'other'
          ) {
            const headingText = headings[headingIndex];
            if (typeof headingText === 'string' && headingText.length > 0) {
              result[headingText] = String(section);
            }
          }
        });

        return result;
      } catch (parseError) {
        console.error('[HEADING CLASSIFIER] Failed to parse JSON:', parseError);
      }
    }
  } catch (error) {
    console.error('[HEADING CLASSIFIER] API error:', error);
  }

  return {};
}

/**
 * Enhanced heading classification that combines pattern matching with LLM
 */
export function classifyHeadingsHybrid(
  headings: string[],
  patternMappings: Record<string, string[]>,
): Promise<Record<string, string>> {
  // First try pattern matching (fast)
  const patternResults: Record<string, string> = {};
  const unmatchedHeadings: string[] = [];

  headings.forEach((heading) => {
    const headingLower = heading.toLowerCase().trim();
    let matched = false;

    for (const [sectionName, keywords] of Object.entries(patternMappings)) {
      if (keywords.some(keyword => headingLower.includes(keyword))) {
        patternResults[heading] = sectionName;
        matched = true;
        break;
      }
    }

    if (!matched) {
      unmatchedHeadings.push(heading);
    }
  });

  // Then use LLM for unmatched headings (smart but slower)
  if (unmatchedHeadings.length > 0) {
    return classifyHeadings(unmatchedHeadings).then((llmResults) => {
      return { ...patternResults, ...llmResults };
    });
  }

  return Promise.resolve(patternResults);
}
