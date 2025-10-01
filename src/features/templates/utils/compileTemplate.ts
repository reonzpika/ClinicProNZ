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

  // Add output rules at the end of user prompt (higher priority than system prompt)
  sections.push('');
  sections.push('=== CRITICAL OUTPUT INSTRUCTIONS ===');
  sections.push('');
  sections.push('## 1. ANTI-HALLUCINATION RULES (MUST FOLLOW)');
  sections.push('');
  sections.push('**For Plan/Management sections:**');
  sections.push('- ONLY include actions/advice EXPLICITLY stated in consultation data');
  sections.push('- If GP stated a treatment → write exactly what was stated');
  sections.push('- If GP stated NO treatment plan → leave Plan section COMPLETELY BLANK (no text at all)');
  sections.push('- DO NOT infer standard treatments based on diagnosis');
  sections.push('- DO NOT add "Consider..." unless GP specifically said "Consider..."');
  sections.push('- DO NOT add "Advised..." unless GP specifically documented advice given');
  sections.push('- DO NOT add "Review if..." unless GP specifically stated follow-up criteria');
  sections.push('');
  sections.push('**Violation examples (NEVER do this):**');
  sections.push('- Diagnosis = "sinusitis" → adding "Consider decongestants" when not stated ❌');
  sections.push('- Diagnosis present → inferring standard treatment ❌');
  sections.push('- Symptoms present → diagnosing condition not explicitly stated ❌');
  sections.push('- Adding "symptomatic treatment" when not documented ❌');
  sections.push('');
  sections.push('**For Assessment sections:**');
  sections.push('- ONLY include diagnoses/problems EXPLICITLY stated by GP');
  sections.push('- Use exact wording from Additional Notes for diagnoses');
  sections.push('- Do not upgrade symptom descriptions to formal diagnoses');
  sections.push('');
  sections.push('## 2. BLANK SECTION POLICY');
  sections.push('');
  sections.push('If a template section has no corresponding data in consultation:');
  sections.push('- Leave the section COMPLETELY BLANK (empty, no text)');
  sections.push('- DO NOT write "Not documented"');
  sections.push('- DO NOT write "None"');
  sections.push('- DO NOT fill with standard/expected content');
  sections.push('- DO NOT infer what should be there');
  sections.push('');
  sections.push('**Example:**');
  sections.push('- Template has [Plan]');
  sections.push('- Additional Notes mention "sinusitis" assessment');
  sections.push('- No treatment plan documented anywhere');
  sections.push('- → Output: [Leave Plan section completely empty]');
  sections.push('');
  sections.push('## 3. FINAL VALIDATION CHECKLIST');
  sections.push('');
  sections.push('Before outputting, mentally verify:');
  sections.push('');
  sections.push('**Hallucination check:**');
  sections.push('- [ ] Every statement in Plan section directly from consultation data?');
  sections.push('- [ ] Did I add any "standard treatments" not explicitly stated? If YES → DELETE THEM');
  sections.push('- [ ] Did I add any advice/follow-up not explicitly stated? If YES → DELETE THEM');
  sections.push('');
  sections.push('**Medication check:**');
  sections.push('- [ ] For each medication, am I 100% certain of the exact name?');
  sections.push('- [ ] Does it match a medication I know from training data EXACTLY?');
  sections.push('- [ ] If uncertain or unfamiliar → ADD TO TRANSCRIPTION NOTES');
  sections.push('');
  sections.push('**Blank section check:**');
  sections.push('- [ ] Did I leave sections blank when no data provided?');
  sections.push('- [ ] Or did I fill them with inferred content? If YES → REMOVE IT, LEAVE BLANK');
  sections.push('');
  sections.push('## 4. OUTPUT RULES');
  sections.push('');
  sections.push('✓ Output ONLY the filled template');
  sections.push('✓ Remove all placeholder markers [Name]');
  sections.push('✓ Remove all instruction markers (instruction)');
  sections.push('✓ Use NZ English spelling: organise, behaviour, centre');
  sections.push('✓ Use clinical shorthand: 2/52 (weeks), 3/7 (days), SOB, PRN, WNL');
  sections.push('✓ Match template format exactly');
  sections.push('✓ Leave sections BLANK if no data (do not write "None" or "Not documented")');
  sections.push('✓ Include ONLY facts from consultation data');
  sections.push('✓ DO NOT infer diagnoses or plans beyond what was stated');
  sections.push('✓ Preserve clinical accuracy');
  sections.push('');
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
