import { generateSystemPrompt } from './systemPrompt';

// Cache structure: templateId → { system: string, timestamp: number }
const systemPromptCache = new Map<string, { prompt: string; timestamp: number }>();
const SYSTEM_PROMPT_CACHE_TTL = 300000; // 5 minutes (templates rarely change)
const MAX_SYSTEM_CACHE_SIZE = 10; // Max 10 templates cached

// User prompt cache structure
const userPromptCache = new Map<string, { compiled: string; timestamp: number }>();
const USER_PROMPT_CACHE_TTL = 30000; // 30 seconds
const MAX_USER_CACHE_SIZE = 100;

interface ConsultationDataSources {
  additionalNotes?: string;
  transcription?: string;
  typedInput?: string;
}

// Generate cache key for user prompt
function generateUserPromptCacheKey(data: ConsultationDataSources): string {
  const parts = [
    data.additionalNotes?.substring(0, 100) || '',
    data.transcription?.substring(0, 100) || '',
    data.typedInput?.substring(0, 100) || '',
  ];
  return parts.join('|');
}

// Clean up old cache entries
function cleanupCache<T>(
  cache: Map<string, T & { timestamp: number }>,
  ttl: number,
  maxSize: number
) {
  const now = Date.now();
  
  // Remove expired entries
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > ttl) {
      cache.delete(key);
    }
  }

  // Remove oldest if still too large
  if (cache.size > maxSize) {
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, cache.size - maxSize);
    toRemove.forEach(([key]) => cache.delete(key));
  }
}

// Get cached system prompt for template
function getCachedSystemPrompt(templateId: string, templateBody: string): string {
  const cached = systemPromptCache.get(templateId);
  const now = Date.now();

  if (cached && now - cached.timestamp < SYSTEM_PROMPT_CACHE_TTL) {
    return cached.prompt;
  }

  // Generate new system prompt with template embedded
  const systemPrompt = generateSystemPrompt(templateBody);
  
  systemPromptCache.set(templateId, {
    prompt: systemPrompt,
    timestamp: now,
  });

  // Cleanup if needed
  if (systemPromptCache.size > MAX_SYSTEM_CACHE_SIZE * 0.8) {
    cleanupCache(systemPromptCache, SYSTEM_PROMPT_CACHE_TTL, MAX_SYSTEM_CACHE_SIZE);
  }

  return systemPrompt;
}

// Build structured user prompt with prioritized data sources
function buildUserPrompt(data: ConsultationDataSources): string {
  // Check cache first
  const cacheKey = generateUserPromptCacheKey(data);
  const cached = userPromptCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < USER_PROMPT_CACHE_TTL) {
    return cached.compiled;
  }

  // Build sections only for provided data
  const sections: string[] = [];

  if (data.additionalNotes?.trim()) {
    sections.push(
      '=== PRIMARY CLINICAL REASONING (Additional Notes) ===',
      data.additionalNotes.trim(),
      ''
    );
  }

  if (data.transcription?.trim()) {
    sections.push(
      '=== SUPPLEMENTARY TRANSCRIPTION (Doctor↔Patient Conversation) ===',
      data.transcription.trim(),
      ''
    );
  }

  if (data.typedInput?.trim()) {
    sections.push(
      '=== SUPPLEMENTARY TYPED NOTES ===',
      data.typedInput.trim(),
      ''
    );
  }

  if (sections.length === 0) {
    throw new Error('At least one data source must be provided');
  }

  sections.push('Generate the completed clinical note now.');

  const userPrompt = sections.join('\n');

  // Cache the result
  userPromptCache.set(cacheKey, {
    compiled: userPrompt,
    timestamp: Date.now(),
  });

  // Cleanup if needed
  if (userPromptCache.size > MAX_USER_CACHE_SIZE * 0.8) {
    cleanupCache(userPromptCache, USER_PROMPT_CACHE_TTL, MAX_USER_CACHE_SIZE);
  }

  return userPrompt;
}

export function compileTemplate(
  templateId: string,
  templateBody: string,
  consultationData: ConsultationDataSources,
): { system: string; user: string } {
  // Input validation
  if (!templateId?.trim()) {
    throw new Error('Template ID is required');
  }

  if (!templateBody?.trim()) {
    throw new Error('Template body is required');
  }

  // Get template-specific system prompt (cached per templateId)
  const systemPrompt = getCachedSystemPrompt(templateId, templateBody);

  // Build user prompt with structured data sources
  const userPrompt = buildUserPrompt(consultationData);

  return {
    system: systemPrompt,
    user: userPrompt,
  };
}

// Performance monitoring utilities
export const templatePerformance = {
  getCacheStats: () => ({
    systemPromptCacheSize: systemPromptCache.size,
    userPromptCacheSize: userPromptCache.size,
    systemCacheKeys: Array.from(systemPromptCache.keys()),
  }),

  clearCache: () => {
    systemPromptCache.clear();
    userPromptCache.clear();
  },

  getCacheSize: () => ({
    system: systemPromptCache.size,
    user: userPromptCache.size,
  }),
};
