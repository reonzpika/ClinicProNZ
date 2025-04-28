import type { Template } from './templates';

export type SessionStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export type Session = {
  id: string;
  name: string;
  status: SessionStatus;
  template: Template;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  notes: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    [key: string]: string | undefined;
  };
  metadata: {
    patientName?: string;
    patientId?: string;
    dateOfBirth?: string;
    gender?: string;
    [key: string]: string | undefined;
  };
};

export type SessionSummary = Pick<Session, 'id' | 'name' | 'status' | 'createdAt' | 'updatedAt' | 'metadata'>; 