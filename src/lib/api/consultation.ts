import { createAuthHeaders } from '@/src/shared/utils';
import type { PatientSession } from '@/src/types/consultation';

// Types for API requests and responses
export type ConsultationChatRequest = {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  consultationNote?: string;
  useContext?: boolean;
  rawConsultationData?: {
    transcription?: string;
  };
};

export type ConsultationChatResponse = {
  response: string;
};

export type ConsultationNotesRequest = {
  rawConsultationData: string;
  templateId: string;
};

export type ConsultationNotesResponse = {
  notes: string;
};

// PatientSession type imported from types/consultation.ts

// API functions for consultation endpoints
export const consultationApi = {
  // Chat with AI assistant
  async chat(
    request: ConsultationChatRequest,
    userId?: string | null,
  ): Promise<ConsultationChatResponse> {
    const response = await fetch('/api/consultation/chat', {
      method: 'POST',
      headers: createAuthHeaders(userId),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get response' }));
      throw new Error(errorData.error || 'Failed to get response from chatbot');
    }

    const responseData = await response.json();
    if (!responseData?.response) {
      throw new Error('No response body');
    }

    return responseData;
  },

  // Generate consultation notes (returns streaming response)
  async generateNotes(
    request: ConsultationNotesRequest,
    userId?: string | null,
    onProgress?: (chunk: string) => void,
  ): Promise<ConsultationNotesResponse> {
    const response = await fetch('/api/consultation/notes', {
      method: 'POST',
      headers: createAuthHeaders(userId),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to generate notes' }));
      throw new Error(errorData.error || 'Failed to generate consultation notes');
    }

    // Handle streaming response if callback provided
    if (onProgress && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let notes = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        notes += chunk;
        onProgress(chunk);
      }

      return { notes };
    }

    // Fallback for non-streaming usage (though this won't work with current API)
    return response.json();
  },

  // Patient session management
  async createSession(
    patientName: string,
    userId?: string | null,
    templateId?: string,
  ): Promise<PatientSession> {
    const response = await fetch('/api/patient-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(userId),
      },
      body: JSON.stringify({ patientName, templateId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create session' }));
      throw new Error(errorData.error || 'Failed to create new patient session');
    }

    const data = await response.json();
    return data.session; // Extract the session from the wrapper
  },

  async updateSession(
    sessionId: string,
    updates: Partial<PatientSession>,
    userId?: string | null,
  ): Promise<PatientSession> {
    const response = await fetch('/api/patient-sessions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(userId),
      },
      body: JSON.stringify({ sessionId, ...updates }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update session' }));
      throw new Error(errorData.error || 'Failed to update session');
    }

    const data = await response.json();
    return data.session; // Extract the session from the wrapper
  },

  async getSessions(
    userId?: string | null,
  ): Promise<PatientSession[]> {
    const response = await fetch('/api/patient-sessions', {
      method: 'GET',
      headers: createAuthHeaders(userId),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get sessions' }));
      throw new Error(errorData.error || 'Failed to fetch patient sessions');
    }

    const data = await response.json();
    return data.sessions; // Extract the sessions array from the wrapper
  },

  async deleteSession(
    sessionId: string,
    userId?: string | null,
  ): Promise<{ success: boolean; deletedSessionId: string; currentSessionId?: string; createdNew?: boolean; switchedToExisting?: boolean }> {
    const response = await fetch('/api/patient-sessions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(userId),
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete session' }));
      throw new Error(errorData.error || 'Failed to delete session');
    }

    return response.json();
  },

  async deleteAllSessions(
    userId?: string | null,
  ): Promise<{ success: boolean; deletedCount: number; currentSessionId: string; createdNew: boolean }> {
    const response = await fetch('/api/patient-sessions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(userId),
      },
      body: JSON.stringify({ deleteAll: true }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete sessions' }));
      throw new Error(errorData.error || 'Failed to delete all sessions');
    }

    return response.json();
  },
};
