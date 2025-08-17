'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';

import { CurrentSessionBar } from './CurrentSessionBar';
import { SessionModal } from './SessionModal';

export const PatientSessionManager: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const {
    loadPatientSessions = async () => {},
    switchToPatientSession,
  } = useConsultationStores();

  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (isClient && isLoaded && isSignedIn && loadPatientSessions) {
      loadPatientSessions().catch(() => {
        // Silently handle errors
      });
    }
  }, [isClient, isLoaded, isSignedIn, loadPatientSessions]);

  const handleSwitchSession = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Current session bar - always show for signed in users */}
      <CurrentSessionBar onSwitchSession={handleSwitchSession} />

      {/* Session management modal */}
      {isClient && isSignedIn && (
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
