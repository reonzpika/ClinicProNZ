'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [isLoadingUi, setIsLoadingUi] = useState(false);
  const loadingStartAtRef = useRef<number | null>(null);
  const showDelayRef = useRef<NodeJS.Timeout | null>(null);
  const hideDelayRef = useRef<NodeJS.Timeout | null>(null);

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

  // Smooth loading indicator: delay show and ensure minimum visible duration
  useEffect(() => {
    const SHOW_DELAY_MS = 200;
    const MIN_VISIBLE_MS = 400;

    // Clear pending timers
    if (showDelayRef.current) {
      clearTimeout(showDelayRef.current);
      showDelayRef.current = null;
    }
    if (hideDelayRef.current) {
      clearTimeout(hideDelayRef.current);
      hideDelayRef.current = null;
    }

    if (isEnsuring) {
      // Delay showing to avoid flicker on very fast operations
      showDelayRef.current = setTimeout(() => {
        loadingStartAtRef.current = Date.now();
        setIsLoadingUi(true);
      }, SHOW_DELAY_MS);
    } else {
      // If currently visible, keep for a minimum duration
      if (isLoadingUi) {
        const startedAt = loadingStartAtRef.current || 0;
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
        hideDelayRef.current = setTimeout(() => {
          setIsLoadingUi(false);
          loadingStartAtRef.current = null;
        }, remaining);
      } else {
        setIsLoadingUi(false);
        loadingStartAtRef.current = null;
      }
    }

    return () => {
      if (showDelayRef.current) {
        clearTimeout(showDelayRef.current);
        showDelayRef.current = null;
      }
      if (hideDelayRef.current) {
        clearTimeout(hideDelayRef.current);
        hideDelayRef.current = null;
      }
    };
  }, [isEnsuring, isLoadingUi]);

  const handleSwitchSession = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Current session bar - always show for signed in users */}
      <CurrentSessionBar onSwitchSession={handleSwitchSession} isLoading={isLoadingUi} />

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
