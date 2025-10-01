/**
 * NZ Medical Terminology Keywords for Deepgram Transcription
 * 
 * Purpose: Boost recognition accuracy for medical terms, medications, and clinical vocabulary
 * Boost values: 0.5 (low) to 3.0 (high priority)
 * - 2.0: Standard medications and medical terms
 * - 2.5: Commonly confused or critical terms
 * - 3.0: Patient-specific medications (added dynamically)
 * 
 * Maintenance: Review quarterly, add new medications as needed
 * Last updated: 2025-10-01
 */

export interface MedicalKeywordCategory {
  category: string;
  keywords: string[];
  boost: number;
  description: string;
}

/**
 * Compiled keyword list ready for Deepgram API
 * Format: Just the term (Nova-3 keyterm doesn't use boost values)
 */
export function getDeepgramKeywords(): string[] {
  return MEDICAL_KEYWORDS.flatMap(category => 
    category.keywords
  );
}

/**
 * Get keywords for specific categories
 */
export function getKeywordsByCategory(categories: string[]): string[] {
  return MEDICAL_KEYWORDS
    .filter(cat => categories.includes(cat.category))
    .flatMap(category => 
      category.keywords
    );
}

/**
 * Add patient-specific medications (prepended for priority)
 * Note: Nova-3 keyterm doesn't support boost values, but order matters
 */
export function addPatientMedications(patientMeds: string[]): string[] {
  const baseKeywords = getDeepgramKeywords();
  // Prepend patient meds (order may affect priority)
  return [...patientMeds, ...baseKeywords];
}

// =============================================================================
// MEDICAL KEYWORDS BY CATEGORY
// =============================================================================

export const MEDICAL_KEYWORDS: MedicalKeywordCategory[] = [
  // ---------------------------------------------------------------------------
  // TEST: MINIMAL SET
  // ---------------------------------------------------------------------------
  {
    category: 'mental-health',
    boost: 2.5,
    description: 'Test - mental health',
    keywords: [
      'citalopram',
    ],
  },
  
  {
    category: 'hayfever-allergies',
    boost: 2.5,
    description: 'Test - hay fever',
    keywords: [
      'Flixonase',
      'Steroclear',
    ],
  },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get total keyword count
 */
export function getKeywordCount(): number {
  return MEDICAL_KEYWORDS.reduce((total, cat) => total + cat.keywords.length, 0);
}

/**
 * Get keywords grouped by boost level
 */
export function getKeywordsByBoost(): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  MEDICAL_KEYWORDS.forEach(category => {
    const boostKey = category.boost.toString();
    if (!grouped[boostKey]) {
      grouped[boostKey] = [];
    }
    grouped[boostKey].push(...category.keywords);
  });
  
  return grouped;
}

/**
 * Search for a specific medication in keywords
 */
export function findMedication(searchTerm: string): { found: boolean; category?: string; boost?: number } {
  const lowerSearch = searchTerm.toLowerCase();
  
  for (const category of MEDICAL_KEYWORDS) {
    const found = category.keywords.some(kw => kw.toLowerCase() === lowerSearch);
    if (found) {
      return { found: true, category: category.category, boost: category.boost };
    }
  }
  
  return { found: false };
}

/**
 * Export statistics for monitoring
 */
export function getKeywordStats() {
  return {
    totalKeywords: getKeywordCount(),
    categories: MEDICAL_KEYWORDS.length,
    byCategory: MEDICAL_KEYWORDS.map(cat => ({
      category: cat.category,
      count: cat.keywords.length,
      boost: cat.boost,
    })),
    byBoost: getKeywordsByBoost(),
  };
}
