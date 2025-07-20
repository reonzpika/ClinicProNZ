import { useCallback, useEffect, useRef, useState } from 'react';

import { useConsultation } from '@/src/shared/ConsultationContext';

// Recording health status types
export type RecordingHealthStatus =
  | 'setup-required' // Missing requirements (no mobile, no permissions, etc.)
  | 'testing' // Running validation checks
  | 'ready' // All systems validated and ready
  | 'recording' // Currently recording with live monitoring
  | 'error'; // Health check failed

export type HealthCheckIssue = {
  type: 'mobile-disconnected' | 'mic-permission' | 'audio-capture' | 'sync-failure' | 'transcription-api';
  message: string;
  actionable: boolean;
  action?: string;
};

export type RecordingHealthState = {
  status: RecordingHealthStatus;
  issues: HealthCheckIssue[];
  lastSync: number | null;
  transcriptionRate: number; // words per minute
  isHealthy: boolean;
  lastHealthCheck: number | null;
};

export type UseRecordingHealthCheckOptions = {
  enabled?: boolean;
  healthCheckInterval?: number; // ms, default 5000
  syncTimeout?: number; // ms, default 10000
};

export const useRecordingHealthCheck = (options: UseRecordingHealthCheckOptions = {}) => {
  const {
    enabled = true,
    healthCheckInterval = 5000,
    syncTimeout = 10000,
  } = options;

  const {
    mobileV2,
    transcription,
    status: consultationStatus,
    currentPatientSessionId,
  } = useConsultation();

  const [healthState, setHealthState] = useState<RecordingHealthState>({
    status: 'setup-required',
    issues: [],
    lastSync: null,
    transcriptionRate: 0,
    isHealthy: false,
    lastHealthCheck: null,
  });

  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptionStartRef = useRef<number | null>(null);
  const wordCountRef = useRef<number>(0);

  // Track transcription rate during recording
  useEffect(() => {
    if (consultationStatus === 'recording') {
      if (!transcriptionStartRef.current) {
        transcriptionStartRef.current = Date.now();
        wordCountRef.current = 0;
      }

      // Count words in current transcript
      const words = transcription.transcript?.split(/\s+/).filter(word => word.length > 0).length || 0;
      wordCountRef.current = words;

      // Calculate rate (words per minute)
      const duration = (Date.now() - transcriptionStartRef.current) / (1000 * 60);
      const rate = duration > 0 ? Math.round(words / duration) : 0;

      setHealthState(prev => ({
        ...prev,
        transcriptionRate: rate,
      }));
    } else {
      transcriptionStartRef.current = null;
      wordCountRef.current = 0;
      setHealthState(prev => ({
        ...prev,
        transcriptionRate: 0,
      }));
    }
  }, [transcription.transcript, consultationStatus]);

  // Check mobile device connection
  const checkMobileConnection = useCallback((): HealthCheckIssue[] => {
    const issues: HealthCheckIssue[] = [];

    // Check if mobile is connected
    if (!mobileV2.token || mobileV2.connectionStatus !== 'connected') {
      issues.push({
        type: 'mobile-disconnected',
        message: 'Mobile device not connected',
        actionable: true,
        action: 'Connect mobile device using QR code',
      });
    }

    // Check if mobile devices are present
    const mobileDevices = mobileV2.connectedDevices.filter(d => d.deviceType === 'Mobile');
    if (mobileDevices.length === 0) {
      issues.push({
        type: 'mobile-disconnected',
        message: 'No mobile devices connected',
        actionable: true,
        action: 'Scan QR code with mobile device',
      });
    }

    return issues;
  }, [mobileV2]);

  // Check sync status (last communication with mobile)
  const checkSyncStatus = useCallback((): HealthCheckIssue[] => {
    const issues: HealthCheckIssue[] = [];

    if (healthState.lastSync) {
      const timeSinceLastSync = Date.now() - healthState.lastSync;
      if (timeSinceLastSync > syncTimeout) {
        issues.push({
          type: 'sync-failure',
          message: `No sync for ${Math.round(timeSinceLastSync / 1000)}s`,
          actionable: true,
          action: 'Check mobile device connection',
        });
      }
    }

    return issues;
  }, [healthState.lastSync, syncTimeout]);

  // Test microphone access and audio capture
  const testMicrophoneAccess = useCallback(async (): Promise<HealthCheckIssue[]> => {
    const issues: HealthCheckIssue[] = [];

    try {
      // Check if MediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        issues.push({
          type: 'mic-permission',
          message: 'Browser does not support microphone access',
          actionable: false,
        });
        return issues;
      }

      // Test if we can access microphone devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');

      if (audioInputs.length === 0) {
        issues.push({
          type: 'mic-permission',
          message: 'No microphone devices found',
          actionable: false,
        });
      }
    } catch {
      issues.push({
        type: 'mic-permission',
        message: 'Microphone access denied',
        actionable: true,
        action: 'Grant microphone permissions',
      });
    }

    return issues;
  }, []);

  // Test transcription API connectivity
  const testTranscriptionAPI = useCallback(async (): Promise<HealthCheckIssue[]> => {
    const issues: HealthCheckIssue[] = [];

    try {
      // Simple connectivity test to transcription endpoint
      const response = await fetch('/api/deepgram/transcribe', {
        method: 'OPTIONS', // Preflight request to check connectivity
      });

      if (!response.ok && response.status !== 405) { // 405 is OK for OPTIONS
        issues.push({
          type: 'transcription-api',
          message: 'Transcription service unavailable',
          actionable: false,
        });
      }
    } catch {
      issues.push({
        type: 'transcription-api',
        message: 'Cannot reach transcription service',
        actionable: false,
      });
    }

    return issues;
  }, []);

  // Run comprehensive health check
  const runHealthCheck = useCallback(async (): Promise<boolean> => {
    if (isRunningHealthCheck) {
      return false;
    }

    setIsRunningHealthCheck(true);
    setHealthState(prev => ({
      ...prev,
      status: 'testing',
      issues: [],
    }));

    try {
      const allIssues: HealthCheckIssue[] = [];

      // Run all checks in parallel
      const [
        mobileIssues,
        syncIssues,
        micIssues,
        apiIssues,
      ] = await Promise.all([
        Promise.resolve(checkMobileConnection()),
        Promise.resolve(checkSyncStatus()),
        testMicrophoneAccess(),
        testTranscriptionAPI(),
      ]);

      allIssues.push(...mobileIssues, ...syncIssues, ...micIssues, ...apiIssues);

      // Determine overall health status
      const hasBlockingIssues = allIssues.some(issue =>
        issue.type === 'mobile-disconnected'
        || issue.type === 'mic-permission'
        || issue.type === 'transcription-api',
      );

      const newStatus: RecordingHealthStatus = consultationStatus === 'recording'
        ? 'recording'
        : hasBlockingIssues
          ? 'setup-required'
          : allIssues.length > 0
            ? 'error'
            : 'ready';

      setHealthState(prev => ({
        ...prev,
        status: newStatus,
        issues: allIssues,
        isHealthy: !hasBlockingIssues,
        lastHealthCheck: Date.now(),
      }));

      return !hasBlockingIssues;
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthState(prev => ({
        ...prev,
        status: 'error',
        issues: [{
          type: 'transcription-api',
          message: 'Health check system error',
          actionable: false,
        }],
        isHealthy: false,
        lastHealthCheck: Date.now(),
      }));
      return false;
    } finally {
      setIsRunningHealthCheck(false);
    }
  }, [
    isRunningHealthCheck,
    checkMobileConnection,
    checkSyncStatus,
    testMicrophoneAccess,
    testTranscriptionAPI,
    consultationStatus,
  ]);

  // Update sync timestamp when transcription is received
  useEffect(() => {
    if (transcription.transcript && transcription.isLive) {
      setHealthState(prev => ({
        ...prev,
        lastSync: Date.now(),
      }));
    }
  }, [transcription.transcript, transcription.isLive]);

  // Update status when consultation status changes
  useEffect(() => {
    setHealthState(prev => ({
      ...prev,
      status: consultationStatus === 'recording' ? 'recording' : prev.status,
    }));
  }, [consultationStatus]);

  // Start periodic health checks when enabled
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Run initial health check
    runHealthCheck();

    // Set up periodic checks
    healthCheckIntervalRef.current = setInterval(() => {
      if (consultationStatus === 'recording') {
        // During recording, run lighter checks
        const syncIssues = checkSyncStatus();
        if (syncIssues.length > 0) {
          setHealthState(prev => ({
            ...prev,
            issues: syncIssues,
            isHealthy: false,
          }));
        }
      } else {
        // When not recording, run full health check
        runHealthCheck();
      }
    }, healthCheckInterval);

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [enabled, runHealthCheck, checkSyncStatus, consultationStatus, healthCheckInterval]);

  // Force health check when mobile connection status changes
  useEffect(() => {
    if (enabled) {
      runHealthCheck();
    }
  }, [mobileV2.connectionStatus, mobileV2.connectedDevices.length, enabled, runHealthCheck]);

  return {
    healthState,
    isRunningHealthCheck,
    runHealthCheck,
    // Convenience getters
    get status() {
      return healthState.status;
    },
    get isHealthy() {
      return healthState.isHealthy;
    },
    get issues() {
      return healthState.issues;
    },
    get lastSync() {
      return healthState.lastSync;
    },
    get transcriptionRate() {
      return healthState.transcriptionRate;
    },
    get canStartRecording() {
      return healthState.status === 'ready' && healthState.isHealthy && !!currentPatientSessionId;
    },
  };
};
