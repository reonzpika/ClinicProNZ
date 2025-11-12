/**
 * Hook to manage QR code session for mobile handoff
 */

import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { medtechAPI } from '../services/mock-medtech-api';
import { useImageWidgetStore } from '../stores/imageWidgetStore';

type QRSessionState = {
  token: string | null;
  mobileUrl: string | null;
  qrSvg: string | null;
  expiresAt: number | null; // Timestamp
  isExpired: boolean;
};

export function useQRSession() {
  const encounterContext = useImageWidgetStore(state => state.encounterContext);
  const [sessionState, setSessionState] = useState<QRSessionState>({
    token: null,
    mobileUrl: null,
    qrSvg: null,
    expiresAt: null,
    isExpired: false,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!encounterContext) {
        throw new Error('No encounter context available');
      }

      return medtechAPI.initiateMobile(
        encounterContext.encounterId,
        encounterContext.patientId,
        encounterContext.facilityId,
      );
    },
    onSuccess: (data) => {
      const expiresAt = Date.now() + data.ttlSeconds * 1000;
      // Extract token from mobile URL
      const tokenMatch = data.mobileUploadUrl.match(/[?&]t=([^&]+)/);
      const token = tokenMatch ? tokenMatch[1] : null;

      setSessionState({
        token,
        mobileUrl: data.mobileUploadUrl,
        qrSvg: data.qrSvg,
        expiresAt,
        isExpired: false,
      });
    },
  });

  // Check expiration
  useEffect(() => {
    if (!sessionState.expiresAt) {
      return;
    }

    const checkExpiration = () => {
      if (Date.now() >= sessionState.expiresAt!) {
        setSessionState(prev => ({ ...prev, isExpired: true }));
      }
    };

    // Check immediately
    checkExpiration();

    // Check every second
    const interval = setInterval(checkExpiration, 1000);

    return () => clearInterval(interval);
  }, [sessionState.expiresAt]);

  // Calculate remaining time
  const getRemainingTime = useCallback(() => {
    if (!sessionState.expiresAt || sessionState.isExpired) {
      return 0;
    }

    return Math.max(0, Math.floor((sessionState.expiresAt - Date.now()) / 1000));
  }, [sessionState.expiresAt, sessionState.isExpired]);

  // Regenerate session
  const regenerate = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  return {
    ...sessionState,
    isGenerating: mutation.isPending,
    error: mutation.error,
    generateSession: mutation.mutate,
    regenerateSession: regenerate,
    getRemainingTime,
  };
}
