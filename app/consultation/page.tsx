'use client';

import React, { useState, useEffect } from 'react';

import { AdditionalNotes } from '@/features/consultation/components/AdditionalNotes';
import { GeneratedNotes } from '@/features/consultation/components/GeneratedNotes';
import { InputModeToggle } from '@/features/consultation/components/InputModeToggle';
import RightPanelFeatures from '@/features/consultation/components/RightPanelFeatures';
import { TranscriptionControls } from '@/features/consultation/components/TranscriptionControls';
import { TypedInput } from '@/features/consultation/components/TypedInput';
import { useMobileSync } from '@/features/consultation/hooks/useMobileSync';
import { TemplateSelector } from '@/features/templates/components/TemplateSelector';
import { Footer } from '@/shared/components/Footer';
import { Container } from '@/shared/components/layout/Container';
import { Grid } from '@/shared/components/layout/Grid';
import { Stack } from '@/shared/components/layout/Stack';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

// Minimized Documentation Settings Component
function DocumentationSettingsMinimized() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between p-2 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-700">Documentation Settings</span>
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '−' : '+'}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-2 pt-0">
          <div className="space-y-2">
            {/* Template and Input Mode Row */}
            <div className="flex items-start gap-4">
              {/* Note Template Selection */}
              <div className="flex-1">
                <div className="mb-1 text-xs font-medium text-slate-600">
                  Note Template
                </div>
                <TemplateSelector />
              </div>

              {/* Input Method Selection */}
              <div className="shrink-0">
                <div className="mb-1 text-xs font-medium text-slate-600">
                  Input Method
                </div>
                <InputModeToggle />
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function ConsultationPage() {
  const {
    transcription,
    templateId,
    typedInput,
    inputMode,
    settingsOverride,
    sessionId,
    mobileRecording,
    consultationItems,
    consultationNotes,
    generatedNotes,
    setGeneratedNotes,
    setError,
    setLastGeneratedInput,
    setConsultationNotes,
    getCompiledConsultationText,
  } = useConsultation();
  const [loading, setLoading] = useState(false);
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [isDocumentationMode, setIsDocumentationMode] = useState(false);

  // Auto-enable documentation mode if notes already exist
  useEffect(() => {
    if (generatedNotes && generatedNotes.trim() && !isDocumentationMode) {
      setIsDocumentationMode(true);
    }
  }, [generatedNotes, isDocumentationMode]);

  // Enable mobile sync when mobile recording is active
  useMobileSync({
    enabled: mobileRecording.isActive,
    sessionId,
  });

  const handleClearAll = () => {
    setIsNoteFocused(false);
    setIsDocumentationMode(false);
    // The following should be called in GeneratedNotes, but for clarity, you can also call context resets here if needed
    // resetConsultation();
    // resetLastGeneratedInput();
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
          settingsOverride,
          consultationNotes: compiledConsultationText,
        }),
      });
      if (!res.body) {
        setError('No response body');
        setLoading(false);
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
              setLastGeneratedInput(transcript, currentTypedInput);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <Container size="lg">
        <Grid cols={3} gap="lg">
          {/* Left Column - Main Clinical Documentation Area */}
          <div className="lg:col-span-2">
            <Stack spacing="sm">
              {/* Documentation Settings - Only show in standard mode */}
              {!isDocumentationMode && (
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50">
                    <h2 className="text-sm font-medium text-slate-700">Documentation Settings</h2>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Template and Input Mode Row */}
                      <div className="flex items-start gap-6">
                        {/* Note Template Selection */}
                        <div className="flex-1">
                          <div className="mb-2 text-sm font-medium text-slate-600">
                            Note Template
                          </div>
                          <TemplateSelector />
                        </div>

                        {/* Input Method Selection */}
                        <div className="shrink-0">
                          <div className="mb-2 text-sm font-medium text-slate-600">
                            Input Method
                          </div>
                          <InputModeToggle />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Conditional Layout Based on Documentation Mode */}
              {isDocumentationMode
                ? (
                    <>
                      {/* Documentation Settings - Always at Top, Minimized */}
                      <DocumentationSettingsMinimized />

                      {/* Clinical Documentation - Top Priority */}
                      <div style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
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
                        {inputMode === 'audio'
                          ? (
                              <>
                                <TranscriptionControls collapsed={true} onExpand={() => setIsNoteFocused(false)} isMinimized={true} />
                                <AdditionalNotes
                                  items={consultationItems}
                                  onNotesChange={setConsultationNotes}
                                  notes={consultationNotes}
                                  placeholder="Additional information gathered during consultation..."
                                  isMinimized={true}
                                />
                              </>
                            )
                          : (
                              <>
                                <TypedInput collapsed={true} onExpand={() => setIsNoteFocused(false)} isMinimized={true} />
                                <AdditionalNotes
                                  items={consultationItems}
                                  onNotesChange={setConsultationNotes}
                                  notes={consultationNotes}
                                  placeholder="Additional information gathered during consultation..."
                                  isMinimized={true}
                                />
                              </>
                            )}
                      </div>
                    </>
                  )
                : (
                    <>
                      {/* Standard Layout - Consultation Input First */}
                      {inputMode === 'audio'
                        ? (
                            <>
                              {/* Digital Recording */}
                              <TranscriptionControls collapsed={isNoteFocused} onExpand={() => setIsNoteFocused(false)} />

                              {/* Additional Notes - Clinical tools and manual information */}
                              <AdditionalNotes
                                items={consultationItems}
                                onNotesChange={setConsultationNotes}
                                notes={consultationNotes}
                                placeholder="Additional information gathered during consultation..."
                              />
                            </>
                          )
                        : (
                            <>
                              {/* Manual Entry */}
                              <TypedInput collapsed={isNoteFocused} onExpand={() => setIsNoteFocused(false)} />

                              {/* Additional Notes - Clinical tools information */}
                              <AdditionalNotes
                                items={consultationItems}
                                onNotesChange={setConsultationNotes}
                                notes={consultationNotes}
                                placeholder="Additional information gathered during consultation..."
                              />
                            </>
                          )}

                      {/* Clinical Documentation - Bottom */}
                      <GeneratedNotes 
                        onGenerate={handleGenerateNotes} 
                        onClearAll={handleClearAll} 
                        loading={loading} 
                        isNoteFocused={isNoteFocused}
                        isDocumentationMode={isDocumentationMode}
                      />
                    </>
                  )}
            </Stack>
          </div>

          {/* Right Column - Clinical Tools */}
          <div className="lg:col-span-1">
            <RightPanelFeatures />
          </div>
        </Grid>
      </Container>

      <Footer />
    </div>
  );
}
