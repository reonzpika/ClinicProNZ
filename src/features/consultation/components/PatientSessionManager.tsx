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
  const [isClient, setIsClient] = useState(false);

  const handleSessionSelect = useCallback((sessionId: string) => {
    switchToPatientSession(sessionId);
  }, [switchToPatientSession]);

  const handleSessionCreate = useCallback((sessionId: string) => {
    switchToPatientSession(sessionId);
  }, [switchToPatientSession]);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load patient sessions on client mount
  useEffect(() => {
    if (isClient && loadPatientSessions) {
      loadPatientSessions().then(() => {
        setHasInitialized(true);
      }).catch(() => {
        // Silently handle errors and still mark as initialized
        setHasInitialized(true);
      });
    }
  }, [isClient, loadPatientSessions]);

  // Auto-open modal when no session is selected and component has initialized
  useEffect(() => {
    if (hasInitialized && !currentPatientSessionId) {
      setIsModalOpen(true);
    }
  }, [hasInitialized, currentPatientSessionId]);

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

      {/* Session management modal - only show on client to prevent hydration issues */}
      {isClient && (
        <SessionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSessionSelected={handleSessionSelect}
          onSessionCreated={handleSessionCreate}
        />
      )}
    </>
  );
};
