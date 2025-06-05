'use client';

import React, { useState } from 'react';

import { GeneratedNotes } from '@/features/consultation/components/GeneratedNotes';
import { InputModeToggle } from '@/features/consultation/components/InputModeToggle';
import { QuickNotes } from '@/features/consultation/components/QuickNotes';
import RightSidebarFeatures from '@/features/consultation/components/RightSidebarFeatures';
import { TranscriptionControls } from '@/features/consultation/components/TranscriptionControls';
import { TypedInput } from '@/features/consultation/components/TypedInput';
import { QuickTemplateSettings } from '@/features/templates/components/QuickTemplateSettings';
import { TemplateSelector } from '@/features/templates/components/TemplateSelector';
import { useSelectedTemplate } from '@/features/templates/hooks/useSelectedTemplate';
import { Footer } from '@/shared/components/Footer';
import { Header } from '@/shared/components/Header';
import { Container } from '@/shared/components/layout/Container';
import { Grid } from '@/shared/components/layout/Grid';
import { Stack } from '@/shared/components/layout/Stack';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

export default function ConsultationPage() {
  const {
    transcription,
    templateId,
    quickNotes,
    typedInput,
    inputMode,
    settingsOverride,
    setGeneratedNotes,
    setError,
    setLastGeneratedInput,
  } = useConsultation();
  const [loading, setLoading] = useState(false);
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const { selectedTemplate } = useSelectedTemplate();

  const handleClearAll = () => {
    setIsNoteFocused(false);
    // The following should be called in GeneratedNotes, but for clarity, you can also call context resets here if needed
    // resetConsultation();
    // resetLastGeneratedInput();
  };

  const handleGenerateNotes = async () => {
    setIsNoteFocused(true);
    setLoading(true);
    setError(null);

    // Get input based on current mode
    const transcript = inputMode === 'typed' ? '' : transcription.transcript;
    const currentTypedInput = inputMode === 'typed' ? typedInput : '';
    const currentQuickNotes = inputMode === 'typed' ? [] : quickNotes;

    try {
      const res = await fetch('/api/consultation/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: transcript,
          typedInput: currentTypedInput,
          templateId,
          quickNotes: currentQuickNotes,
          inputMode,
          settingsOverride,
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
      setLastGeneratedInput(transcript, currentQuickNotes, currentTypedInput);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        <Container size="lg">
          <Grid cols={3} gap="lg">
            {/* Left Column - Main Clinical Documentation Area */}
            <div className="lg:col-span-2">
              <Stack spacing="sm">
                {/* Documentation Settings */}
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
                      {/* Template Configuration */}
                      <QuickTemplateSettings selectedTemplate={selectedTemplate || null} />
                    </div>
                  </CardContent>
                </Card>

                {/* Conditional Input Components Based on Mode */}
                {inputMode === 'audio'
                  ? (
                      <>
                        {/* Digital Recording */}
                        <TranscriptionControls collapsed={isNoteFocused} onExpand={() => setIsNoteFocused(false)} />

                        {/* Clinical Notes */}
                        <QuickNotes collapsed={isNoteFocused} onExpand={() => setIsNoteFocused(false)} />
                      </>
                    )
                  : (
                      <>
                        {/* Manual Entry */}
                        <TypedInput collapsed={isNoteFocused} onExpand={() => setIsNoteFocused(false)} />
                      </>
                    )}

                {/* Clinical Documentation - Shared by both modes */}
                <GeneratedNotes onGenerate={handleGenerateNotes} onClearAll={handleClearAll} loading={loading} isNoteFocused={isNoteFocused} />
              </Stack>
            </div>

            {/* Right Column - Clinical Tools */}
            <div className="lg:col-span-1">
              <RightSidebarFeatures />
            </div>
          </Grid>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
