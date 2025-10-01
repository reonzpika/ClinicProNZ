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
 * Format: "term:boost"
 */
export function getDeepgramKeywords(): string[] {
  return MEDICAL_KEYWORDS.flatMap(category => 
    category.keywords.map(keyword => `${keyword}:${category.boost}`)
  );
}

/**
 * Get keywords for specific categories
 */
export function getKeywordsByCategory(categories: string[]): string[] {
  return MEDICAL_KEYWORDS
    .filter(cat => categories.includes(cat.category))
    .flatMap(category => 
      category.keywords.map(keyword => `${keyword}:${category.boost}`)
    );
}

/**
 * Add patient-specific medications with higher boost
 */
export function addPatientMedications(patientMeds: string[]): string[] {
  const baseKeywords = getDeepgramKeywords();
  const patientKeywords = patientMeds.map(med => `${med}:3.0`);
  return [...patientKeywords, ...baseKeywords];
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
    description: 'Common pain medications and analgesics',
    keywords: [
      // Generic names
      'paracetamol',
      'ibuprofen',
      'diclofenac',
      'naproxen',
      'codeine',
      'tramadol',
      'aspirin',
      'oxycodone',
      'methadone',
      
      // Brand names
      'Panadol',
      'Nurofen',
      'Brufen',
      'Voltaren',
      'Naprosyn',
      'Panadeine',
      'Tramacet',
      'Oxynorm',
      'OxyContin',
      'Sevredol',
    ],
  },

  // ---------------------------------------------------------------------------
  // 2. ANTIBIOTICS
  // ---------------------------------------------------------------------------
  {
    category: 'antibiotics',
    boost: 2.5, // Higher boost - commonly confused names
    description: 'Commonly prescribed antibiotics in NZ',
    keywords: [
      // Generic names
      'amoxicillin',
      'flucloxacillin',
      'doxycycline',
      'trimethoprim',
      'nitrofurantoin',
      'azithromycin',
      'clarithromycin',
      'metronidazole',
      'ciprofloxacin',
      'roxithromycin',
      'cefaclor',
      'cefalexin',
      'cephalexin',
      'erythromycin',
      
      // Brand names
      'Augmentin',
      'Amoxil',
      'Floxapen',
      'Doxine',
      'Flagyl',
      'Zithromax',
      'Klacid',
    ],
  },

  // ---------------------------------------------------------------------------
  // 3. CARDIOVASCULAR
  // ---------------------------------------------------------------------------
  {
    category: 'cardiovascular',
    boost: 2.0,
    description: 'Blood pressure, heart, and cholesterol medications',
    keywords: [
      // ACE inhibitors
      'ramipril',
      'enalapril',
      'lisinopril',
      'perindopril',
      'quinapril',
      
      // ARBs
      'losartan',
      'candesartan',
      'irbesartan',
      'valsartan',
      
      // Beta blockers
      'atenolol',
      'metoprolol',
      'bisoprolol',
      'carvedilol',
      'propranolol',
      
      // Calcium channel blockers
      'amlodipine',
      'felodipine',
      'diltiazem',
      'verapamil',
      'nifedipine',
      
      // Statins
      'simvastatin',
      'atorvastatin',
      'rosuvastatin',
      
      // Others
      'aspirin',
      'clopidogrel',
      'warfarin',
      'apixaban',
      'rivaroxaban',
      'digoxin',
      'frusemide',
      'furosemide',
      
      // Brand names
      'Lipitor',
      'Crestor',
      'Plavix',
      'Norvasc',
      'Coversyl',
    ],
  },

  // ---------------------------------------------------------------------------
  // 4. RESPIRATORY
  // ---------------------------------------------------------------------------
  {
    category: 'respiratory',
    boost: 2.5, // Brand names frequently used
    description: 'Asthma, COPD, and respiratory medications',
    keywords: [
      // Generic names
      'salbutamol',
      'terbutaline',
      'budesonide',
      'beclomethasone',
      'fluticasone',
      'salmeterol',
      'formoterol',
      'tiotropium',
      'montelukast',
      'ipratropium',
      'prednisolone',
      'prednisone',
      
      // Brand names (commonly used in NZ)
      'Ventolin',
      'Bricanyl',
      'Flixotide',
      'Seretide',
      'Symbicort',
      'Spiriva',
      'Singulair',
      'Atrovent',
      'Duoresp',
      'Alvesco',
    ],
  },

  // ---------------------------------------------------------------------------
  // 5. MENTAL HEALTH
  // ---------------------------------------------------------------------------
  {
    category: 'mental-health',
    boost: 2.5, // Similar-sounding names
    description: 'Antidepressants, anxiolytics, antipsychotics',
    keywords: [
      // SSRIs
      'citalopram',
      'escitalopram',
      'fluoxetine',
      'paroxetine',
      'sertraline',
      
      // Other antidepressants
      'mirtazapine',
      'venlafaxine',
      'desvenlafaxine',
      'duloxetine',
      'bupropion',
      'agomelatine',
      'vortioxetine',
      
      // Anxiolytics
      'diazepam',
      'lorazepam',
      'clonazepam',
      'oxazepam',
      'zopiclone',
      'zolpidem',
      
      // Mood stabilisers
      'lithium',
      'lamotrigine',
      'sodium valproate',
      'valproate',
      
      // Antipsychotics
      'quetiapine',
      'olanzapine',
      'risperidone',
      'aripiprazole',
      
      // Brand names
      'Cipramil',
      'Lexapro',
      'Prozac',
      'Aropax',
      'Zoloft',
      'Avanza',
      'Efexor',
      'Pristiq',
      'Cymbalta',
      'Zyban',
      'Seroquel',
      'Zyprexa',
      'Risperdal',
    ],
  },

  // ---------------------------------------------------------------------------
  // 6. HAY FEVER & ALLERGIES
  // ---------------------------------------------------------------------------
  {
    category: 'hayfever-allergies',
    boost: 2.5, // Brand names commonly used
    description: 'Antihistamines and nasal sprays',
    keywords: [
      // Antihistamines
      'cetirizine',
      'loratadine',
      'fexofenadine',
      'promethazine',
      'chlorpheniramine',
      'desloratadine',
      
      // Nasal sprays
      'fluticasone',
      'mometasone',
      'beclomethasone',
      'budesonide',
      'azelastine',
      
      // Brand names
      'Zyrtec',
      'Claratyne',
      'Telfast',
      'Phenergan',
      'Flixonase',
      'Nasonex',
      'Beconase',
      'Rhinocort',
      'Dymista',
    ],
  },

  // ---------------------------------------------------------------------------
  // 7. DIABETES
  // ---------------------------------------------------------------------------
  {
    category: 'diabetes',
    boost: 2.0,
    description: 'Diabetes medications and insulin',
    keywords: [
      // Oral medications
      'metformin',
      'gliclazide',
      'glibenclamide',
      'empagliflozin',
      'dapagliflozin',
      'sitagliptin',
      'vildagliptin',
      
      // Insulin types
      'insulin',
      'NovoRapid',
      'Humalog',
      'Lantus',
      'Levemir',
      'Tresiba',
      
      // Injectable GLP-1
      'dulaglutide',
      'semaglutide',
      
      // Brand names
      'Glucophage',
      'Diamicron',
      'Jardiance',
      'Jardiamet',
      'Trulicity',
      'Januvia',
      'Galvus',
    ],
  },

  // ---------------------------------------------------------------------------
  // 8. GASTROINTESTINAL & REFLUX
  // ---------------------------------------------------------------------------
  {
    category: 'gastrointestinal',
    boost: 2.0,
    description: 'Reflux, nausea, constipation, diarrhoea medications',
    keywords: [
      // PPIs
      'omeprazole',
      'lansoprazole',
      'pantoprazole',
      'rabeprazole',
      
      // H2 antagonists
      'ranitidine',
      'famotidine',
      
      // Antacids
      'Gaviscon',
      'Mylanta',
      'Acidex',
      
      // Antiemetics
      'ondansetron',
      'metoclopramide',
      'prochlorperazine',
      'cyclizine',
      
      // Laxatives
      'lactulose',
      'movicol',
      'molaxole',
      'Coloxyl',
      'bisacodyl',
      'senna',
      
      // Antispasmodics
      'buscopan',
      'hyoscine',
      'mebeverine',
      
      // Antidiarrhoeal
      'loperamide',
      
      // Brand names
      'Losec',
      'Maxolon',
      'Stemetil',
      'Imodium',
      'Laxsol',
      'enema',
    ],
  },

  // ---------------------------------------------------------------------------
  // 9. SKIN & DERMATOLOGY
  // ---------------------------------------------------------------------------
  {
    category: 'dermatology',
    boost: 2.0,
    description: 'Topical steroids, antifungals, antivirals, emollients',
    keywords: [
      // Topical steroids
      'hydrocortisone',
      'betamethasone',
      'mometasone',
      'clobetasol',
      'triamcinolone',
      
      // Antifungals
      'clotrimazole',
      'miconazole',
      'terbinafine',
      'ketoconazole',
      'fluconazole',
      
      // Antivirals
      'aciclovir',
      'valaciclovir',
      
      // Antibiotics
      'fusidic acid',
      'mupirocin',
      
      // Emollients
      'sorbolene',
      'cetomacrogol',
      'emulsifying ointment',
      'aqueous cream',
      'glycerol',
      
      // Acne
      'benzoyl peroxide',
      'adapalene',
      'tretinoin',
      'isotretinoin',
      
      // Psoriasis
      'calcipotriol',
      'dithranol',
      
      // Brand names
      'Canesten',
      'Daktarin',
      'Lamisil',
      'Zovirax',
      'Valtrex',
      'Fucidin',
      'Bactroban',
      'QV',
      'Cetraben',
      'Cetaphil',
      'Dermol',
      'Epiderm',
      'Differin',
      'Roaccutane',
      'Locoid',
      'Elocon',
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
    description: 'Oral contraceptives, injections, implants, HRT',
    keywords: [
      // Generic hormones
      'levonorgestrel',
      'ethinylestradiol',
      'norethisterone',
      'desogestrel',
      'drospirenone',
      'medroxyprogesterone',
      'etonogestrel',
      
      // Combined oral contraceptives
      'Microgynon',
      'Levlen',
      'Brevinor',
      'Yasmin',
      'Yaz',
      
      // Progesterone-only pills
      'Cerazette',
      'Noriday',
      'Microlut',
      
      // Emergency contraception
      'Postinor',
      
      // Long-acting
      'Depo-Provera',
      'Jadelle',
      'Mirena',
      'Jaydess',
      
      // HRT
      'estradiol',
      'oestrogen',
      'progesterone',
      'Kliogest',
      'Livial',
    ],
  },

  // ---------------------------------------------------------------------------
  // 11. GENERAL & OTC MEDICATIONS
  // ---------------------------------------------------------------------------
  {
    category: 'general-otc',
    boost: 2.0,
    description: 'Common over-the-counter and general medications',
    keywords: [
      // Vitamins & supplements
      'folic acid',
      'iron',
      'ferrous sulphate',
      'vitamin D',
      'colecalciferol',
      'calcium',
      'iodine',
      'vitamin B12',
      'thiamine',
      'multivitamin',
      
      // Thyroid
      'levothyroxine',
      'thyroxine',
      'carbimazole',
      
      // Osteoporosis
      'alendronate',
      'risedronate',
      'denosumab',
      
      // Gout
      'allopurinol',
      'colchicine',
      
      // Others
      'methotrexate',
      'hydroxychloroquine',
      'azathioprine',
      
      // Brand names
      'Elevit',
      'Blackmores',
      'Eltroxin',
      'Prolia',
    ],
  },

  // ---------------------------------------------------------------------------
  // 12. CLINICAL TERMINOLOGY
  // ---------------------------------------------------------------------------
  {
    category: 'clinical-terms',
    boost: 2.0,
    description: 'Common medical terminology and abbreviations',
    keywords: [
      // Symptoms
      'dyspnoea',
      'dyspnea',
      'dysuria',
      'nausea',
      'vertigo',
      'syncope',
      'angina',
      'palpitations',
      'haematuria',
      'haemoptysis',
      
      // Anatomy
      'thorax',
      'abdomen',
      'auscultation',
      'palpation',
      'percussion',
      
      // Conditions
      'hypertension',
      'diabetes',
      'hyperlipidaemia',
      'asthma',
      'COPD',
      'gastroenteritis',
      'cellulitis',
      'pneumonia',
      'bronchitis',
      
      // Procedures
      'ECG',
      'spirometry',
      'urinalysis',
      
      // Abbreviations (expanded)
      'prn',
      'PRN',
      'twice daily',
      'three times daily',
      'nocte',
      'mane',
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
