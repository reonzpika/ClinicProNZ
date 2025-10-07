'use client';

import { Calendar, ChevronDown, RefreshCw, User, UserCheck } from 'lucide-react';
import { useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';
import { useResponsive } from '@/src/shared/hooks/useResponsive';

type CurrentSessionBarProps = {
  onSwitchSession: () => void;
  isLoading?: boolean;
};

export const CurrentSessionBar: React.FC<CurrentSessionBarProps> = ({
  onSwitchSession,
  isLoading = false,
}) => {
  const {
    getCurrentPatientSession = () => null,
    updatePatientSession = () => {},
    // Mobile device state removed in simplified architecture
  } = useConsultationStores();

  const { isLargeDesktop } = useResponsive();

  // Loading states for various operations
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

  const formatSessionDate = (dateString?: string) => {
    const date = new Date(dateString || new Date());
    const parts = new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value || '';
    return {
      date: `${get('day')}/${get('month')}/${get('year')}`,
      time: `${get('hour')}:${get('minute')}`,
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
                {isLoading
                  ? (
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                        <RefreshCw className="size-3 animate-spin text-blue-600" />
                        Loading...
                      </div>
                    )
                  : currentSession
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
            <Button
              onClick={onSwitchSession}
              size="sm"
              variant="outline"
              disabled={isLoading}
              className="h-7 border-blue-300 px-3 text-xs text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
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
