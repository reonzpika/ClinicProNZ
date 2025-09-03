export type RagQueryResult = {
  content: string;
  title: string;
  source: string;
  sourceType: string;
  score: number;
  // Summary fields for smart content selection (JSONB fields are auto-parsed by Drizzle)
  sectionSummaries?: Record<string, string[]> | null;
  overallSummary?: string | null;
  sections?: Record<string, string> | null;
  enhancementStatus?: string | null;
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
