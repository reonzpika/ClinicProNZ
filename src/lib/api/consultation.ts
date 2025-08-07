import { createAuthHeadersWithGuest } from '@/src/shared/utils'
import type { PatientSession } from '@/src/types/consultation'

// Types for API requests and responses
export interface ConsultationChatRequest {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  consultationNote?: string
  useContext?: boolean
  rawConsultationData?: {
    transcription?: string
    typedInput?: string
  }
}

export interface ConsultationChatResponse {
  response: string
}

export interface ConsultationNotesRequest {
  rawConsultationData: string
  templateId: string
  guestToken?: string | null
}

export interface ConsultationNotesResponse {
  notes: string
}

// PatientSession type imported from types/consultation.ts

// API functions for consultation endpoints
export const consultationApi = {
  // Chat with AI assistant
  async chat(
    request: ConsultationChatRequest,
    userId?: string | null,
    userTier?: string,
    guestToken?: string | null
  ): Promise<ConsultationChatResponse> {
    const response = await fetch('/api/consultation/chat', {
      method: 'POST',
      headers: createAuthHeadersWithGuest(userId, userTier, guestToken),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get response' }))
      throw new Error(errorData.error || 'Failed to get response from chatbot')
    }

    const responseData = await response.json()
    if (!responseData?.response) {
      throw new Error('No response body')
    }

    return responseData
  },

  // Generate consultation notes
  async generateNotes(
    request: ConsultationNotesRequest,
    userId?: string | null,
    userTier?: string
  ): Promise<ConsultationNotesResponse> {
    const response = await fetch('/api/consultation/notes', {
      method: 'POST',
      headers: createAuthHeadersWithGuest(userId, userTier, request.guestToken),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to generate notes' }))
      throw new Error(errorData.error || 'Failed to generate consultation notes')
    }

    return response.json()
  },

  // Patient session management
  async createSession(
    patientName: string,
    userId?: string | null,
    userTier?: string,
    guestToken?: string | null,
    templateId?: string
  ): Promise<PatientSession> {
    const response = await fetch('/api/patient-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeadersWithGuest(userId, userTier, guestToken),
      },
      body: JSON.stringify({ patientName, templateId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create session' }))
      throw new Error(errorData.error || 'Failed to create new patient session')
    }

    const data = await response.json()
    return data.session // Extract the session from the wrapper
  },

  async updateSession(
    sessionId: string,
    updates: Partial<Pick<PatientSession, 'patientName' | 'consultationNotes'>>,
    userId?: string | null,
    userTier?: string,
    guestToken?: string | null
  ): Promise<PatientSession> {
    const response = await fetch('/api/patient-sessions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeadersWithGuest(userId, userTier, guestToken),
      },
      body: JSON.stringify({ sessionId, ...updates }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update session' }))
      throw new Error(errorData.error || 'Failed to update session')
    }

    const data = await response.json()
    return data.session // Extract the session from the wrapper
  },

  async getSessions(
    userId?: string | null,
    userTier?: string,
    guestToken?: string | null
  ): Promise<PatientSession[]> {
    const response = await fetch('/api/patient-sessions', {
      method: 'GET',
      headers: createAuthHeadersWithGuest(userId, userTier, guestToken),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get sessions' }))
      throw new Error(errorData.error || 'Failed to fetch patient sessions')
    }

    const data = await response.json()
    return data.sessions // Extract the sessions array from the wrapper
  },

  async deleteSession(
    sessionId: string,
    userId?: string | null,
    userTier?: string,
    guestToken?: string | null
  ): Promise<void> {
    const response = await fetch('/api/patient-sessions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeadersWithGuest(userId, userTier, guestToken),
      },
      body: JSON.stringify({ sessionId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete session' }))
      throw new Error(errorData.error || 'Failed to delete session')
    }
  },

  async deleteAllSessions(
    userId?: string | null,
    userTier?: string,
    guestToken?: string | null
  ): Promise<void> {
    const response = await fetch('/api/patient-sessions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeadersWithGuest(userId, userTier, guestToken),
      },
      body: JSON.stringify({ deleteAll: true }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete sessions' }))
      throw new Error(errorData.error || 'Failed to delete all sessions')
    }
  },
}