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
      // Use token directly from API response (fallback to URL extraction for backward compatibility)
      const token: string | null = data.token || (() => {
        const tokenMatch = data.mobileUploadUrl.match(/[?&]t=([^&]+)/);
        return tokenMatch && tokenMatch[1] ? tokenMatch[1] : null;
      })();

      console.log('[QR Session] Mobile session initiated, token:', token);
      console.log('[QR Session] Mobile URL:', data.mobileUploadUrl);

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

  // Log token changes
  useEffect(() => {
    if (sessionState.token) {
      console.log('[QR Session] Token available:', sessionState.token);
    } else {
      console.log('[QR Session] No token available');
    }
  }, [sessionState.token]);

  // Return session state directly - don't memoize to ensure React detects token changes
  // The object reference changes when sessionState changes, which React will detect
  return {
    ...sessionState,
    isGenerating: mutation.isPending,
    error: mutation.error,
    generateSession: mutation.mutate,
    regenerateSession: regenerate,
    getRemainingTime,
  };
}
