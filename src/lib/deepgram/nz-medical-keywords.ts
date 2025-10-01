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
  // 1. PAIN & ANALGESICS
  // ---------------------------------------------------------------------------
  {
    category: 'pain-analgesics',
    boost: 2.0,
    description: 'Hard to pronounce pain medications',
    keywords: [
      // Easily misheard
      'tramadol',
      'oxycodone',
      'methadone',
      'diclofenac',
      'naproxen',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2. ANTIBIOTICS
  // ---------------------------------------------------------------------------
  {
    category: 'antibiotics',
    boost: 2.5, // Higher boost - commonly confused names
    description: 'Hard to pronounce antibiotics',
    keywords: [
      // Commonly misheard
      'flucloxacillin',
      'doxycycline',
      'nitrofurantoin',
      'azithromycin',
      'clarithromycin',
      'metronidazole',
      'ciprofloxacin',
      'roxithromycin',
      'cefalexin',
      'cephalexin',
      'erythromycin',
    ],
  },

  // ---------------------------------------------------------------------------
  // 3. CARDIOVASCULAR
  // ---------------------------------------------------------------------------
  {
    category: 'cardiovascular',
    boost: 2.0,
    description: 'Hard to pronounce cardiovascular medications',
    keywords: [
      // Hard to pronounce
      'perindopril',
      'candesartan',
      'bisoprolol',
      'carvedilol',
      'felodipine',
      'diltiazem',
      'simvastatin',
      'atorvastatin',
      'rosuvastatin',
      'clopidogrel',
      'rivaroxaban',
      'dabigatran',
      'Coversyl',
    ],
  },

  // ---------------------------------------------------------------------------
  // 4. RESPIRATORY
  // ---------------------------------------------------------------------------
  {
    category: 'respiratory',
    boost: 2.5, // Brand names frequently used
    description: 'Hard to pronounce respiratory medications',
    keywords: [
      // Easily misheard
      'fluticasone',
      'salmeterol',
      'tiotropium',
      'montelukast',
      'ipratropium',
      
      // Brand names (commonly confused)
      'Flixotide',
      'Seretide',
      'Symbicort',
      'Spiriva',
      'Atrovent',
    ],
  },

  // ---------------------------------------------------------------------------
  // 5. MENTAL HEALTH
  // ---------------------------------------------------------------------------
  {
    category: 'mental-health',
    boost: 2.5, // Similar-sounding names
    description: 'Hard to pronounce mental health medications',
    keywords: [
      // Similar sounding SSRIs (keep all - commonly confused)
      'citalopram',
      'escitalopram',
      'paroxetine',
      'sertraline',
      
      // Hard to pronounce
      'mirtazapine',
      'venlafaxine',
      'clonazepam',
      'zopiclone',
      'lamotrigine',
      'quetiapine',
      'risperidone',
    ],
  },

  // ---------------------------------------------------------------------------
  // 6. HAY FEVER & ALLERGIES
  // ---------------------------------------------------------------------------
  {
    category: 'hayfever-allergies',
    boost: 2.5, // Brand names commonly used
    description: 'Hard to pronounce allergy medications',
    keywords: [
      // Easily misheard
      'promethazine',
      'mometasone',
      
      // Brand names (commonly confused)
      'Flixonase',
      'Steroclear',
      'Phenergan',
    ],
  },

  // ---------------------------------------------------------------------------
  // 7. DIABETES
  // ---------------------------------------------------------------------------
  {
    category: 'diabetes',
    boost: 2.0,
    description: 'Hard to pronounce diabetes medications',
    keywords: [
      // Hard to pronounce
      'empagliflozin',
      'vildagliptin',
      'dulaglutide',
      'semaglutide',
      
      // Brand names
      'Jardiance',
      'Jardiamet',
      'Trulicity',
    ],
  },

  // ---------------------------------------------------------------------------
  // 8. GASTROINTESTINAL & REFLUX
  // ---------------------------------------------------------------------------
  {
    category: 'gastrointestinal',
    boost: 2.0,
    description: 'Hard to pronounce GI medications',
    keywords: [
      // Hard to pronounce
      'lansoprazole',
      'pantoprazole',
      'famotidine',
      'ondansetron',
      'metoclopramide',
      'prochlorperazine',
      'cyclizine',
      'hyoscine',
      'mebeverine',
      'loperamide',
      
      // Brand names
      'Maxolon',
      'Stemetil',
    ],
  },

  // ---------------------------------------------------------------------------
  // 9. SKIN & DERMATOLOGY
  // ---------------------------------------------------------------------------
  {
    category: 'dermatology',
    boost: 2.0,
    description: 'Hard to pronounce dermatology medications',
    keywords: [
      // Hard to pronounce
      'betamethasone',
      'mometasone',
      'clobetasol',
      'triamcinolone',
      'clotrimazole',
      'miconazole',
      'terbinafine',
      'ketoconazole',
      'valaciclovir',
      'mupirocin',
      'cetomacrogol',
      'adapalene',
      'tretinoin',
      'isotretinoin',
      'calcipotriol',
      
      // Brand names (commonly confused)
      'Retrieve',
      'Oratane',
      'Advantan',
      'Daivonex',
      'Daivobet',
      'Enstilar',
      'Kenacomb',
    ],
  },

  // ---------------------------------------------------------------------------
  // 10. CONTRACEPTION & HRT
  // ---------------------------------------------------------------------------
  {
    category: 'contraception',
    boost: 2.5, // Brand names predominantly used
    description: 'Hard to pronounce contraception/HRT',
    keywords: [
      // Hard to pronounce generics
      'norethisterone',
      
      // Brand names (commonly confused)
      'Microgynon',
      'Cerazette',
      'Depo-Provera',
      'Jadelle',
    ],
  },

  // ---------------------------------------------------------------------------
  // 11. GENERAL MEDICATIONS
  // ---------------------------------------------------------------------------
  {
    category: 'general-medications',
    boost: 2.0,
    description: 'Hard to pronounce general medications',
    keywords: [
      // Hard to pronounce
      'levothyroxine',
      'carbimazole',
      'alendronate',
      'risedronate',
      'allopurinol',
      'colchicine',
      'methotrexate',
      'azathioprine',
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
