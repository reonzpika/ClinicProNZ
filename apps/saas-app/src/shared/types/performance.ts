export type PerformanceMetrics = {
  startTime: number;
  endTime: number;
  responseTime: number;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  costEstimate: number;
};

export type NoteGenerationMetrics = PerformanceMetrics & {
  sectionCount: number;
  wordCount: number;
  quickNotesCount: number;
};
