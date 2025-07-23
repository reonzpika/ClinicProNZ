'use client';

import { useAuth } from '@clerk/nextjs';
import { Crown, Stethoscope } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { AdditionalNotes } from '@/src/features/clinical/main-ui/components/AdditionalNotes';
import { DocumentationSettingsBadge } from '@/src/features/clinical/main-ui/components/DocumentationSettingsBadge';
import { GeneratedNotes } from '@/src/features/clinical/main-ui/components/GeneratedNotes';
import { TranscriptionControls } from '@/src/features/clinical/main-ui/components/TranscriptionControls';
import { TranscriptProcessingStatus } from '@/src/features/clinical/main-ui/components/TranscriptProcessingStatus';
import { TypedInput } from '@/src/features/clinical/main-ui/components/TypedInput';
import { MobileRightPanelOverlay } from '@/src/features/clinical/mobile/components/MobileRightPanelOverlay';
import { useSimpleAbly } from '@/src/features/clinical/mobile/hooks/useSimpleAbly';
import RightPanelFeatures from '@/src/features/clinical/right-sidebar/components/RightPanelFeatures';
import UsageDashboard from '@/src/features/clinical/right-sidebar/components/UsageDashboard';
import { WorkflowInstructions } from '@/src/features/clinical/right-sidebar/components/WorkflowInstructions';
import { PatientSessionManager } from '@/src/features/clinical/session-management/components/PatientSessionManager';
import { Container } from '@/src/shared/components/layout/Container';
import { Stack } from '@/src/shared/components/layout/Stack';
import { RateLimitModal } from '@/src/shared/components/RateLimitModal';
import { Button } from '@/src/shared/components/ui/button';
import { useConsultation } from '@/src/shared/ConsultationContext';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { useResponsive } from '@/src/shared/hooks/useResponsive';
import { createAuthHeadersWithGuest } from '@/src/shared/utils';

export default function ConsultationPage() {
  const {
    transcription,
    templateId,
    typedInput,
    inputMode,
    mobileV2 = { isEnabled: false, token: null, tokenData: null, connectedDevices: [], connectionStatus: 'disconnected' },
    consultationItems,
    consultationNotes,
    generatedNotes,
    setGeneratedNotes,
    setError,
    setLastGeneratedInput,
    setConsultationNotes,
    getCompiledConsultationText,
    appendTranscription,
    setMobileV2ConnectionStatus,
    addMobileV2Device,
    removeMobileV2Device,
    currentPatientSessionId,
    getCurrentPatientSession,
    getEffectiveGuestToken,
    // Structured transcript functions
    setStatus,
    setStructuredTranscriptStatus,
    setStructuredTranscript,
    isStructuredTranscriptFresh,
    getEffectiveTranscript,
    structuredTranscript,
  } = useConsultation();
  const { isSignedIn: _isSignedIn, userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const [loading, setLoading] = useState(false);
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [isDocumentationMode, setIsDocumentationMode] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true);
  const [rateLimitModalOpen, setRateLimitModalOpen] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<{ limit: number; resetIn: number; message: string } | null>(null);
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();

  // Check for upgrade redirect
  const [showUpgradeNotification, setShowUpgradeNotification] = useState(false);

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

  // Usage dashboard refresh ref
  const usageDashboardRef = useRef<{ refresh: () => void } | null>(null);

  // Session limits are now handled contextually when users try to perform actions
  // The UsageDashboard will show the current status and the modal will appear on 429 errors

  // Auto-enable/disable documentation mode based on generated notes or loading state
  useEffect(() => {
    if ((generatedNotes && generatedNotes.trim()) || loading) {
      if (!isDocumentationMode) {
        setIsDocumentationMode(true);
      }
    } else if ((!generatedNotes || !generatedNotes.trim()) && !loading && isDocumentationMode) {
      setIsDocumentationMode(false);
    }
  }, [generatedNotes, loading, isDocumentationMode]);

  // Simple Ably sync implementation using single channel approach
  const { updateSession } = useSimpleAbly({
    tokenId: mobileV2?.token || null,
    onTranscriptReceived: (transcript, sessionId) => {
      // Only process transcripts for the current session
      if (sessionId === currentPatientSessionId) {
        appendTranscription(transcript, true, 'mobile');
      }
    },
    onSessionChanged: (sessionId, patientName) => {
      // Mobile received session update - this shouldn't happen on desktop
      console.log('Session changed on desktop (unexpected):', sessionId, patientName);
    },
    onDeviceConnected: (deviceName) => {
      // Update local state when device connects
      addMobileV2Device({
        deviceId: `mobile-${Date.now()}`,
        deviceName,
        deviceType: 'Mobile',
        connectedAt: Date.now(),
      });
      setMobileV2ConnectionStatus('connected');
    },
    onDeviceDisconnected: (_deviceName) => {
      // Update local state when device disconnects
      const currentDevices = mobileV2?.connectedDevices || [];
      if (currentDevices.length <= 1) {
        setMobileV2ConnectionStatus('disconnected');
      }
    },
    onError: (error) => {
      setError(error);
    },
  });

  // Send session updates to mobile when patient changes
  useEffect(() => {
    if (currentPatientSessionId && mobileV2?.token && updateSession) {
      const session = getCurrentPatientSession();
      if (session?.patientName) {
        updateSession(currentPatientSessionId, session.patientName);
      }
    }
  }, [currentPatientSessionId, mobileV2?.token, updateSession, getCurrentPatientSession]);

  const handleForceDisconnectDevice = useCallback(async (deviceId: string) => {
    // TODO: Implement simple force disconnect when we have the new hook
    // For now, just remove from local state
    removeMobileV2Device(deviceId);
    const currentDevices = mobileV2?.connectedDevices || [];
    if (currentDevices.length <= 1) {
      setMobileV2ConnectionStatus('disconnected');
    }
  }, [removeMobileV2Device, setMobileV2ConnectionStatus]);

  const handleClearAll = () => {
    setIsNoteFocused(false);
    setIsDocumentationMode(false);
  };

  const handleGenerateNotes = async () => {
    setIsNoteFocused(true);
    setIsDocumentationMode(true);
    setLoading(true);
    setError(null);

    // Get input based on current mode
    const transcript = inputMode === 'typed' ? '' : transcription.transcript;
    const currentTypedInput = inputMode === 'typed' ? typedInput : '';
    const compiledConsultationText = getCompiledConsultationText();

    try {
      // Get effective guest token
      const effectiveGuestToken = getEffectiveGuestToken();

      // Step 1: Structure transcript (if in audio mode and transcript exists)
      let processedTranscript = transcript;

      if (inputMode === 'audio' && transcript?.trim()) {
        // Check if we have a fresh structured transcript
        if (isStructuredTranscriptFresh(transcript)) {
          // Use existing structured transcript
          processedTranscript = getEffectiveTranscript();
        } else {
          // Structure the transcript
          setStatus('processing'); // Set status to show we're working
          setStructuredTranscriptStatus('structuring');

          try {
            const structureRes = await fetch('/api/consultation/structure-transcript', {
              method: 'POST',
              headers: createAuthHeadersWithGuest(userId, userTier, effectiveGuestToken),
              body: JSON.stringify({
                transcription: transcript,
                guestToken: effectiveGuestToken,
              }),
            });

            if (structureRes.ok) {
              const structureData = await structureRes.json();
              const structuredContent = structureData.structuredTranscript;

              if (structuredContent) {
                // Cache the structured transcript
                setStructuredTranscript(structuredContent, transcript);
                processedTranscript = structuredContent;
              } else {
                console.warn('No structured content received, using original transcript');
                setStructuredTranscriptStatus('failed');
              }
            } else {
              // Handle structuring errors gracefully
              const errorData = await structureRes.json();
              console.warn('Transcript structuring failed:', errorData.message);

              // Use fallback transcript if provided
              if (errorData.fallbackTranscript) {
                processedTranscript = errorData.fallbackTranscript;
              }

              setStructuredTranscriptStatus('failed');
            }
          } catch (structureError) {
            console.warn('Transcript structuring error:', structureError);
            setStructuredTranscriptStatus('failed');
            // Continue with original transcript
          }
        }
      }

      // Step 2: Generate notes using processed transcript
      const requestBody = {
        transcription: processedTranscript,
        typedInput: currentTypedInput,
        templateId,
        inputMode,
        consultationNotes: compiledConsultationText,
        guestToken: effectiveGuestToken,
      };

      const res = await fetch('/api/consultation/notes', {
        method: 'POST',
        headers: createAuthHeadersWithGuest(userId, userTier, effectiveGuestToken),
        body: JSON.stringify(requestBody),
      });

      // Check for rate limit error
      if (res.status === 429) {
        const errorData = await res.json();
        setRateLimitError({
          limit: errorData.limit,
          resetIn: errorData.resetIn,
          message: errorData.message,
        });
        setRateLimitModalOpen(true);
        return;
      }

      if (!res.body) {
        setError('No response body');
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

      // Use the original transcript for tracking, not the processed one
      setLastGeneratedInput(transcript, currentTypedInput, compiledConsultationText, templateId);

      // Refresh usage dashboard after successful notes generation
      if (usageDashboardRef.current?.refresh) {
        usageDashboardRef.current.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate notes');
    } finally {
      setLoading(false);
    }
  };

  return (
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
            {(isMobile || isTablet) && (
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
                      onClick={() => {
                        // Scroll to usage dashboard
                        const dashboard = document.querySelector('[data-component="usage-dashboard"]');
                        if (dashboard) {
                          dashboard.scrollIntoView({ behavior: 'smooth' });
                        }
                        setShowUpgradeNotification(false);
                      }}
                    >
                      Upgrade Now
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

                        {/* Usage Dashboard - Shows tier limits and usage */}
                        <div data-component="usage-dashboard">
                          <UsageDashboard ref={usageDashboardRef} />
                        </div>

                        {/* Workflow Instructions - Only visible on large desktop */}
                        <WorkflowInstructions />

                        {/* Minimized Components in Documentation Mode */}
                        {isDocumentationMode && (
                          <div className="space-y-2">
                            <div className="mb-2 border-b border-slate-200 pb-1 text-xs font-medium text-slate-600">
                              Input Sources
                            </div>
                            <div className="space-y-2">
                              {inputMode === 'audio'
                                ? (
                                    <TranscriptionControls
                                      collapsed={false}
                                      onExpand={() => setIsNoteFocused(false)}
                                      isMinimized
                                      onForceDisconnectDevice={handleForceDisconnectDevice}
                                      startMobileRecording={async () => false}
                                    />
                                  )
                                : (
                                    <TypedInput
                                      collapsed={false}
                                      onExpand={() => setIsNoteFocused(false)}
                                      isMinimized
                                    />
                                  )}

                              {/* Separator */}
                              <div className="border-t border-slate-200" />

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
                                <div className={`flex flex-col ${(generatedNotes && generatedNotes.trim()) || loading ? 'h-full' : ''}`}>
                                  <TranscriptProcessingStatus
                                    isLoading={loading}
                                    structuredTranscriptStatus={structuredTranscript.status}
                                    inputMode={inputMode}
                                  />
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
                                          onForceDisconnectDevice={handleForceDisconnectDevice}
                                          startMobileRecording={async () => false}
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
                                <div className={`flex flex-col ${(generatedNotes && generatedNotes.trim()) || loading ? 'min-h-0 flex-1' : ''}`}>
                                  <TranscriptProcessingStatus
                                    isLoading={loading}
                                    structuredTranscriptStatus={structuredTranscript.status}
                                    inputMode={inputMode}
                                  />
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
                              <div className={`flex flex-col ${(generatedNotes && generatedNotes.trim()) || loading ? 'flex-1' : ''}`}>
                                <TranscriptProcessingStatus
                                  isLoading={loading}
                                  structuredTranscriptStatus={structuredTranscript.status}
                                  inputMode={inputMode}
                                />
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
                                          onForceDisconnectDevice={handleForceDisconnectDevice}
                                          startMobileRecording={async () => false}
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
                                        onForceDisconnectDevice={handleForceDisconnectDevice}
                                        startMobileRecording={async () => false}
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
                              <div className={`flex flex-col ${(generatedNotes && generatedNotes.trim()) || loading ? 'min-h-0 flex-1' : ''}`}>
                                <TranscriptProcessingStatus
                                  isLoading={loading}
                                  structuredTranscriptStatus={structuredTranscript.status}
                                  inputMode={inputMode}
                                />
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

      {/* Mobile Right Panel Overlay */}
      <MobileRightPanelOverlay
        isOpen={rightPanelOpen}
        onClose={() => setRightPanelOpen(false)}
      />

      {/* Rate Limit Modal */}
      {rateLimitError && (
        <RateLimitModal
          isOpen={rateLimitModalOpen}
          onClose={() => setRateLimitModalOpen(false)}
          error={rateLimitError}
        />
      )}
    </div>
  );
}
