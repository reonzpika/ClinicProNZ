'use client'

import React, { useState } from 'react'
import { Button } from '@/src/shared/components/ui/button'
import { Input } from '@/src/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card'
import { 
  usePatientSessions, 
  useCreatePatientSession, 
  useDeletePatientSession,
  useDeleteAllPatientSessions 
} from '@/src/hooks/consultation/useConsultationQueries'

export function SessionManager() {
  const [newPatientName, setNewPatientName] = useState('')

  // React Query hooks for session management
  const { 
    data: sessions = [], 
    isLoading: isLoadingSessions, 
    error: sessionsError,
    refetch: refetchSessions
  } = usePatientSessions()

  const createSessionMutation = useCreatePatientSession()
  const deleteSessionMutation = useDeletePatientSession()
  const deleteAllSessionsMutation = useDeleteAllPatientSessions()

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPatientName.trim()) return

    try {
      await createSessionMutation.mutateAsync(newPatientName.trim())
      setNewPatientName('')
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return

    try {
      await deleteSessionMutation.mutateAsync(sessionId)
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const handleDeleteAllSessions = async () => {
    if (!confirm('Are you sure you want to delete ALL sessions? This cannot be undone.')) return

    try {
      await deleteAllSessionsMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to delete all sessions:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Patient Sessions (React Query Demo)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create new session form */}
        <form onSubmit={handleCreateSession} className="flex gap-2">
          <Input
            placeholder="Patient name"
            value={newPatientName}
            onChange={(e) => setNewPatientName(e.target.value)}
            disabled={createSessionMutation.isPending}
          />
          <Button 
            type="submit" 
            disabled={createSessionMutation.isPending || !newPatientName.trim()}
          >
            {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
          </Button>
        </form>

        {/* Error states */}
        {createSessionMutation.error && (
          <div className="text-red-500 text-sm">
            Create Error: {createSessionMutation.error.message}
          </div>
        )}

        {sessionsError && (
          <div className="text-red-500 text-sm">
            Load Error: {sessionsError.message}
          </div>
        )}

        {/* Sessions list */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Sessions ({sessions.length})</h3>
            <div className="space-x-2">
              <Button
                onClick={() => refetchSessions()}
                disabled={isLoadingSessions}
                variant="outline"
                size="sm"
              >
                {isLoadingSessions ? 'Loading...' : 'Refresh'}
              </Button>
              {sessions.length > 0 && (
                <Button
                  onClick={handleDeleteAllSessions}
                  disabled={deleteAllSessionsMutation.isPending}
                  variant="destructive"
                  size="sm"
                >
                  {deleteAllSessionsMutation.isPending ? 'Deleting...' : 'Delete All'}
                </Button>
              )}
            </div>
          </div>

          {isLoadingSessions ? (
            <div className="text-sm text-gray-500">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-sm text-gray-500">No sessions found</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sessions.map((session: any) => (
                <div
                  key={session.id}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">{session.patientName}</div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteSession(session.id)}
                    disabled={deleteSessionMutation.isPending}
                    variant="outline"
                    size="sm"
                  >
                    {deleteSessionMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* React Query status indicator */}
        <div className="text-xs text-gray-500 border-t pt-2">
          <div>React Query Status:</div>
          <div>• Sessions: {isLoadingSessions ? 'Loading' : 'Loaded'}</div>
          <div>• Cache: {sessions.length} sessions cached</div>
          {createSessionMutation.isPending && <div>• Creating session...</div>}
          {deleteSessionMutation.isPending && <div>• Deleting session...</div>}
          {deleteAllSessionsMutation.isPending && <div>• Deleting all sessions...</div>}
        </div>
      </CardContent>
    </Card>
  )
}