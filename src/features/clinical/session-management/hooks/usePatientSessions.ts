import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createAuthHeaders } from '@/src/shared/utils';

export type PatientSession = {
  id: string;
  patientName: string;
  status: 'active' | 'completed' | 'archived' | string;
  createdAt: string;
  updatedAt: string;
};

const qs = {
  list: (userId?: string) => ['patient-sessions', 'list', userId || 'anon'] as const,
};

export function usePatientSessions() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: qs.list(userId || ''),
    queryFn: async (): Promise<PatientSession[]> => {
      if (!userId) return [];
      const res = await fetch('/api/patient-sessions?status=active&limit=100', {
        headers: createAuthHeaders(userId),
      });
      if (!res.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await res.json();
      return (data.sessions || []).map((s: any) => ({
        id: s.id,
        patientName: s.patientName || 'Untitled Session',
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  const create = useMutation({
    mutationFn: async (patientName: string): Promise<PatientSession> => {
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/patient-sessions?suppressSetCurrent=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...createAuthHeaders(userId) },
        body: JSON.stringify({ patientName }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to create session');
      }
      const data = await res.json();
      const s = data.session;
      return { id: s.id, patientName: s.patientName || 'Untitled Session', status: s.status, createdAt: s.createdAt, updatedAt: s.updatedAt };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qs.list(userId || '') });
    },
  });

  const rename = useMutation({
    mutationFn: async ({ sessionId, patientName }: { sessionId: string; patientName: string }): Promise<void> => {
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch('/api/patient-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...createAuthHeaders(userId) },
        body: JSON.stringify({ sessionId, patientName }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to rename session');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qs.list(userId || '') });
    },
  });

  return {
    sessions: list.data || [],
    isLoading: list.isLoading,
    create,
    rename,
    refetch: () => queryClient.invalidateQueries({ queryKey: qs.list(userId || '') }),
  };
}
