'use client';

import { useAuth } from '@clerk/nextjs';
import { Calendar, ChevronDown, Smartphone, User, UserCheck } from 'lucide-react';
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
  const { isSignedIn, isLoaded } = useAuth();
  const {
    getCurrentPatientSession = () => null,
    completePatientSession = () => {},
    updatePatientSession = () => {},
    createPatientSession = () => null,
    switchToPatientSession = () => {},
    resetConsultation = () => {},
    // Phase 4: Access mobile device state
    mobileV2 = { isEnabled: false, token: null, tokenData: null, connectionStatus: 'disconnected' },
  } = useConsultationStores();

  const { isLargeDesktop } = useResponsive();

  // Immediate disable approach for new patient creation (replaces debounce)
  const [isCreatingNewPatient, setIsCreatingNewPatient] = useState<boolean>(false);

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

    try {
      await updatePatientSession(editingSession.sessionId, {
        patientName: editingSession.tempName.trim(),
      });
      closeEditDialog();
    } catch {
      // Failed to update patient name - silently handle error
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

    try {
      await completePatientSession(currentSession.id);
    } catch (error) {
      console.error('Failed to complete session:', error);
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

      // Generate a new patient name with current timestamp
      const now = new Date();
      const patientName = `Patient ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

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
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Don't render on server side or while auth is loading
  if (typeof window === 'undefined' || !isLoaded) {
    return (
      <Card className="border-blue-200 bg-blue-50 shadow-sm">
        <CardContent className="p-3">
          <div className={isLargeDesktop ? 'space-y-3' : 'flex items-center justify-between'}>
            <div className={isLargeDesktop ? 'space-y-2' : 'flex min-w-0 flex-1 items-center space-x-3'}>
              <div className={isLargeDesktop ? 'flex items-center gap-2' : 'flex min-w-0 flex-1 items-center space-x-3'}>
                <div className="size-4 shrink-0 animate-pulse rounded bg-blue-300" />
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-blue-300" />
                  <div className="mt-1 h-3 w-24 animate-pulse rounded bg-blue-200" />
                </div>
              </div>
            </div>
            <div className={isLargeDesktop ? 'flex gap-2' : 'flex shrink-0 items-center gap-2'}>
              <div className="h-7 w-16 animate-pulse rounded bg-blue-200" />
              <div className="h-7 w-20 animate-pulse rounded bg-blue-200" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show authentication prompt for unauthenticated users
  if (!isSignedIn) {
    return (
      <Card className="border-blue-200 bg-blue-50 shadow-sm">
        <CardContent className="p-3">
          <div className={isLargeDesktop ? 'space-y-2' : 'flex items-center justify-between'}>
            <div className={isLargeDesktop ? 'flex items-center gap-2' : 'flex min-w-0 flex-1 items-center space-x-3'}>
              <User className="size-4 shrink-0 text-blue-600" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-blue-800">
                  Single Session Mode
                </div>
                <div className="text-xs text-blue-600">
                  Upgrade to save and manage multiple patient sessions
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show session management for authenticated users
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
                              <Input
                                value={editingSession.tempName}
                                onChange={e => setEditingSession(prev => ({
                                  ...prev,
                                  tempName: e.target.value,
                                }))}
                                onBlur={handleSaveEdit}
                                onKeyDown={handleEditKeyDown}
                                className="h-6 border-blue-300 bg-blue-50 text-sm font-medium text-blue-800 focus:border-blue-500"
                              />
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

                {/* Phase 4: Mobile Device Status */}
                {mobileV2.isEnabled && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">•</span>
                    <Smartphone className="size-3" />
                    <span
                      className={`text-xs ${
                        mobileV2.connectionStatus === 'connected'
                          ? 'text-green-600'
                          : mobileV2.connectionStatus === 'connecting'
                            ? 'text-yellow-600'
                            : mobileV2.connectionStatus === 'error'
                              ? 'text-red-600'
                              : 'text-gray-500'
                      }`}
                    >
                      {mobileV2.connectionStatus === 'connected'
                        ? 'mobile connected'
                        : mobileV2.connectionStatus === 'connecting'
                          ? 'connecting mobile'
                          : mobileV2.connectionStatus === 'error'
                            ? 'mobile error'
                            : 'mobile ready'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={isLargeDesktop ? 'flex gap-2' : 'flex shrink-0 items-center gap-2'}>
            {currentSession && currentSession.status !== 'completed' && (
              <Button
                onClick={handleCompleteSession}
                size="sm"
                variant="outline"
                className="h-7 border-blue-300 px-3 text-xs text-blue-700 hover:bg-blue-100"
              >
                Complete
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
              {isCreatingNewPatient ? 'Creating…' : 'New Patient'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
