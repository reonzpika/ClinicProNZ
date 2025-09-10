'use client';

import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { Crown, Stethoscope } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AdditionalNotes } from '@/src/features/clinical/main-ui/components/AdditionalNotes';
import { DefaultSettings } from '@/src/features/clinical/main-ui/components/DefaultSettings';
import { DocumentationSettingsBadge } from '@/src/features/clinical/main-ui/components/DocumentationSettingsBadge';
import { GeneratedNotes } from '@/src/features/clinical/main-ui/components/GeneratedNotes';
import { TranscriptionControls } from '@/src/features/clinical/main-ui/components/TranscriptionControls';
// Removed TranscriptProcessingStatus import - no longer needed in single-pass architecture
import { TypedInput } from '@/src/features/clinical/main-ui/components/TypedInput';
import { useTranscription } from '@/src/features/clinical/main-ui/hooks/useTranscription';
import { MobileRightPanelOverlay } from '@/src/features/clinical/mobile/components/MobileRightPanelOverlay';
import { useSimpleAbly } from '@/src/features/clinical/mobile/hooks/useSimpleAbly';
import RightPanelFeatures from '@/src/features/clinical/right-sidebar/components/RightPanelFeatures';
import { WorkflowInstructions } from '@/src/features/clinical/right-sidebar/components/WorkflowInstructions';
import { PatientSessionManager } from '@/src/features/clinical/session-management/components/PatientSessionManager';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { RecordingAwareSessionContext } from '@/src/hooks/useRecordingAwareSession';
import { ContactLink } from '@/src/shared/components/ContactLink';
import { FeatureFeedbackButton } from '@/src/shared/components/FeatureFeedbackButton';
import { Container } from '@/src/shared/components/layout/Container';
import { Stack } from '@/src/shared/components/layout/Stack';
import { MobileBlockModal } from '@/src/shared/components/MobileBlockModal';
import { RateLimitModal } from '@/src/shared/components/RateLimitModal';
import { Button } from '@/src/shared/components/ui/button';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { useResponsive } from '@/src/shared/hooks/useResponsive';
import { createAuthHeaders } from '@/src/shared/utils';
import { useUserSettingsStore } from '@/src/stores/userSettingsStore';

export default function ConsultationPage() {
  const queryClient = useQueryClient();
  const {
    setError,
    setStatus,
    currentPatientSessionId,
    inputMode,
    typedInput,
    transcription,
    setTranscription,
    setTypedInput,
    generatedNotes,
    setGeneratedNotes,
    consultationNotes,
    setConsultationNotes,
    consultationItems,
    getCompiledConsultationText,
    templateId,
    setLastGeneratedInput,
    setTemplateId,
    setInputMode,

    saveNotesToCurrentSession, // For saving generated notes
    saveTypedInputToCurrentSession: _saveTypedInputToCurrentSession, // For clearing typed input (unused)
    saveConsultationNotesToCurrentSession: _saveConsultationNotesToCurrentSession, // For clearing consultation notes (unused)
    ensureActiveSession, // For ensuring session exists before note generation
    resetLastGeneratedInput, // For resetting generation tracking
    switchToPatientSession: originalSwitchToPatientSession, // Rename to create wrapper
  } = useConsultationStores();
  const { isSignedIn: _isSignedIn, userId } = useAuth();
  const { getUserTier, user } = useClerkMetadata();
  const userTier = getUserTier();
  const [loading, setLoading] = useState(false);
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [isDocumentationMode, setIsDocumentationMode] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true);
  const [rateLimitModalOpen, setRateLimitModalOpen] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<{ limit: number; resetIn: number; message: string } | null>(null);
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();
  // Guard to prevent doc-mode auto-toggle during clear-all flow
  const isClearingRef = useRef(false);
  // Abort controller for in-flight note generation requests
  const genAbortRef = useRef<AbortController | null>(null);
  // Apply user defaults only once on initial settings load
  const hasAppliedDefaultsRef = useRef(false);

  // Mobile block modal - prevent mobile access to consultation
  const showMobileBlock = isMobile;

  // Removed admin preview mode state - no longer needed in single-pass architecture

  // Check for upgrade redirect
  const [showUpgradeNotification, setShowUpgradeNotification] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Mobile recording status
  const [mobileIsRecording, setMobileIsRecording] = useState(false);
  const lastMobileStatusAtRef = useRef<number>(0);
  const [defaultRecordingMethod, setDefaultRecordingMethod] = useState<'desktop' | 'mobile'>('desktop');

  // Desktop recording controls
  const { stopRecording, isRecording } = useTranscription();

  // Load user settings and apply defaults
  const { settings, loadSettings } = useUserSettingsStore();
  useEffect(() => {
    if (!userId) {
      return;
    }
    loadSettings(userId, userTier);
  }, [loadSettings, userId, userTier]);

  // Apply default input mode and template only once after settings load
  useEffect(() => {
    if (!settings || hasAppliedDefaultsRef.current) {
      return;
    }
    // Apply input mode default once
    if (settings.defaultInputMode === 'typed') {
      setInputMode('typed');
    } else {
      setInputMode('audio');
    }

    // Apply template default once
    const fav = settings.favouriteTemplateId || '20dc1526-62cc-4ff4-a370-ffc1ded52aef';
    setTemplateId(fav);

    hasAppliedDefaultsRef.current = true;
  }, [settings, setInputMode, setTemplateId]);

  // Always reflect default recording method changes from settings
  useEffect(() => {
    if (!settings) {
      return;
    }
    setDefaultRecordingMethod((settings.defaultRecordingMethod as any) || 'desktop');
  }, [settings]);

  // Handle Ably errors (moved before useSimpleAbly)
  const handleError = useCallback((error: string) => {
    // Suppress Ably/auth noise and clear mobile state on auth failures
    const isAblyNoise = /Failed to publish|Connection closed|Ably/i.test(error);
    if (isAblyNoise) {
      console.warn('[Ably]', error);
      return;
    }
    setError(error);
  }, [setError]);

  // Simple Ably sync implementation - always connected when token exists (moved before switchToPatientSession)
  const queryClientRef = useRef(queryClient);
  const currentSessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    currentSessionIdRef.current = currentPatientSessionId || null;
  }, [currentPatientSessionId]);

  // Incremental append + debounce helpers
  const lastAppliedChunkIdRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { sendRecordingControl } = useSimpleAbly({
    userId: userId ?? null,
    onRecordingStatusChanged: (isRecording: boolean) => {
      setMobileIsRecording(isRecording);
      lastMobileStatusAtRef.current = Date.now();
    },
    onError: handleError,
    // 🆕 SESSION CONTEXT REMOVED: Server-side session resolution eliminates need for session broadcasting
    // 🆕 CONNECTION HANDLER REMOVED: No session broadcasting needed with server-side resolution
    isMobile: false,
    onTranscriptionsUpdated: async (signalledSessionId?: string) => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(async () => {
        const activeSessionId = signalledSessionId || currentPatientSessionId;
        if (!activeSessionId) {
          return;
        }

        let session: any = null;
        try {
          session = await queryClientRef.current.fetchQuery({
            queryKey: ['consultation', 'session', activeSessionId],
            queryFn: async () => {
              const response = await fetch(`/api/patient-sessions?sessionId=${encodeURIComponent(activeSessionId)}`, {
                method: 'GET',
                headers: createAuthHeaders(userId, userTier),
              });
              if (!response.ok) {
                throw new Error('Failed to fetch session');
              }
              const data = await response.json();
              const sessions = data.sessions || [];
              return sessions[0] || null;
            },
            staleTime: 0,
          });
        } catch {
          session = queryClientRef.current.getQueryData(['consultation', 'session', activeSessionId]);
        }
        if (session) {
          let chunks: any[] = [];
          try {
            chunks = typeof session.transcriptions === 'string' ? JSON.parse(session.transcriptions) : (session.transcriptions || []);
          } catch {
            chunks = [];
          }
          if (Array.isArray(chunks) && chunks.length > 0) {
            let startIndex = 0;
            if (lastAppliedChunkIdRef.current) {
              const idx = chunks.findIndex((c: any) => c.id === lastAppliedChunkIdRef.current);
              startIndex = idx >= 0 ? idx + 1 : 0;
            }
            const newChunks = chunks.slice(startIndex).filter((c: any) => (c?.text || '').trim().length > 0);
            if (newChunks.length > 0) {
              const delta = newChunks.map((t: any) => (t?.text || '').trim()).join(' ').trim();
              const prev = typeof transcription?.transcript === 'string' ? transcription.transcript : '';
              const next = prev ? `${prev} ${delta}`.trim() : delta;
              setTranscription(next, false, undefined, undefined);
              lastAppliedChunkIdRef.current = chunks[chunks.length - 1]?.id || lastAppliedChunkIdRef.current;
            } else {
              lastAppliedChunkIdRef.current = chunks[chunks.length - 1]?.id || lastAppliedChunkIdRef.current;
            }
          }
        }
      }, 900);
    },
  });

  // Auto-clear stale mobile recording state if no heartbeat/status received recently
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        if (mobileIsRecording) {
          const last = lastMobileStatusAtRef.current || 0;
          if (Date.now() - last > 15000) {
            setMobileIsRecording(false);
          }
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [mobileIsRecording]);

  // Ensure global hook proxy exists as early as possible to aid diagnostics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (typeof (window as any).ablySyncHook !== 'object') {
        (window as any).ablySyncHook = {
          sendRecordingControl: () => false,
        };
      }
    }
  }, []);

  // 🛡️ GP WORKFLOW: Wrapper to stop recording before session switching
  const switchToPatientSession = useCallback(async (sessionId: string, onSwitch?: (sessionId: string, patientName: string) => void) => {
    // Stop recording before switching sessions
    if (isRecording || mobileIsRecording) {
      try {
        // Stop desktop recording
        if (isRecording) {
          stopRecording();
        }

        // Stop mobile recording
        if (mobileIsRecording && sendRecordingControl) {
          sendRecordingControl('stop');
        }

        // Brief delay to ensure recording stops and final chunks are saved
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn('Error stopping recording before session switch:', error);
      }
    }

    // Now perform the actual session switch
    originalSwitchToPatientSession(sessionId, onSwitch);
    // 🆕 SESSION BROADCASTING REMOVED: Server-side session resolution eliminates need for mobile session sync
  }, [isRecording, mobileIsRecording, stopRecording, sendRecordingControl, originalSwitchToPatientSession]);

  useEffect(() => {
    // Check URL parameters for upgrade redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showUpgrade') === 'true') {
      setShowUpgradeNotification(true);
      // Remove the parameter from URL without reload
      urlParams.delete('showUpgrade');
      const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
      window.history.replaceState(null, '', newUrl);
    }
  }, []);

  // Ensure there is always an active patient session; retry on relevant changes
  const hasEnsuredSessionRef = useRef(false);
  const isEnsuringSessionRef = useRef(false);
  useEffect(() => {
    if (hasEnsuredSessionRef.current || isEnsuringSessionRef.current) {
      return;
    }

    let isMounted = true;
    isEnsuringSessionRef.current = true;

    (async () => {
      try {
        const sessionId = await ensureActiveSession();
        if (isMounted && sessionId) {
          hasEnsuredSessionRef.current = true;
          // 🆕 SESSION BROADCASTING REMOVED: Server-side session resolution eliminates need for mobile session sync
        }
      } finally {
        if (isMounted) {
          isEnsuringSessionRef.current = false;
        } else {
          isEnsuringSessionRef.current = false;
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [ensureActiveSession, userId]);

  // Direct upgrade handler
  const handleDirectUpgrade = async () => {
    setUpgradeLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to create checkout session');
        setUpgradeLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setUpgradeLoading(false);
    }
  };

  // Admin preview approval handler
  // Removed admin approval handler - no longer needed in single-pass architecture

  // Session limits are now handled contextually when users try to perform actions
  // The UsageDashboard will show the current status and the modal will appear on 429 errors

  // Auto-enable/disable documentation mode based on generated notes or loading state
  useEffect(() => {
    // Suppress doc-mode while clearing to ensure we return to default view immediately
    if (isClearingRef.current) {
      if (isDocumentationMode) {
        setIsDocumentationMode(false);
      }
      return;
    }

    if ((generatedNotes && generatedNotes.trim()) || loading) {
      if (!isDocumentationMode) {
        setIsDocumentationMode(true);
      }
    } else if ((!generatedNotes || !generatedNotes.trim()) && !loading && isDocumentationMode) {
      setIsDocumentationMode(false);
    }
  }, [generatedNotes, loading, isDocumentationMode]);

  // Ensure inputs are expanded by default when switching/creating a new session
  // Fix: after generating notes then creating a new session, inputs were shown collapsed
  // because isNoteFocused remained true from the previous session
  useEffect(() => {
    setIsNoteFocused(false);
  }, [currentPatientSessionId]);

  // 🛡️ PHASE 1 FIX: Reset mobile recording status when connection drops
  useEffect(() => {
    if (mobileIsRecording) {
      // no-op: will be updated via signals
    }
  }, [mobileIsRecording]);

  // Expose sendRecordingControl to global for remote control
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).ablySyncHook = {
        sendRecordingControl: (action: 'start' | 'stop') => (sendRecordingControl ? sendRecordingControl(action) : false),
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).ablySyncHook;
      }
    };
  }, [sendRecordingControl]);

  // Removed session sync logic - no longer needed in simplified architecture

  // Removed mobile token bootstrap; Ably connects via user token

  // On mount, sync current session from server (server truth); create one if missing
  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        if (!userId) {
          return;
        }
        const res = await fetch('/api/current-session', { method: 'GET', headers: createAuthHeaders(userId, userTier) });
        if (res.ok) {
          const data = await res.json();
          const serverId = data?.currentSessionId as string | null;
          if (serverId) {
            if (serverId !== currentPatientSessionId) {
              originalSwitchToPatientSession(serverId);
            }
          } else {
            // No server-side current session → ensure one exists
            try {
              await ensureActiveSession();
            } catch {}
          }
        }
      } catch {}
    };
    fetchCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userTier]);

  // REMOVED: Redundant session broadcasting - now handled by ConsultationContext only
  // This eliminates dual broadcasting sources and race conditions

  const handleClearAll = async () => {
    isClearingRef.current = true;
    // Abort any in-flight note generation to prevent stream from repopulating notes
    if (genAbortRef.current) {
      try {
 genAbortRef.current.abort();
} catch { /* ignore */ }
      genAbortRef.current = null;
    }
    // Clear UI state immediately
    setLoading(false);
    setIsNoteFocused(false);
    setIsDocumentationMode(false);
    setGeneratedNotes('');
    setStatus('idle');
    setError(null);

    // Clear local store state
    setConsultationNotes('');
    setTypedInput('');
    setTranscription('', false);
    resetLastGeneratedInput();

    // Clear server-side session data atomically
    try {
      if (currentPatientSessionId) {
        // Set a brief global suppression window to prevent hydration re-population
        try {
 (window as any).__clinicproJustClearedUntil = Date.now() + 800;
} catch {}
        await fetch('/api/patient-sessions/clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...createAuthHeaders(userId, userTier) },
          body: JSON.stringify({ sessionId: currentPatientSessionId }),
        });
      }

      // Optimistically update React Query caches for current session
      if (currentPatientSessionId) {
        // Update sessions list cache
        queryClient.setQueryData<any>(
          ['consultation', 'sessions'],
          (old: any) => {
            if (!Array.isArray(old)) {
              return old;
            }
            return old.map((s: any) => (s.id === currentPatientSessionId
              ? { ...s, notes: '', typedInput: '', consultationNotes: '', transcriptions: [] }
              : s));
          },
        );
        // Update individual session cache
        queryClient.setQueryData<any>(
          ['consultation', 'session', currentPatientSessionId],
          (old: any) => {
            if (!old) {
              return old;
            }
            return { ...old, notes: '', typedInput: '', consultationNotes: '', transcriptions: [] };
          },
        );
        // Pull fresh server state to remove any stale rehydration edge cases
        try {
          await queryClient.invalidateQueries({ queryKey: ['consultation', 'session', currentPatientSessionId] });
        } catch {}
      }

      // Re-enforce local clears in case of any async rehydration
      setGeneratedNotes('');
      setTypedInput('');
      setConsultationNotes('');
      setTranscription('', false);
    } catch (error) {
      console.error('Error clearing server data:', error);
      // Continue anyway - UI is already cleared
    } finally {
      // Release guard after state has settled and a tick has elapsed to avoid flash
      requestAnimationFrame(() => {
        isClearingRef.current = false;
      });
    }
  };

  const handleGenerateNotes = async () => {
    // 🛡️ GP WORKFLOW: Stop recording before generating notes
    if (isRecording || mobileIsRecording) {
      try {
        // Stop desktop recording
        if (isRecording) {
          stopRecording();
        }

        // Stop mobile recording
        if (mobileIsRecording && sendRecordingControl) {
          sendRecordingControl('stop');
        }

        // Brief delay to ensure recording stops properly
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn('Error stopping recording before note generation:', error);
      }
    }

    setIsNoteFocused(true);
    setIsDocumentationMode(true);
    setLoading(true);
    setError(null);

    try {
      // Ensure we have an active session before generating notes
      const sessionId = await ensureActiveSession();
      if (!sessionId) {
        throw new Error('Failed to create or ensure active session');
      }

      // Single-pass: Combine raw consultation data and send directly to notes API
      const mainContent = inputMode === 'audio' ? transcription.transcript : typedInput;
      const additionalContent = getCompiledConsultationText();

      // Combine main content with additional notes as raw consultation data
      const rawConsultationData = additionalContent && additionalContent.trim()
        ? `${mainContent}\n\nADDITIONAL GP OBJECTIVE FINDINGS:\n${additionalContent}`
        : mainContent;

      // Direct single-pass note generation
      setStatus('processing');

      const requestBody = {
        rawConsultationData,
        templateId,
      };
      // Create and store abort controller for this request
      const controller = new AbortController();
      genAbortRef.current = controller;
      const res = await fetch('/api/consultation/notes', {
        method: 'POST',
        headers: createAuthHeaders(userId, userTier),
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      // Check for rate limit error
      if (res.status === 429) {
        const errorData = await res.json();
        // Map server response format to UI format
        const resetTime = errorData.resetTime ? new Date(errorData.resetTime) : new Date();
        const resetIn = Math.max(0, Math.floor((resetTime.getTime() - Date.now()) / 1000));
        setRateLimitError({
          limit: errorData.remaining || 0, // Use remaining count from server
          resetIn,
          message: errorData.message || 'Rate limit exceeded',
        });
        setRateLimitModalOpen(true);
        setStatus('idle');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        setError(errorData.error || errorData.message || 'Failed to generate notes');
        setStatus('idle');
        return;
      }

      if (!res.body) {
        setError('No response body');
        setStatus('idle');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let notes = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        notes += decoder.decode(value, { stream: true });
        setGeneratedNotes(notes);
      }

      // Track the original inputs for UI purposes
      setLastGeneratedInput(
        inputMode === 'audio' ? transcription.transcript : '',
        inputMode === 'typed' ? typedInput : '',
        getCompiledConsultationText(),
        templateId,
      );

      // Save the generated notes to the current session
      await saveNotesToCurrentSession(notes);

      // Set status to completed
      setStatus('completed');
    } catch (err) {
      // Swallow abort errors triggered by Clear All
      if ((err as any)?.name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'Failed to generate notes');
      }
      setStatus('idle');
    } finally {
      setLoading(false);
      // Clear abort ref if it belongs to this invocation
      if (genAbortRef.current) {
        genAbortRef.current = null;
      }
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ switchToPatientSession }), [switchToPatientSession]);

  return (
    <RecordingAwareSessionContext.Provider value={contextValue}>
      <div className="flex h-full flex-col">
      {/* Right Panel Sidebar (Desktop Only) */}
      {isDesktop && (
        <div className={`
          fixed right-0 top-0 z-30 h-[calc(100vh-80px)] border-l border-slate-200 bg-white transition-all duration-300 ease-in-out
          ${rightPanelCollapsed ? 'w-12' : 'w-80'}
        `}
        >
          <RightPanelFeatures
            isCollapsed={rightPanelCollapsed}
            onToggle={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          />
        </div>
      )}

      <div className={`
        flex h-screen flex-col transition-all duration-300 ease-in-out
        ${isDesktop
      ? (rightPanelCollapsed ? 'mr-12' : 'mr-80')
      : 'mr-0'
    }
      `}
      >
        <Container size="fluid" className="h-full">
          <div className={`flex h-full flex-col ${(isMobile || isTablet) ? 'py-4' : 'py-6'}`}>
            {/* Mobile Tools Button */}
            {isTablet && (
              <div className="mb-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRightPanelOpen(true)}
                  className="bg-white shadow-sm"
                >
                  <Stethoscope size={16} className="mr-2" />
                  Clinical Tools
                </Button>
              </div>
            )}

            {/* Upgrade Notification for users redirected from registration */}
            {showUpgradeNotification && (
              <div className="mb-4 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="size-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Welcome! Ready to upgrade?</h3>
                      <p className="text-sm text-gray-600">
                        Get unlimited access for just $30/month (first 15 GPs only!)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowUpgradeNotification(false)}
                    >
                      Later
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleDirectUpgrade}
                      disabled={upgradeLoading}
                    >
                      {upgradeLoading ? 'Loading...' : 'Upgrade Now'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Clinical Documentation Area */}
            <div className="h-full flex-1">
              {/* Large Desktop Dual-Column Layout */}
              {isLargeDesktop
                ? (
                    <div className="flex h-full gap-6">
                      {/* Left Column - Supporting Information (30-35%) */}
                      <div className="h-full w-1/3 space-y-4">
                        {/* Patient Session Manager - V2 Feature */}
                        <PatientSessionManager />

                        {/* Documentation Settings Badge - Always visible below session bar */}
                        <DocumentationSettingsBadge />

                        {/* Workflow Instructions - Only visible on large desktop */}
                        <WorkflowInstructions />

                        {/* Default Settings - between guide and contact */}
                        <DefaultSettings />

                        {/* Contact & Feedback - side by side 50/50 */}
                        <div className="mt-auto">
                          <div className="flex gap-2">
                            <div className="w-1/2">
                              <FeatureFeedbackButton
                                feature="general"
                                context={`Page: Consultation; Template: ${templateId || 'none'}; Input Mode: ${inputMode}`}
                                variant="text"
                                className="w-full justify-center"
                              />
                            </div>
                            <div className="w-1/2">
                              <ContactLink className="w-full justify-center" />
                            </div>
                          </div>
                        </div>

                        {/* Minimized Components in Documentation Mode */}
                        {isDocumentationMode && (
                          <div className="space-y-2">
                            <div className="mb-2 border-b border-slate-200 pb-1 text-xs font-medium text-slate-600">
                              Input Sources
                            </div>
                            <div className="space-y-2">
                              {/* Show audio transcription if it has content */}
                              {transcription.transcript && transcription.transcript.trim() !== '' && (
                                <TranscriptionControls
                                  collapsed={false}
                                  onExpand={() => setIsNoteFocused(false)}
                                  isMinimized
                                  mobileIsRecording={mobileIsRecording}
                                />
                              )}

                              {/* Show typed input if it has content */}
                              {typedInput && typedInput.trim() !== '' && (
                                <TypedInput
                                  collapsed={false}
                                  onExpand={() => setIsNoteFocused(false)}
                                  isMinimized
                                />
                              )}

                              {/* Show separator only if we have input sources above */}
                              {((transcription.transcript && transcription.transcript.trim() !== '')
                                || (typedInput && typedInput.trim() !== '')) && (
                                <div className="border-t border-slate-200" />
                              )}

                              <AdditionalNotes
                                items={consultationItems}
                                onNotesChange={setConsultationNotes}
                                notes={consultationNotes}
                                placeholder="Additional information gathered during consultation..."
                                isMinimized
                                defaultExpanded={inputMode === 'audio'}
                                expandedSize={inputMode === 'audio' ? 'large' : 'normal'}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Vertical Divider */}
                      <div className="w-px bg-slate-200" />

                      {/* Right Column - Main Workflow (65-70%) */}
                      <div className="h-full flex-1 space-y-4">
                        {/* Conditional Layout Based on Documentation Mode */}
                        {isDocumentationMode
                          ? (
                              <>
                                {/* Clinical Documentation - Top Priority */}
                                <div className="flex h-full flex-col">
                                  {/* Removed TranscriptProcessingStatus - no longer needed in single-pass */}
                                  <GeneratedNotes
                                    onGenerate={handleGenerateNotes}
                                    onClearAll={handleClearAll}
                                    loading={loading}
                                    isNoteFocused={isNoteFocused}
                                    isDocumentationMode={isDocumentationMode}
                                  />
                                </div>
                              </>
                            )
                          : (
                              <div className="flex h-full flex-col space-y-4">
                                {/* Input Components */}
                                <div className="flex flex-1 flex-col space-y-4">
                                  {inputMode === 'audio'
                                    ? (
                                        <TranscriptionControls
                                          collapsed={isNoteFocused}
                                          onExpand={() => setIsNoteFocused(false)}
                                          isMinimized={false}
                                          mobileIsRecording={mobileIsRecording}
                                          defaultRecordingMethod={defaultRecordingMethod}
                                        />
                                      )
                                    : (
                                        <TypedInput
                                          collapsed={isNoteFocused}
                                          onExpand={() => setIsNoteFocused(false)}
                                          isMinimized={false}
                                        />
                                      )}

                                  <AdditionalNotes
                                    items={consultationItems}
                                    onNotesChange={setConsultationNotes}
                                    notes={consultationNotes}
                                    placeholder="Additional information gathered during consultation..."
                                    isMinimized={false}
                                    defaultExpanded={inputMode === 'audio'}
                                    expandedSize={inputMode === 'audio' ? 'large' : 'normal'}
                                  />
                                </div>

                                {/* Clinical Documentation - Bottom */}
                                <div className="mt-auto flex flex-col">
                                  <GeneratedNotes
                                    onGenerate={handleGenerateNotes}
                                    onClearAll={handleClearAll}
                                    loading={loading}
                                    isNoteFocused={isNoteFocused}
                                    isDocumentationMode={isDocumentationMode}
                                  />
                                </div>
                              </div>
                            )}
                      </div>
                    </div>
                  )
                : (
                  /* Tablet/Mobile/Small Desktop Single-Column Layout (Unchanged) */
                    <Stack spacing={isDesktop ? 'sm' : 'sm'} className="h-full">
                      {/* Patient Session Manager - V2 Feature */}
                      <PatientSessionManager />

                      {/* Documentation Settings Badge - Always visible below session bar */}
                      <DocumentationSettingsBadge />

                      {/* Conditional Layout Based on Documentation Mode */}
                      {isDocumentationMode
                        ? (
                            <>
                              {/* Clinical Documentation - Top Priority */}
                              <div className="flex flex-1 flex-col">
                                {/* Removed TranscriptProcessingStatus - no longer needed in single-pass */}
                                <GeneratedNotes
                                  onGenerate={handleGenerateNotes}
                                  onClearAll={handleClearAll}
                                  loading={loading}
                                  isNoteFocused={isNoteFocused}
                                  isDocumentationMode={isDocumentationMode}
                                />
                              </div>

                              {/* Minimized Consultation Sections */}
                              <div className="space-y-1">
                                <div className="space-y-2">
                                  {inputMode === 'audio'
                                    ? (
                                        <TranscriptionControls
                                          collapsed={false}
                                          onExpand={() => setIsNoteFocused(false)}
                                          isMinimized
                                          mobileIsRecording={mobileIsRecording}
                                          defaultRecordingMethod={defaultRecordingMethod}
                                        />
                                      )
                                    : (
                                        <TypedInput
                                          collapsed={false}
                                          onExpand={() => setIsNoteFocused(false)}
                                          isMinimized
                                        />
                                      )}

                                  <AdditionalNotes
                                    items={consultationItems}
                                    onNotesChange={setConsultationNotes}
                                    notes={consultationNotes}
                                    placeholder="Additional information gathered during consultation..."
                                    isMinimized
                                    defaultExpanded={inputMode === 'audio'}
                                    expandedSize={inputMode === 'audio' ? 'large' : 'normal'}
                                  />
                                </div>
                              </div>
                            </>
                          )
                        : (
                            <div className="flex flex-1 flex-col space-y-4">
                              {/* Input Components */}
                              <div className="flex flex-1 flex-col space-y-4">
                                {inputMode === 'audio'
                                  ? (
                                      <TranscriptionControls
                                        collapsed={isNoteFocused}
                                        onExpand={() => setIsNoteFocused(false)}
                                        isMinimized={false}
                                        mobileIsRecording={mobileIsRecording}
                                        defaultRecordingMethod={defaultRecordingMethod}
                                      />
                                    )
                                  : (
                                      <TypedInput
                                        collapsed={isNoteFocused}
                                        onExpand={() => setIsNoteFocused(false)}
                                        isMinimized={false}
                                      />
                                    )}

                                <AdditionalNotes
                                  items={consultationItems}
                                  onNotesChange={setConsultationNotes}
                                  notes={consultationNotes}
                                  placeholder="Additional information gathered during consultation..."
                                  isMinimized={false}
                                  defaultExpanded={inputMode === 'audio'}
                                  expandedSize={inputMode === 'audio' ? 'large' : 'normal'}
                                />
                              </div>

                                {/* Clinical Documentation - Bottom */}
                                <div className="mt-auto flex flex-col">
                                 <GeneratedNotes
                                   onGenerate={handleGenerateNotes}
                                   onClearAll={handleClearAll}
                                   loading={loading}
                                   isNoteFocused={isNoteFocused}
                                   isDocumentationMode={isDocumentationMode}
                                 />
                                </div>
                            </div>
                          )}
                    </Stack>
                  )}
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Right Panel Overlay (hidden on phones) */}
      {isTablet && (
        <MobileRightPanelOverlay
          isOpen={rightPanelOpen}
          onClose={() => setRightPanelOpen(false)}
        />
      )}

      {/* Rate Limit Modal */}
      {rateLimitError && (
        <RateLimitModal
          isOpen={rateLimitModalOpen}
          onClose={() => setRateLimitModalOpen(false)}
          error={rateLimitError}
        />
      )}

      {/* Removed Admin Preview Modal - no longer needed in single-pass architecture */}

      {/* Mobile Block Modal */}
      <MobileBlockModal isOpen={showMobileBlock} />

      {/* Contact & Feedback - Fixed bottom row for non-large desktop */}
      {!isLargeDesktop && (
        <div className="fixed bottom-4 left-4 right-4 z-20">
          <div className="flex gap-2">
            <div className="w-1/2">
              <FeatureFeedbackButton
                feature="general"
                context={`Page: Consultation; Template: ${templateId || 'none'}; Input Mode: ${inputMode}`}
                variant="text"
                className="w-full justify-center"
              />
            </div>
            <div className="w-1/2">
              <ContactLink className="w-full justify-center" />
            </div>
          </div>
        </div>
      )}
      </div>
    </RecordingAwareSessionContext.Provider>
  );
}
