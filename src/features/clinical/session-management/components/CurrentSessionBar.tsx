'use client';

import { Calendar, ChevronDown, RefreshCw, Smartphone, User, UserCheck } from 'lucide-react';
import { useCallback, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';
import { useResponsive } from '@/src/shared/hooks/useResponsive';

type CurrentSessionBarProps = {
  onSwitchSession: () => void;
};

export const CurrentSessionBar: React.FC<CurrentSessionBarProps> = ({
  onSwitchSession,
}) => {
  const {
    getCurrentPatientSession = () => null,
    completePatientSession = () => {},
    updatePatientSession = () => {},
    createPatientSession = () => null,
    switchToPatientSession = () => {},
    resetConsultation = () => {},
    // Mobile device state removed in simplified architecture
  } = useConsultationStores();

  const { isLargeDesktop } = useResponsive();

  // Loading states for various operations
  const [isCreatingNewPatient, setIsCreatingNewPatient] = useState<boolean>(false);
  const [isCompletingSession, setIsCompletingSession] = useState<boolean>(false);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  const [editingSession, setEditingSession] = useState<{
    sessionId: string | null;
    tempName: string;
  }>({ sessionId: null, tempName: '' });

  const currentSession = getCurrentPatientSession();

  const closeEditDialog = () => {
    setEditingSession({ sessionId: null, tempName: '' });
  };

  const handleStartEdit = (sessionId: string, currentName: string) => {
    setEditingSession({ sessionId, tempName: currentName });
  };

  const handleSaveEdit = async () => {
    if (!editingSession.sessionId || !editingSession.tempName.trim()) {
      closeEditDialog();
      return;
    }

    setIsSavingEdit(true);
    try {
      await updatePatientSession(editingSession.sessionId, {
        patientName: editingSession.tempName.trim(),
      });
      closeEditDialog();
    } catch {
      // Failed to update patient name - silently handle error
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      closeEditDialog();
    }
  };

  const handleCompleteSession = async () => {
    if (!currentSession) {
      return;
    }

    setIsCompletingSession(true);
    try {
      const success = await completePatientSession(currentSession.id);
      if (!success) {
        console.error('Failed to complete session');
      }
    } catch (error) {
      console.error('Failed to complete session:', error);
    } finally {
      setIsCompletingSession(false);
    }
  };

  const handleNewPatient = useCallback(async () => {
    if (isCreatingNewPatient) {
 return;
} // Guard against re-entry
    setIsCreatingNewPatient(true);
    try {
      // TODO: Add save logic here similar to GeneratedNotes component
      // For now, this creates a new session without auto-saving the current one
      // Users should manually save their work before creating a new session

      // Simple patient name - date/time info stored in session table
      const patientName = 'Patient';

      // Create new patient session
      const newSession = await createPatientSession(patientName);
      if (!newSession) {
        throw new Error('Failed to create new patient session');
      }

      // Switch to the new session
      switchToPatientSession(newSession.id);
      // Reset consultation data for the new patient (UI only)
      resetConsultation();
    } catch (error) {
      console.error('Error creating new patient:', error);
    } finally {
      setIsCreatingNewPatient(false);
    }
  }, [createPatientSession, switchToPatientSession, resetConsultation, isCreatingNewPatient]);

  const formatSessionDate = (dateString?: string) => {
    const date = new Date(dateString || new Date());
    return {
      date: date.toLocaleDateString('en-GB'),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <Card className="border-blue-200 bg-blue-50 shadow-sm">
      <CardContent className="p-3">
        <div className={isLargeDesktop ? 'space-y-3' : 'flex items-center justify-between'}>
          {/* Session Information */}
          <div className={isLargeDesktop ? 'space-y-2' : 'flex min-w-0 flex-1 items-center space-x-3'}>
            <div className={isLargeDesktop ? 'flex items-center gap-2' : 'flex min-w-0 flex-1 items-center space-x-3'}>
              <UserCheck className="size-4 shrink-0 text-blue-600" />

              <div className={isLargeDesktop ? 'min-w-0 flex-1' : 'min-w-0 flex-1'}>
                {currentSession
                  ? (
                      <>
                        {/* Patient Name - Editable */}
                        {editingSession.sessionId === currentSession.id
                          ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingSession.tempName}
                                  onChange={e => setEditingSession(prev => ({
                                    ...prev,
                                    tempName: e.target.value,
                                  }))}
                                  onBlur={handleSaveEdit}
                                  onKeyDown={handleEditKeyDown}
                                  disabled={isSavingEdit}
                                  className="h-6 border-blue-300 bg-blue-50 text-sm font-medium text-blue-800 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {isSavingEdit && (
                                  <RefreshCw className="size-3 animate-spin text-blue-600" />
                                )}
                              </div>
                            )
                          : (
                              <div
                                className="cursor-pointer truncate text-sm font-medium text-blue-800 hover:text-blue-900 hover:underline"
                                onClick={() => handleStartEdit(currentSession.id, currentSession.patientName)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleStartEdit(currentSession.id, currentSession.patientName);
                                  }
                                }}
                                role="button"
                                tabIndex={0}
                                title="Click to edit patient name"
                              >
                                {currentSession.patientName || 'Untitled Session'}
                              </div>
                            )}
                      </>
                    )
                  : (
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">No Patient Selected</span>
                      </div>
                    )}
              </div>
            </div>

            {/* Session Date/Time - Moved outside patient name for large desktop */}
            {currentSession && (
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <Calendar className="size-3" />
                <span>
                  {formatSessionDate(currentSession.createdAt).date}
                  {' '}
                  •
                  {formatSessionDate(currentSession.createdAt).time}
                </span>
                {currentSession.status === 'completed' && (
                  <span className="rounded bg-blue-200 px-1.5 py-0.5 text-xs text-blue-700">
                    Completed
                  </span>
                )}

                {/* Mobile Device Status removed in simplified architecture */}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={isLargeDesktop ? 'flex gap-2' : 'flex shrink-0 items-center gap-2'}>
            {currentSession && currentSession.status !== 'completed' && (
              <Button
                onClick={handleCompleteSession}
                disabled={isCompletingSession}
                size="sm"
                variant="outline"
                className="h-7 border-blue-300 px-3 text-xs text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCompletingSession
? (
                  <>
                    <RefreshCw className="mr-1 size-3 animate-spin" />
                    Completing...
                  </>
                )
: (
                  'Complete'
                )}
              </Button>
            )}

            <Button
              onClick={onSwitchSession}
              size="sm"
              variant="outline"
              className="h-7 border-blue-300 px-3 text-xs text-blue-700 hover:bg-blue-100"
            >
              <span className="mr-1">Switch Session</span>
              <ChevronDown className="size-3" />
            </Button>

            <Button
              onClick={handleNewPatient}
              size="sm"
              variant="default"
              disabled={isCreatingNewPatient}
              className="h-7 bg-blue-600 px-3 text-xs text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              title={isCreatingNewPatient ? 'Creating…' : 'Create new patient session'}
              aria-busy={isCreatingNewPatient}
            >
              {isCreatingNewPatient
? (
                <>
                  <RefreshCw className="mr-1 size-3 animate-spin" />
                  Creating...
                </>
              )
: (
                'New Patient'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
