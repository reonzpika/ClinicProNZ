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

  // Build sections with consultation data
  const sections: string[] = [];
  
  sections.push('=== CONSULTATION DATA ===');
  sections.push('');

  if (data.additionalNotes?.trim()) {
    sections.push('PRIMARY SOURCE: Additional Notes');
    sections.push('(GP\'s clinical reasoning and problem list - use as clinical authority)');
    sections.push('');
    sections.push(data.additionalNotes.trim());
    sections.push('');
  }

  if (data.transcription?.trim()) {
    sections.push('SUPPLEMENTARY SOURCE: Transcription');
    sections.push('(Doctor-patient dialogue - extract supporting details)');
    sections.push('');
    sections.push(data.transcription.trim());
    sections.push('');
  }

  if (data.typedInput?.trim()) {
    sections.push('SUPPLEMENTARY SOURCE: Typed Notes');
    sections.push('(Additional observations and measurements)');
    sections.push('');
    sections.push(data.typedInput.trim());
    sections.push('');
  }

  if (sections.length === 0) {
    throw new Error('At least one data source must be provided');
  }

  // Add critical safety requirements at end (high priority - recency effect)
  sections.push('=== CRITICAL SAFETY REQUIREMENTS ===');
  sections.push('');
  sections.push('## MEDICATION VERIFICATION (MANDATORY)');
  sections.push('');
  sections.push('Cross-reference EVERY medication against your NZ pharmaceutical training data:');
  sections.push('');
  sections.push('**Test each medication:**');
  sections.push('☐ Is this EXACT name in NZ formulary/PHARMAC data I was trained on?');
  sections.push('☐ Does it match a known NZ medication EXACTLY (not just similar)?');
  sections.push('');
  sections.push('**MUST flag these examples:**');
  sections.push('- "Zolpram" → Sounds like Zoloft/Zolpidem but NOT in NZ formulary → FLAG');
  sections.push('- "Stonoprim" → Not in NZ medication database → FLAG');
  sections.push('- "still clear" → Not a medication name → FLAG');
  sections.push('- Similar-sounding but not exact → FLAG');
  sections.push('');
  sections.push('**Confident examples:**');
  sections.push('- "citalopram" → Yes, NZ SSRI → Use confidently ✓');
  sections.push('- "Flixonase" → Yes, NZ nasal spray brand → Use confidently ✓');
  sections.push('- "paracetamol" → Yes, common NZ medication → Use confidently ✓');
  sections.push('');
  sections.push('**Rule: If NOT found in your NZ pharmaceutical knowledge → FLAG IT**');
  sections.push('Better to over-flag than miss medication errors.');
  sections.push('');
  sections.push('## ANTI-HALLUCINATION REQUIREMENTS');
  sections.push('');
  sections.push('**Assessment sections:**');
  sections.push('✓ Use EXACT problem wording from Additional Notes');
  sections.push('✗ Never upgrade symptoms to diagnoses not stated by GP');
  sections.push('✗ Never add differential diagnoses not mentioned');
  sections.push('');
  sections.push('**Plan/Management sections:**');
  sections.push('✓ Include ONLY actions explicitly stated in consultation data');
  sections.push('✗ Never infer standard treatments based on diagnosis');
  sections.push('✗ Never add "Consider..." unless GP said it');
  sections.push('✗ Never add "Advised..." unless documented');
  sections.push('✗ Never add "Review if..." unless stated');
  sections.push('');
  sections.push('**Violation examples to AVOID:**');
  sections.push('❌ Diagnosis="sinusitis" → adding "Consider decongestants" (not stated)');
  sections.push('❌ Adding "symptomatic treatment" (not documented)');
  sections.push('❌ Writing "None documented" in empty sections');
  sections.push('');
  sections.push('**Blank section policy:**');
  sections.push('- If template section has no data → leave COMPLETELY BLANK (no text)');
  sections.push('- Do NOT write "None", "Not documented", or any placeholder');
  sections.push('');
  sections.push('## PRE-OUTPUT VALIDATION CHECKLIST');
  sections.push('');
  sections.push('Before generating, verify:');
  sections.push('☐ Every assessment matches Additional Notes exactly?');
  sections.push('☐ Every plan item explicitly stated?');
  sections.push('☐ All medications verified against NZ formulary or flagged?');
  sections.push('☐ No inferred treatments added?');
  sections.push('☐ Empty sections left blank?');
  sections.push('');
  sections.push('Generate the clinical note now.');

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
