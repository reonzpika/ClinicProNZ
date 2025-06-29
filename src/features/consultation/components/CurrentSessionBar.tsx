'use client';

import { Calendar, ChevronDown, User, UserCheck } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { useConsultation } from '@/shared/ConsultationContext';
import { useResponsive } from '@/shared/hooks/useResponsive';

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
  } = useConsultation();

  const { isLargeDesktop } = useResponsive();

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

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Don't render on server side
  if (typeof window === 'undefined') {
    return null;
  }

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
                                {currentSession.patientName}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
