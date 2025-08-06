import { createAuthHeadersWithGuest } from '@/src/shared/utils'

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

export interface PatientSession {
  id: string
  patientName: string
  consultationNotes: string
  createdAt: string
  updatedAt: string
  userId: string
}

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
    guestToken?: string | null
  ): Promise<PatientSession> {
    const response = await fetch('/api/patient-sessions', {
      method: 'POST',
      headers: createAuthHeadersWithGuest(userId, userTier, guestToken),
      body: JSON.stringify({ patientName }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create session' }))
      throw new Error(errorData.error || 'Failed to create new patient session')
    }

    return response.json()
  },

  async updateSession(
    sessionId: string,
    updates: Partial<Pick<PatientSession, 'patientName' | 'consultationNotes'>>,
    userId?: string | null,
    userTier?: string,
    guestToken?: string | null
  ): Promise<PatientSession> {
    const response = await fetch(`/api/patient-sessions/${sessionId}`, {
      method: 'PATCH',
      headers: createAuthHeadersWithGuest(userId, userTier, guestToken),
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update session' }))
      throw new Error(errorData.error || 'Failed to update session')
    }

    return response.json()
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

    return response.json()
  },

  async deleteSession(
    sessionId: string,
    userId?: string | null,
    userTier?: string,
    guestToken?: string | null
  ): Promise<void> {
    const response = await fetch(`/api/patient-sessions/${sessionId}`, {
      method: 'DELETE',
      headers: createAuthHeadersWithGuest(userId, userTier, guestToken),
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
    const response = await fetch('/api/patient-sessions/delete-all', {
      method: 'DELETE',
      headers: createAuthHeadersWithGuest(userId, userTier, guestToken),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete sessions' }))
      throw new Error(errorData.error || 'Failed to delete all sessions')
    }
  },
}