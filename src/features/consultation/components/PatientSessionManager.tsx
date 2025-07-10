'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

import { useRBAC } from '@/shared/hooks/useRBAC';
import { useConsultation } from '@/shared/ConsultationContext';

import { CurrentSessionBar } from './CurrentSessionBar';
import { SessionModal } from './SessionModal';

export const PatientSessionManager: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { hasFeatureAccess } = useRBAC();
  const {
    currentPatientSessionId,
    loadPatientSessions = async () => {},
    switchToPatientSession,
  } = useConsultation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if user has session management access
  const canManageSessions = hasFeatureAccess('sessionManagement');

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

  // Load patient sessions on client mount - only for users with session management access
  useEffect(() => {
    if (isClient && isLoaded && isSignedIn && canManageSessions && loadPatientSessions) {
      loadPatientSessions().then(() => {
        setHasInitialized(true);
      }).catch(() => {
        // Silently handle errors and still mark as initialized
        setHasInitialized(true);
      });
    } else if (isClient && isLoaded) {
      // Mark as initialized for public users or basic tier users without session management
      setHasInitialized(true);
    }
  }, [isClient, isLoaded, isSignedIn, canManageSessions, loadPatientSessions]);

  // Auto-open modal when no session is selected and component has initialized (only for users with session management)
  useEffect(() => {
    if (hasInitialized && isSignedIn && canManageSessions && !currentPatientSessionId) {
      setIsModalOpen(true);
    }
  }, [hasInitialized, isSignedIn, canManageSessions, currentPatientSessionId]);

  const handleSwitchSession = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Show current session bar only for users with session management access */}
      {canManageSessions && (
      <CurrentSessionBar onSwitchSession={handleSwitchSession} />
      )}

      {/* Session management modal - only show for users with session management access */}
      {isClient && isSignedIn && canManageSessions && (
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
