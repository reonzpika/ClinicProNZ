'use client';

import { Calendar, Plus, Search, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';
import { Input } from '@/src/shared/components/ui/input';

type SessionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSessionSelected: (sessionId: string) => void;
  onSessionCreated: (sessionId: string) => void;
};

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  onSessionSelected,
  onSessionCreated,
}) => {
  const {
    patientSessions = [],
    currentPatientSessionId,
    createPatientSession = async () => null,
    switchToPatientSession = () => {},
    deletePatientSession = async () => false,
    // unified helper
    // deleteSessionAndMaybeSwitch available via stores
    // finishCurrentSessionFresh available via stores (not used here)
    // fallback to deletePatientSession if helper missing
    deleteSessionAndMaybeSwitch = async (_id: string) => false,
    deleteAllPatientSessions = async () => false,
    loadPatientSessions = async () => {},
  } = useConsultationStores();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Load sessions when modal opens
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && loadPatientSessions) {
      loadPatientSessions();
    }
  }, [isOpen, loadPatientSessions]);

  // Auto-generated patient name
  const generatePatientName = () => {
    return 'Patient';
  };

  // Filter sessions based on search
  const filteredSessions = patientSessions.filter((session: any) =>
    (session.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort sessions: active sessions first (most recent first), then completed sessions (most recent first)
  const sortedSessions = filteredSessions.sort((a: any, b: any) => {
    // First, sort by status: active sessions come before completed sessions
    if (a.status !== b.status) {
      if (a.status === 'completed' && b.status !== 'completed') {
        return 1; // a goes after b
      }
      if (a.status !== 'completed' && b.status === 'completed') {
        return -1; // a goes before b
      }
    }

    // Within the same status group, sort by createdAt (most recent first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const newSession = await createPatientSession(generatePatientName());
      if (newSession) {
        onSessionCreated(newSession.id);
        onClose();
      }
    } catch (error) {
      console.error('Failed to create patient session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSwitchSession = async (sessionId: string) => {
    try {
      await switchToPatientSession(sessionId);
      onSessionSelected(sessionId);
      onClose();
    } catch (error) {
      console.error('Failed to switch patient session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (deleteConfirmId === sessionId) {
      try {
        // If this was the only session before deletion, close the modal after delete
        const wasLastSession = Array.isArray(patientSessions) && patientSessions.length <= 1;
        // Use unified helper when available to also switch if deleting current
        const ok = (await deleteSessionAndMaybeSwitch(sessionId)) || (await deletePatientSession(sessionId));
        setDeleteConfirmId(null);
        // If we deleted the current session, modal should stay open for user to select another
        // Updated behavior: if it was the last session, server creates a new one and we auto-close
        if (wasLastSession) {
          onClose();
        }
      } catch (error) {
        console.error('Failed to delete patient session:', error);
      }
    } else {
      setDeleteConfirmId(sessionId);
    }
  };

  const handleDeleteAllSessions = async () => {
    if (showDeleteAllConfirm) {
      setIsDeletingAll(true);
      try {
        await deleteAllPatientSessions();
        setShowDeleteAllConfirm(false);
        // Modal should stay open after deleting all sessions (empty state)
        // Updated behavior: server creates a replacement session; close modal
        onClose();
      } catch (error) {
        console.error('Failed to delete all patient sessions:', error);
      } finally {
        setIsDeletingAll(false);
      }
    } else {
      setShowDeleteAllConfirm(true);
    }
  };

  const formatSessionDate = (dateString?: string) => {
    const date = new Date(dateString || new Date());
    return {
      date: date.toLocaleDateString('en-GB'),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getSessionSummary = (session: any) => {
    // Create a brief summary from session data
    // Priority: generated notes > typed input > transcription > consultation notes

    // 1. Generated notes (primary content)
    if (session.notes && session.notes.trim().length > 0) {
      return session.notes.substring(0, 80) + (session.notes.length > 80 ? '...' : '');
    }

    // 2. Typed input
    if (session.typedInput && session.typedInput.trim().length > 0) {
      return session.typedInput.substring(0, 80) + (session.typedInput.length > 80 ? '...' : '');
    }

    // 3. Transcriptions (voice input)
    if (session.transcriptions && session.transcriptions.length > 0) {
      const transcriptText = session.transcriptions.map((t: any) => t.text).join(' ');
      if (transcriptText.trim().length > 0) {
        return transcriptText.substring(0, 80) + (transcriptText.length > 80 ? '...' : '');
      }
    }

    return 'No content yet';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col border border-slate-200 bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="size-5" />
            Patient Sessions
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Search, Create New, and Delete All Row */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleCreateSession}
              disabled={isCreating}
              className="shrink-0"
            >
              <Plus className="mr-2 size-4" />
              {isCreating ? 'Creating...' : 'Create New'}
            </Button>
            {patientSessions.length > 0 && (
              <Button
                onClick={handleDeleteAllSessions}
                disabled={isDeletingAll}
                variant="outline"
                className={`shrink-0 ${
                  showDeleteAllConfirm
                    ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                    : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                }`}
              >
                <Trash2 className="mr-2 size-4" />
                {isDeletingAll
                  ? 'Deleting...'
                  : showDeleteAllConfirm
                    ? 'Confirm Delete All'
                    : 'Delete All'}
              </Button>
            )}
          </div>

          {/* Confirmation message for delete all */}
          {showDeleteAllConfirm && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">
                Are you sure you want to delete all
                {patientSessions.length}
                {' '}
                patient sessions? This action cannot be undone.
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  size="sm"
                  variant="outline"
                  className="text-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Sessions List */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {sortedSessions.length === 0
              ? (
                  <div className="py-8 text-center text-gray-500">
                    {searchQuery ? 'No sessions match your search' : 'No patient sessions found'}
                  </div>
                )
              : (
                  sortedSessions.map((session: any) => {
                    const { date, time } = formatSessionDate(session.createdAt);
                    const isCurrentSession = session.id === currentPatientSessionId;
                    const isDeleteConfirm = deleteConfirmId === session.id;

                    return (
                      <div
                        key={session.id}
                        className={`rounded-lg border p-4 transition-colors ${
                          isCurrentSession
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            {/* Session Header */}
                            <div className="mb-1 flex items-center gap-2">
                              <h3 className="truncate font-medium text-gray-900">
                                {session.patientName || 'Untitled Session'}
                              </h3>
                              {isCurrentSession && (
                                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                  Current
                                </span>
                              )}
                              {session.status === 'completed' && (
                                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                  Completed
                                </span>
                              )}
                            </div>

                            {/* Date and Time */}
                            <div className="mb-2 flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="size-4" />
                                <span>{date}</span>
                              </div>
                              <span>{time}</span>
                            </div>

                            {/* Session Summary */}
                            <p className="line-clamp-2 text-sm text-gray-600">
                              {getSessionSummary(session)}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="ml-4 flex gap-2">
                            {!isCurrentSession && (
                              <Button
                                onClick={() => handleSwitchSession(session.id)}
                                size="sm"
                                variant="outline"
                              >
                                Switch
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDeleteSession(session.id)}
                              size="sm"
                              variant="outline"
                              className={isDeleteConfirm
                                ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                                : 'text-red-600 hover:bg-red-50 hover:text-red-700'}
                            >
                              {isDeleteConfirm
                                ? (
                                    <>
                                      <Trash2 className="mr-1 size-3" />
                                      Confirm
                                    </>
                                  )
                                : (
                                    <Trash2 className="size-3" />
                                  )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
