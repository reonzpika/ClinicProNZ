'use client';

import { Plus, User, UserCheck, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useConsultation } from '@/shared/ConsultationContext';

type PatientSessionManagerProps = {
  isCompact?: boolean;
};

export const PatientSessionManager: React.FC<PatientSessionManagerProps> = ({ isCompact = false }) => {
  const {
    patientSessions = [],
    currentPatientSessionId,
    createPatientSession = async () => null,
    switchToPatientSession = () => {},
    completePatientSession = () => {},
    loadPatientSessions = async () => {},
    getCurrentPatientSession = () => null,
    templateId,
  } = useConsultation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load patient sessions on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && loadPatientSessions) {
      loadPatientSessions();
    }
  }, [loadPatientSessions]);

  const handleCreatePatient = useCallback(async () => {
    if (!newPatientName.trim() || !createPatientSession) {
      return;
    }

    setIsCreating(true);
    try {
      await createPatientSession(newPatientName.trim(), templateId);
      setNewPatientName('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create patient session:', error);
    } finally {
      setIsCreating(false);
    }
  }, [newPatientName, createPatientSession, templateId]);

  const handleSwitchPatient = useCallback((sessionId: string) => {
    if (switchToPatientSession) {
      switchToPatientSession(sessionId);
    }
  }, [switchToPatientSession]);

  const handleCompleteSession = useCallback(() => {
    if (currentPatientSessionId && completePatientSession) {
      completePatientSession(currentPatientSessionId);
    }
  }, [currentPatientSessionId, completePatientSession]);

  const currentSession = getCurrentPatientSession();
  const activeSessions = patientSessions.filter(session => session.status === 'active');
  const completedSessions = patientSessions.filter(session => session.status === 'completed');

  // Don't render if feature is not enabled or on server side
  if (typeof window === 'undefined') {
    return null;
  }

  if (isCompact) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="size-4 text-blue-600" />
              <span className="text-sm font-medium">
                {currentSession ? currentSession.patientName : 'No Patient Selected'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                size="sm"
                className="h-6 px-2 text-xs"
              >
                <Plus className="mr-1 size-3" />
                New
              </Button>
              {activeSessions.length > 1 && (
                <Select value={currentPatientSessionId || ''} onValueChange={handleSwitchPatient}>
                  <SelectTrigger className="h-6 w-24 text-xs">
                    <SelectValue placeholder="Switch" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeSessions.map(session => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.patientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>

        {/* Create Patient Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Patient Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input
                  id="patient-name"
                  value={newPatientName}
                  onChange={e => setNewPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreatePatient();
                    }
                  }}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreatePatient}
                  disabled={!newPatientName.trim() || isCreating}
                  className="flex-1"
                >
                  {isCreating ? 'Creating...' : 'Create Session'}
                </Button>
                <Button
                  onClick={() => setIsCreateDialogOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-5" />
          Patient Sessions
          <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">Beta</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Session */}
        {currentSession
          ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="size-4 text-green-600" />
                    <div>
                      <div className="font-medium text-green-800">{currentSession.patientName}</div>
                      <div className="text-xs text-green-600">
                        Started
                        {' '}
                        {new Date(currentSession.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleCompleteSession}
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Complete
                  </Button>
                </div>
              </div>
            )
          : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center space-x-2">
                  <User className="size-4 text-gray-400" />
                  <span className="text-sm text-gray-600">No active patient session</span>
                </div>
              </div>
            )}

        {/* Create New Session */}
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full"
          variant="outline"
        >
          <Plus className="mr-2 size-4" />
          Start New Patient Session
        </Button>

        {/* Active Sessions */}
        {activeSessions.length > 1 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">Other Active Sessions</h4>
            <div className="space-y-2">
              {activeSessions
                .filter(session => session.id !== currentPatientSessionId)
                .map(session => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded border p-2 text-sm"
                  >
                    <span>{session.patientName}</span>
                    <Button
                      onClick={() => handleSwitchPatient(session.id)}
                      size="sm"
                      variant="ghost"
                    >
                      Switch
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent Completed Sessions */}
        {completedSessions.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">
              Recent Completed Sessions
            </h4>
            <div className="space-y-1">
              {completedSessions.slice(0, 3).map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded border p-2 text-sm text-gray-600"
                >
                  <span>{session.patientName}</span>
                  <span className="text-xs">
                    {session.completedAt && new Date(session.completedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Patient Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Patient Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input
                  id="patient-name"
                  value={newPatientName}
                  onChange={e => setNewPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreatePatient();
                    }
                  }}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreatePatient}
                  disabled={!newPatientName.trim() || isCreating}
                  className="flex-1"
                >
                  {isCreating ? 'Creating...' : 'Create Session'}
                </Button>
                <Button
                  onClick={() => setIsCreateDialogOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
