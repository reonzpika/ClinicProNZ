export type Q4Type = 'ai_scribe' | 'dictation' | 'none';
export type Q3Topic = 'notes' | 'guidance' | 'acc' | 'referrals' | 'images';

export type SurveyPayload = {
  email: string;
  q1: string[];
  q2?: string | null;
  q3: Array<{ topic: Q3Topic; selected: string[]; free_text?: string }>;
  q4: { type: Q4Type; issue?: string; vendor?: string; no_try_reason?: string[] };
  q5: number; // 1-5
  q5_price_band?: string | null;
  opted_in: boolean;
};

export type AnalyticsEvent =
  | { type: 'survey_started'; sessionId?: string; timestamp: number }
  | { type: 'survey_question_viewed'; questionId: string; timestamp: number }
  | { type: 'survey_question_answered'; questionId: string; answer: unknown; timestamp: number }
  | { type: 'survey_dropped_off'; lastQuestionId: string; timestamp: number }
  | { type: 'survey_submitted'; id: string; email_opted_in: boolean; gold_lead: boolean; timestamp: number }
  | { type: 'survey_opt_in'; email_domain?: string; timestamp: number };

