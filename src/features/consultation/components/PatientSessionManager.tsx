'use client';

import { useCallback, useEffect, useState } from 'react';

import { useConsultation } from '@/shared/ConsultationContext';

import { CurrentSessionBar } from './CurrentSessionBar';
import { SessionModal } from './SessionModal';

export const PatientSessionManager: React.FC = () => {
  const {
    currentPatientSessionId,
    loadPatientSessions = async () => {},
    switchToPatientSession,
  } = useConsultation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const handleSessionSelect = useCallback((sessionId: string) => {
    switchToPatientSession(sessionId);
  }, [switchToPatientSession]);

  const handleSessionCreate = useCallback((sessionId: string) => {
    switchToPatientSession(sessionId);
  }, [switchToPatientSession]);

  // Load patient sessions on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && loadPatientSessions) {
      loadPatientSessions().then(() => {
        setHasInitialized(true);
      });
    }
  }, [loadPatientSessions]);

  // Auto-open modal when no session is selected and component has initialized
  useEffect(() => {
    if (hasInitialized && !currentPatientSessionId) {
      setIsModalOpen(true);
    }
  }, [hasInitialized, currentPatientSessionId]);

  // Don't render if feature is not enabled or on server side
  if (typeof window === 'undefined') {
    return null;
  }

  const handleSwitchSession = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Always show the current session bar */}
      <CurrentSessionBar onSwitchSession={handleSwitchSession} />

      {/* Session management modal */}
      <SessionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSessionSelected={handleSessionSelect}
        onSessionCreated={handleSessionCreate}
      />
    </>
  );
};
