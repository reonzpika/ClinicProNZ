/**
 * Simple typo correction for common medical terms
 * Helps improve search results when users make typing errors
 */

type TypoCorrection = {
  [key: string]: string;
};

// Common medical term corrections
const MEDICAL_TYPO_CORRECTIONS: TypoCorrection = {
  // Common spelling mistakes
  headach: 'headache',
  headacke: 'headache',
  headake: 'headache',
  diabetis: 'diabetes',
  diabets: 'diabetes',
  diabetese: 'diabetes',
  hypertention: 'hypertension',
  hypertensions: 'hypertension',
  astma: 'asthma',
  asma: 'asthma',
  astham: 'asthma',
  depresson: 'depression',
  depresion: 'depression',
  anxity: 'anxiety',
  anixety: 'anxiety',
  aniety: 'anxiety',
  pnuemonia: 'pneumonia',
  pneumonia: 'pneumonia', // correct already
  bronchits: 'bronchitis',
  bronchitus: 'bronchitis',
  arthrits: 'arthritis',
  artritis: 'arthritis',
  cholestrol: 'cholesterol',
  colesterol: 'cholesterol',
  vaccinations: 'vaccination',
  imunization: 'immunisation',
  immunization: 'immunisation', // NZ spelling

  // Medical procedures
  mamogram: 'mammogram',
  mamography: 'mammography',
  colonscopy: 'colonoscopy',
  coloscopy: 'colonoscopy',
  contaception: 'contraception',
  contraceptive: 'contraception',

  // Body parts and symptoms
  abdomonal: 'abdominal',
  stomache: 'stomach',
  stomac: 'stomach',
  diziness: 'dizziness',
  dizzy: 'dizziness',
  fatique: 'fatigue',
  fatige: 'fatigue',
  nauseas: 'nausea',
  vomiting: 'vomiting',
  vomit: 'vomiting',
  diarrhea: 'diarrhoea', // NZ spelling
  diarhea: 'diarrhoea',
  diarea: 'diarrhoea',

  // Treatment terms
  antibiotic: 'antibiotics',
  painkiller: 'pain relief',
  painkillers: 'pain relief',
  medicaton: 'medication',
  medecine: 'medicine',
  treatement: 'treatment',
  tretment: 'treatment',
};

/**
 * Correct common typos in medical search queries
 */
export function correctMedicalTypos(query: string): string {
  if (!query || typeof query !== 'string') {
    return query;
  }

  const correctedQuery = query.toLowerCase().trim();

  // Split into words and check each word
  const words = correctedQuery.split(/\s+/);
  const correctedWords = words.map((word) => {
    // Remove punctuation for matching
    const cleanWord = word.replace(/\W/g, '');

    // Check for exact match
    if (MEDICAL_TYPO_CORRECTIONS[cleanWord]) {
      return MEDICAL_TYPO_CORRECTIONS[cleanWord];
    }

    // Check for partial matches (for compound terms) - but only if the word ends with the typo
    for (const [typo, correction] of Object.entries(MEDICAL_TYPO_CORRECTIONS)) {
      if (cleanWord !== typo && cleanWord.endsWith(typo) && cleanWord.length > typo.length) {
        return cleanWord.replace(new RegExp(`${typo}$`), correction);
      }
    }

    return word;
  });

  const result = correctedWords.join(' ');

  // Log correction if changes were made (for debugging)
  // Note: Removed console.log to satisfy linting rules

  return result;
}

/**
 * Check if a query likely contains typos based on common patterns
 */
export function hasLikelyTypos(query: string): boolean {
  if (!query) {
 return false;
}

  const cleanQuery = query.toLowerCase().trim();
  const words = cleanQuery.split(/\s+/);

  return words.some((word) => {
    const cleanWord = word.replace(/\W/g, '');
    return Object.keys(MEDICAL_TYPO_CORRECTIONS).includes(cleanWord);
  });
}

/**
 * Get suggestions for corrected terms
 */
export function getTypoSuggestions(query: string): string[] {
  const corrected = correctMedicalTypos(query);

  if (corrected === query.toLowerCase().trim()) {
    return [];
  }

  return [corrected];
}
