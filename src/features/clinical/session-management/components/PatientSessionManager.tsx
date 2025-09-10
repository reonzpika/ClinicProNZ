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
    getCurrentPatientSession,
    patientSessions = [],
    currentPatientSessionId,
    ensureActiveSession,
  } = useConsultationStores();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isEnsuring, setIsEnsuring] = useState(false);

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

  // 🆕 ENSURE ACTIVE SESSION: Auto-create or auto-select session when needed
  useEffect(() => {
    const ensureSession = async () => {
      // Only run once per mount and when user is ready
      if (!isClient || !isLoaded || !isSignedIn || isEnsuring) {
        return;
      }

      // If we already have a current session, we're good
      const currentSession = getCurrentPatientSession();
      if (currentSession && currentPatientSessionId) {
        return;
      }

      setIsEnsuring(true);
      try {
        // Check if we have any active sessions to auto-select
        const activeSessions = patientSessions.filter((s: any) => s.status === 'active');

        if (activeSessions.length > 0) {
          // Auto-select the most recent active session
          const mostRecent = activeSessions.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )[0];

          switchToPatientSession(mostRecent.id);
        } else {
          // No active sessions - create a new one
          const newSessionId = await ensureActiveSession();
          if (newSessionId) {
            switchToPatientSession(newSessionId);
          }
        }
      } catch (error) {
        console.error('[SessionManager] Failed to ensure active session:', error);
      } finally {
        setIsEnsuring(false);
      }
    };

    // Run after sessions are loaded
    if (Array.isArray(patientSessions)) {
      ensureSession();
    }
  }, [
    isClient,
    isLoaded,
    isSignedIn,
    getCurrentPatientSession,
    currentPatientSessionId,
    patientSessions,
    switchToPatientSession,
    ensureActiveSession,
    isEnsuring,
  ]);

  const handleSwitchSession = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Current session bar - always show for signed in users */}
      <CurrentSessionBar onSwitchSession={handleSwitchSession} isLoading={isEnsuring} />

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
