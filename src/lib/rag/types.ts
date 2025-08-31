export type RagQueryResult = {
  content: string;
  title: string;
  source: string;
  sourceType: string;
  score: number;
};

export type RagResponse = {
  answer: string;
  sources: RagQueryResult[];
};

export type DocumentToIngest = {
  title: string;
  content: string;
  source: string;
  sourceType: 'bpac' | 'moh' | 'manual' | 'healthify';

  // Enhancement tracking
  enhancementStatus?: 'basic' | 'enhanced' | 'failed';
  basicContent?: string;
  lastEnhanced?: Date;

  // Optional structured fields
  sections?: Record<string, string>; // { "symptoms": "...", "treatment": "..." }
  overallSummary?: string;
  sectionSummaries?: Record<string, string[]>; // { "symptoms": ["point1", "point2"] }

  // Optional metadata
  author?: string;
  lastUpdated?: Date;
  categories?: string[];
  contentType?: string;
  medicalSpecialty?: string;
  targetAudience?: string;

  // Optional links
  internalLinks?: Array<{ text: string; url: string }>;
  externalCitations?: string[];
};
