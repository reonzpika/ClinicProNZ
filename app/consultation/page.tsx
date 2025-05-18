'use client';

import React, { useState } from 'react';

import { GeneratedNotes } from '@/features/consultation/components/GeneratedNotes';
import { QuickNotes } from '@/features/consultation/components/QuickNotes';
import RightSidebarFeatures from '@/features/consultation/components/RightSidebarFeatures';
import { TranscriptionControls } from '@/features/consultation/components/TranscriptionControls';
import { TemplateSelector } from '@/features/templates/components/TemplateSelector';
import { Footer } from '@/shared/components/Footer';
import { Header } from '@/shared/components/Header';
import { Container } from '@/shared/components/layout/Container';
import { Grid } from '@/shared/components/layout/Grid';
import { Stack } from '@/shared/components/layout/Stack';
import { Alert } from '@/shared/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

export default function ConsultationPage() {
  const {
    transcription,
    templateId,
    quickNotes,
    setGeneratedNotes,
    setError,
    setLastGeneratedInput,
  } = useConsultation();
  const [loading, setLoading] = useState(false);
  const [showLiveAlert, setShowLiveAlert] = useState(false);
  const [resetTranscriptionSignal, setResetTranscriptionSignal] = useState(0);
  const [isNoteFocused, setIsNoteFocused] = useState(false);

  const handleClearAll = () => {
    setResetTranscriptionSignal(s => s + 1);
    setIsNoteFocused(false);
    // The following should be called in GeneratedNotes, but for clarity, you can also call context resets here if needed
    // resetConsultation();
    // resetLastGeneratedInput();
  };

  const handleGenerateNotes = async () => {
    setIsNoteFocused(true);
    setLoading(true);
    setError(null);
    let transcript = '';
    if (transcription.isLive) {
      setShowLiveAlert(true);
      transcript = transcription.interimBuffer;
    } else {
      setShowLiveAlert(false);
      transcript = transcription.interimBuffer;
    }
    try {
      const res = await fetch('/api/consultation/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: transcript,
          templateId,
          quickNotes,
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
      setLastGeneratedInput(transcript, quickNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Container size="lg">
          <Grid cols={3} gap="lg">
            {/* Left Column - Main Consultation Area */}
            <div className="lg:col-span-2">
              <Stack spacing="sm">
                {/* Template Selection */}
                <Card>
                  <CardHeader>
                    <h2 className="text-xs font-semibold">Select Template</h2>
                  </CardHeader>
                  <CardContent>
                    <TemplateSelector />
                  </CardContent>
                </Card>

                {/* Transcription Controls */}
                <TranscriptionControls resetSignal={resetTranscriptionSignal} collapsed={isNoteFocused} onExpand={() => setIsNoteFocused(false)} />

                {/* Quick Notes */}
                <QuickNotes collapsed={isNoteFocused} onExpand={() => setIsNoteFocused(false)} />

                {/* Generated Notes */}
                <GeneratedNotes onGenerate={handleGenerateNotes} onClearAll={handleClearAll} loading={loading} isNoteFocused={isNoteFocused} />
              </Stack>
            </div>

            {/* Right Column - Future Features */}
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
