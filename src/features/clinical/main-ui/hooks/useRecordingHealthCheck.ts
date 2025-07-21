import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  healthCheckInterval?: number; // ms, default 30000 (30s during recording)
  syncTimeout?: number; // ms, default 10000
  autoStart?: boolean; // default false - don't auto-start health checks
  triggerOnMobileConnect?: boolean; // default true - check when mobile connects
  triggerOnPatientChange?: boolean; // default true - check when patient session changes
  autoRetryCount?: number; // default 3 - auto retry failed health checks
};

export const useRecordingHealthCheck = (options: UseRecordingHealthCheckOptions = {}) => {
  const {
    enabled = true,
    healthCheckInterval = 30000, // Increased to 30s to reduce cost
    syncTimeout = 10000,
    autoStart = false, // Don't auto-start by default
    triggerOnMobileConnect = true,
    triggerOnPatientChange = true, // Auto-trigger on patient session changes
    autoRetryCount = 3, // Auto-retry failed health checks
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

  // Auto-retry state
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // API connectivity cache to reduce costs
  const [apiConnectivityCache, setApiConnectivityCache] = useState<{
    lastChecked: number | null;
    isAvailable: boolean;
    cacheFor: number;
  }>({
    lastChecked: null,
    isAvailable: false,
    cacheFor: 5 * 60 * 1000, // 5 minute cache
  });

  // UI stabilization - minimum display times to prevent flickering
  const [stableStatus, setStableStatus] = useState<RecordingHealthStatus>('setup-required');
  const statusTransitionRef = useRef<NodeJS.Timeout | null>(null);

  const STATE_MIN_DURATION = useMemo(() => ({
    'testing': 2000, // Show "testing" for at least 2s
    'ready': 1000, // Show "ready" for at least 1s
    'error': 3000, // Show errors longer for user to read
    'setup-required': 500,
    'recording': 0, // No delay for recording status
  }), []);

  // Update stable status with minimum display duration
  const updateStableStatus = useCallback((newStatus: RecordingHealthStatus) => {
    const currentTime = Date.now();
    const minDuration = STATE_MIN_DURATION[stableStatus];

    if (statusTransitionRef.current) {
      clearTimeout(statusTransitionRef.current);
    }

    if (newStatus === stableStatus) {
      return; // No change needed
    }

    // If we haven't shown current status long enough, delay the transition
    if (healthState.lastHealthCheck && currentTime - healthState.lastHealthCheck < minDuration) {
      statusTransitionRef.current = setTimeout(() => {
        setStableStatus(newStatus);
      }, minDuration - (currentTime - healthState.lastHealthCheck));
    } else {
      setStableStatus(newStatus);
    }
  }, [stableStatus, healthState.lastHealthCheck, STATE_MIN_DURATION]);

  // Update stable status when health state changes
  useEffect(() => {
    updateStableStatus(healthState.status);
  }, [healthState.status, updateStableStatus]);

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

    // Simple check: mobile connected and devices present
    const mobileDevices = mobileV2.connectedDevices.filter(d => d.deviceType === 'Mobile');
    const isConnected = mobileV2.connectionStatus === 'connected' && mobileDevices.length > 0;

    if (!isConnected) {
      issues.push({
        type: 'mobile-disconnected',
        message: 'Mobile device not connected',
        actionable: true,
        action: 'Connect mobile device using QR code',
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

  // Test transcription API connectivity with caching
  const testTranscriptionAPI = useCallback(async (): Promise<HealthCheckIssue[]> => {
    const issues: HealthCheckIssue[] = [];
    const currentTime = Date.now();

    // Check if we have a valid cached result
    if (apiConnectivityCache.lastChecked
      && currentTime - apiConnectivityCache.lastChecked < apiConnectivityCache.cacheFor) {
      if (!apiConnectivityCache.isAvailable) {
        issues.push({
          type: 'transcription-api',
          message: 'Transcription service unavailable (cached)',
          actionable: false,
        });
      }
      return issues;
    }

    try {
      // Simple connectivity test to transcription endpoint
      const response = await fetch('/api/deepgram/transcribe', {
        method: 'OPTIONS', // Preflight request to check connectivity
      });

      const isAvailable = response.ok || response.status === 405; // 405 is OK for OPTIONS

      // Update cache
      setApiConnectivityCache({
        lastChecked: currentTime,
        isAvailable,
        cacheFor: apiConnectivityCache.cacheFor,
      });

      if (!isAvailable) {
        issues.push({
          type: 'transcription-api',
          message: 'Transcription service unavailable',
          actionable: false,
        });
      }
    } catch {
      // Update cache with failure
      setApiConnectivityCache({
        lastChecked: currentTime,
        isAvailable: false,
        cacheFor: apiConnectivityCache.cacheFor,
      });

      issues.push({
        type: 'transcription-api',
        message: 'Cannot reach transcription service',
        actionable: false,
      });
    }

    return issues;
  }, [apiConnectivityCache]);

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

      // Run essential checks only
      const [
        mobileIssues,
        micIssues,
      ] = await Promise.all([
        Promise.resolve(checkMobileConnection()),
        testMicrophoneAccess(),
      ]);

      allIssues.push(...mobileIssues, ...micIssues);

      // Check if patient session exists
      if (!currentPatientSessionId) {
        allIssues.push({
          type: 'mobile-disconnected',
          message: 'No patient session selected',
          actionable: true,
          action: 'Create or select a patient session',
        });
      }

      // Determine overall health status - simplified logic
      const hasBlockingIssues = allIssues.some(issue =>
        issue.type === 'mobile-disconnected' || issue.type === 'mic-permission',
      );

      const newStatus: RecordingHealthStatus = consultationStatus === 'recording'
        ? 'recording'
        : hasBlockingIssues
          ? 'setup-required'
          : 'ready'; // Simplified: just ready if no blocking issues

      setHealthState(prev => ({
        ...prev,
        status: newStatus,
        issues: allIssues,
        isHealthy: !hasBlockingIssues,
        lastHealthCheck: Date.now(),
      }));

      return !hasBlockingIssues;
    } catch {
      // Health check system errors are handled by setting error state
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
    currentPatientSessionId,
  ]);

  // Simple auto-retry wrapper function
  const runHealthCheckWithRetry = useCallback(async (): Promise<boolean> => {
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const success = await runHealthCheck();

    if (!success && retryCount < 2) { // Just 2 retries max
      // Simple retry after short delay
      setRetryCount(prev => prev + 1);

      retryTimeoutRef.current = setTimeout(async () => {
        retryTimeoutRef.current = null; // Clear ref after timeout executes
        await runHealthCheck(); // Direct retry, no complex recursion
      }, 1000); // 1 second delay

      return false;
    }

    // Reset retry count
    if (success || retryCount >= 2) {
      setRetryCount(0);
    }

    return success;
  }, [runHealthCheck, retryCount]);

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

  // Start periodic health checks when enabled (but don't auto-start unless specified)
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Only run initial health check if autoStart is enabled
    if (autoStart) {
      runHealthCheck();
    }

    // Set up periodic checks during recording only
    if (consultationStatus === 'recording') {
      healthCheckIntervalRef.current = setInterval(() => {
        // During recording, run lighter checks (local only, no API calls)
        const syncIssues = checkSyncStatus();
        if (syncIssues.length > 0) {
          setHealthState(prev => ({
            ...prev,
            issues: syncIssues,
            isHealthy: false,
          }));
        }
      }, healthCheckInterval);
    }

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };
  }, [enabled, autoStart, runHealthCheck, checkSyncStatus, consultationStatus, healthCheckInterval]);

  // Trigger health check when mobile connects (if enabled)
  useEffect(() => {
    if (enabled && triggerOnMobileConnect && mobileV2.connectionStatus === 'connected') {
      runHealthCheckWithRetry();
    }
  }, [enabled, triggerOnMobileConnect, mobileV2.connectionStatus, runHealthCheckWithRetry]);

  // Trigger health check when patient session changes (if enabled)
  useEffect(() => {
    if (enabled && triggerOnPatientChange && currentPatientSessionId && mobileV2.connectionStatus === 'connected' && !isRunningHealthCheck) {
      // Delay slightly to ensure patient session is fully set up
      const timer = setTimeout(() => {
        runHealthCheckWithRetry();
      }, 500);

      return () => clearTimeout(timer);
    }

    // Return empty cleanup function if condition not met
    return () => {};
  }, [enabled, triggerOnPatientChange, currentPatientSessionId, mobileV2.connectionStatus, isRunningHealthCheck, runHealthCheckWithRetry]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (statusTransitionRef.current) {
        clearTimeout(statusTransitionRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Manual trigger for user-initiated health checks with auto-retry
  const triggerHealthCheck = useCallback(async () => {
    return await runHealthCheckWithRetry();
  }, [runHealthCheckWithRetry]);

  return {
    healthState,
    isRunningHealthCheck,
    runHealthCheck,
    triggerHealthCheck, // Manual trigger for "Connect Mobile" button
    // Convenience getters - use stable status to prevent UI flickering
    get status() {
      return stableStatus; // Return stable status instead of raw status
    },
    get rawStatus() {
      return healthState.status; // Provide access to immediate status if needed
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
      return stableStatus === 'ready' && healthState.isHealthy && !!currentPatientSessionId;
    },
    get apiCacheStatus() {
      return apiConnectivityCache; // For debugging/monitoring
    },
    get retryCount() {
      return retryCount; // Current retry attempt count
    },
    get maxRetries() {
      return autoRetryCount; // Maximum retry attempts
    },
  };
};
