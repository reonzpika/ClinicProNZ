import { generateSystemPrompt } from './systemPrompt';

// Performance optimisation: Cache compiled system prompts
let cachedSystemPrompt: string | null = null;
let systemPromptCacheTime: number = 0;
const SYSTEM_PROMPT_CACHE_TTL = 60000; // 1 minute cache

// Performance optimisation: Template compilation cache
const templateCache = new Map<string, { compiled: string; timestamp: number }>();
const TEMPLATE_CACHE_TTL = 30000; // 30 seconds cache
const MAX_CACHE_SIZE = 100; // Maximum number of cached templates

// Helper function to generate cache key
function generateCacheKey(
  templateBody: string,
  structuredContent: string,
): string {
  const inputs = [
    templateBody.substring(0, 100), // First 100 chars of template for uniqueness
    structuredContent.substring(0, 100),
  ];
  return inputs.join('|');
}

// Helper function to clean up old cache entries
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of templateCache.entries()) {
    if (now - value.timestamp > TEMPLATE_CACHE_TTL) {
      templateCache.delete(key);
    }
  }

  // If cache is still too large, remove oldest entries
  if (templateCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(templateCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.slice(0, templateCache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => templateCache.delete(key));
  }
}

// Optimised function to substitute placeholders in natural language templates
function substitutePlaceholders(
  templateBody: string,
  structuredContent: string,
): string {
  // Check cache first
  const cacheKey = generateCacheKey(templateBody, structuredContent);
  const cached = templateCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < TEMPLATE_CACHE_TTL) {
    return cached.compiled;
  }

  // Create the complete prompt with optimised string concatenation
  const completePrompt = [
    '--- TEMPLATE INSTRUCTIONS ---',
    templateBody,
    '',
    '--- CONSULTATION DATA ---',
    structuredContent,
    '',
    '--- OUTPUT INSTRUCTIONS ---',
    'Fill only the placeholders in the template with facts from the data. Only include facts clearly stated in the consultation data.',
    'Omit any empty sections.',
    'Append a QA checklist at the end: Omission/Hallucination/Uncertain.',
    '',
    '[Begin output]',
  ].join('\n');

  // Cache the result
  templateCache.set(cacheKey, {
    compiled: completePrompt,
    timestamp: Date.now(),
  });

  // Clean up cache periodically
  if (templateCache.size > MAX_CACHE_SIZE * 0.8) {
    cleanupCache();
  }

  return completePrompt;
}

// Optimised system prompt generation with caching
function getCachedSystemPrompt(): string {
  const now = Date.now();

  if (cachedSystemPrompt && now - systemPromptCacheTime < SYSTEM_PROMPT_CACHE_TTL) {
    return cachedSystemPrompt;
  }

  cachedSystemPrompt = generateSystemPrompt();
  systemPromptCacheTime = now;

  return cachedSystemPrompt;
}

export function compileTemplate(
  templateBody: string,
  structuredContent: string,
): { system: string; user: string } {
  // Input validation for performance
  if (!templateBody?.trim()) {
    throw new Error('Template body is required');
  }

  if (!structuredContent?.trim()) {
    throw new Error('Structured content is required');
  }

  // Use cached system prompt
  const systemPrompt = getCachedSystemPrompt();

  // Create the user prompt with optimised substitution
  const userPrompt = substitutePlaceholders(
    templateBody,
    structuredContent,
  );

  return {
    system: systemPrompt,
    user: userPrompt,
  };
}

// Performance monitoring utilities
export const templatePerformance = {
  getCacheStats: () => ({
    templateCacheSize: templateCache.size,
    systemPromptCached: !!cachedSystemPrompt,
    cacheHitRate: templateCache.size > 0 ? 'Available' : 'No data',
  }),

  clearCache: () => {
    templateCache.clear();
    cachedSystemPrompt = null;
    systemPromptCacheTime = 0;
  },

  getCacheSize: () => templateCache.size,
};
