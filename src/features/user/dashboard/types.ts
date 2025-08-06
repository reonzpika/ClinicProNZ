export interface SessionData {
  id: string;
  dateTime: string;
  template: string;
  duration: number; // minutes
  generationTime: number; // seconds
  completionTime: number; // minutes (generation to completion)
  satisfaction: number; // 1-5 stars
  status: 'generated' | 'edited' | 'completed' | 'failed';
  consent: boolean;
  transcript?: string;
  finalNote?: string;
  patientInitials?: string;
}

export interface MetricData {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    color: 'green' | 'red' | 'gray';
  };
  subtitle?: string;
}

export interface FilterOptions {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  template: string;
  status: string;
  satisfaction: number[];
  search: string;
}

export interface OverviewMetrics {
  totalSessions: number;
  totalSessionsTrend: string;
  sessionsToday: number;
  sessionsTodayTrend: string;
  activeSessions: {
    generated: number;
    edited: number;
    completed: number;
    failed: number;
  };
  averageConsultationTime: number; // minutes
  consultationTimeTrend: string;
  timeSavedToday: number; // hours
  timeSavedTrend: string;
  adminTimeSaved: number; // NZD value
  adminTimeSavedTrend: string;
  consentCompliance: number; // percentage
}