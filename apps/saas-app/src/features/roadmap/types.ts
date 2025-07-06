export type FeatureStatus = 'planned' | 'in_progress' | 'completed';

export type Feature = {
  id: number;
  title: string;
  description: string;
  status: FeatureStatus;
  vote_count: number;
  created_at: string;
};

export type FeatureRequest = {
  id?: number;
  idea: string;
  details?: string;
  email?: string;
  ip_address?: string;
  created_at?: string;
};

export type Vote = {
  id?: number;
  feature_id: number;
  ip_address?: string;
  created_at?: string;
};
