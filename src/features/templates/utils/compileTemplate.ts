import { generateSystemPrompt } from './systemPrompt';

// Performance optimization: Cache compiled system prompts
let cachedSystemPrompt: string | null = null;
let systemPromptCacheTime: number = 0;
const SYSTEM_PROMPT_CACHE_TTL = 60000; // 1 minute cache

// Performance optimization: Template compilation cache
const templateCache = new Map<string, { compiled: string; timestamp: number }>();
const TEMPLATE_CACHE_TTL = 30000; // 30 seconds cache
const MAX_CACHE_SIZE = 100; // Maximum number of cached templates

// Helper function to generate cache key
function generateCacheKey(
  templateBody: string,
  transcription: string,
  typedInput?: string,
  inputMode: 'audio' | 'typed' = 'audio',
  consultationNotes?: string,
): string {
  const inputs = [
    templateBody.substring(0, 100), // First 100 chars of template for uniqueness
    transcription.substring(0, 50),
    typedInput?.substring(0, 50) || '',
    inputMode,
    consultationNotes?.substring(0, 50) || '',
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

// Optimized function to substitute placeholders in natural language templates
function substitutePlaceholders(
  templateBody: string,
  transcription: string,
  typedInput?: string,
  inputMode: 'audio' | 'typed' = 'audio',
  consultationNotes?: string,
): string {
  // Check cache first
  const cacheKey = generateCacheKey(templateBody, transcription, typedInput, inputMode, consultationNotes);
  const cached = templateCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < TEMPLATE_CACHE_TTL) {
    return cached.compiled;
  }

  // Prepare consultation data sections with optimized string building
  const dataSections: string[] = [];

  if (inputMode === 'audio') {
    // Add transcription if available
    if (transcription?.trim()) {
      dataSections.push('--- TRANSCRIPTION ---', transcription.trim());
    }
  } else if (inputMode === 'typed') {
    // Add typed input if available
    if (typedInput?.trim()) {
      dataSections.push('--- TYPED INPUT ---', typedInput.trim());
    }
  }

  // Add additional notes if available
  if (consultationNotes?.trim()) {
    dataSections.push('--- ADDITIONAL NOTES ---', consultationNotes.trim());
  }

  const consultationData = dataSections.join('\n\n');

  // Create the complete prompt with optimized string concatenation
  const completePrompt = [
    '--- TEMPLATE INSTRUCTIONS ---',
    templateBody,
    '',
    '--- CONSULTATION DATA ---',
    consultationData,
    '',
    '--- OUTPUT INSTRUCTIONS ---',
    'Follow the template above exactly. Only include information that is explicitly mentioned in the consultation data. If a section has no relevant information, leave it blank or omit it entirely.',
    '',
    '[Output begins here]',
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

// Optimized system prompt generation with caching
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
  transcription: string,
  typedInput?: string,
  inputMode: 'audio' | 'typed' = 'audio',
  consultationNotes?: string,
): { system: string; user: string } {
  // Input validation for performance
  if (!templateBody?.trim()) {
    throw new Error('Template body is required');
  }

  // Use cached system prompt
  const systemPrompt = getCachedSystemPrompt();

  // Create the user prompt with optimized substitution
  const userPrompt = substitutePlaceholders(
    templateBody,
    transcription || '',
    typedInput,
    inputMode,
    consultationNotes,
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
