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
  sourceType: 'bpac' | 'moh' | 'manual';
};
