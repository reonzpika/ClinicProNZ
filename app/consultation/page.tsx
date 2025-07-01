'use client';

import { Stethoscope } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { AdditionalNotes } from '@/features/consultation/components/AdditionalNotes';
import { DocumentationSettingsBadge } from '@/features/consultation/components/DocumentationSettingsBadge';
import { GeneratedNotes } from '@/features/consultation/components/GeneratedNotes';
import { MobileRightPanelOverlay } from '@/features/consultation/components/MobileRightPanelOverlay';
import { PatientSessionManager } from '@/features/consultation/components/PatientSessionManager';
import RightPanelFeatures from '@/features/consultation/components/RightPanelFeatures';
import { TranscriptionControls } from '@/features/consultation/components/TranscriptionControls';
import { TypedInput } from '@/features/consultation/components/TypedInput';
import { WorkflowInstructions } from '@/features/consultation/components/WorkflowInstructions';
import { useAblySync } from '@/features/consultation/hooks/useAblySync';
import { Container } from '@/shared/components/layout/Container';
import { Stack } from '@/shared/components/layout/Stack';
import { Button } from '@/shared/components/ui/button';
import { useConsultation } from '@/shared/ConsultationContext';
import { useResponsive } from '@/shared/hooks/useResponsive';

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
  } = useConsultation();
  const [loading, setLoading] = useState(false);
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [isDocumentationMode, setIsDocumentationMode] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();

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

  // Memoized callbacks for WebSocket sync to prevent infinite re-renders
  const handleTranscriptionReceived = useCallback(async (transcript: string, _patientSessionId?: string) => {
    // Append mobile transcription to desktop transcription
    await appendTranscription(transcript, false, 'mobile'); // false = not live, mobile source
  }, [appendTranscription]);

  const handlePatientSwitched = useCallback((_patientSessionId: string, _patientName?: string) => {
    // Handle patient switching if needed
  }, []);

  const handleDeviceConnected = useCallback((deviceId: string, deviceName: string, deviceType?: string) => {
    addMobileV2Device({ deviceId, deviceName, deviceType, connectedAt: Date.now() });
    setMobileV2ConnectionStatus('connected');
  }, [addMobileV2Device, setMobileV2ConnectionStatus]);

  const handleDeviceDisconnected = useCallback((deviceId: string) => {
    removeMobileV2Device(deviceId);
    if (mobileV2.connectedDevices.length <= 1) {
      setMobileV2ConnectionStatus('disconnected');
    }
  }, [removeMobileV2Device, setMobileV2ConnectionStatus, mobileV2.connectedDevices.length]);

  const handleWebSocketError = useCallback((error: string | null) => {
    // WebSocket error handled silently
    setError(error);
    setMobileV2ConnectionStatus('error');
  }, [setError, setMobileV2ConnectionStatus]);

  // Enable Ably sync only when Mobile V2 token exists
  const { notifyPatientSwitch, forceDisconnectDevice } = useAblySync({
    enabled: !!mobileV2.token, // Only enable when user has generated a token
    token: mobileV2.token || undefined,
    isDesktop: true,
    onTranscriptionReceived: handleTranscriptionReceived,
    onPatientSwitched: handlePatientSwitched,
    onDeviceConnected: handleDeviceConnected,
    onDeviceDisconnected: handleDeviceDisconnected,
    onError: handleWebSocketError,
  });

  const handleForceDisconnectDevice = useCallback(async (deviceId: string) => {
    // Send force disconnect message to the device
    if (forceDisconnectDevice) {
      try {
        await forceDisconnectDevice(deviceId);
      } catch {
        // Silently handle error
      }
    }
    // Remove from local state immediately
    removeMobileV2Device(deviceId);
    if (mobileV2.connectedDevices.length <= 1) {
      setMobileV2ConnectionStatus('disconnected');
    }
  }, [forceDisconnectDevice, removeMobileV2Device, setMobileV2ConnectionStatus, mobileV2.connectedDevices.length]);

  // Notify mobile devices when session changes
  useEffect(() => {
    const notifyMobileDevices = async () => {
      if (currentPatientSessionId && notifyPatientSwitch) {
        const currentSession = getCurrentPatientSession();
        if (currentSession) {
          try {
            await notifyPatientSwitch(currentPatientSessionId, currentSession.patientName);
          } catch {
            // Silently handle error
          }
        }
      }
    };

    notifyMobileDevices();
  }, [currentPatientSessionId, notifyPatientSwitch, getCurrentPatientSession]);

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
      const res = await fetch('/api/consultation/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: transcript,
          typedInput: currentTypedInput,
          templateId,
          inputMode,
          consultationNotes: compiledConsultationText,
        }),
      });

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

      setLastGeneratedInput(transcript, currentTypedInput, compiledConsultationText, templateId);
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
                                        />
                                      )
                                    : (
                                        <TypedInput
                                          collapsed={isNoteFocused}
                                          onExpand={() => setIsNoteFocused(false)}
                                          isMinimized={false}
                                        />
                                      )}

                                  {/* Separator */}
                                  <div className="border-t border-slate-200" />

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
                                      />
                                    )
                                  : (
                                      <TypedInput
                                        collapsed={isNoteFocused}
                                        onExpand={() => setIsNoteFocused(false)}
                                        isMinimized={false}
                                      />
                                    )}

                                {/* Separator */}
                                <div className="border-t border-slate-200" />

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
    </div>
  );
}
