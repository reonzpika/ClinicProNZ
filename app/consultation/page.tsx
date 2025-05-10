'use client';

import React, { useState } from 'react';

import { GeneratedNotes } from '@/features/consultation/components/GeneratedNotes';
import { QuickNotes } from '@/features/consultation/components/QuickNotes';
import { TranscriptionControls } from '@/features/consultation/components/TranscriptionControls';
import { TemplateSelector } from '@/features/templates/components/TemplateSelector';
import { Footer } from '@/shared/components/Footer';
import { Header } from '@/shared/components/Header';
import { Container } from '@/shared/components/layout/Container';
import { Grid } from '@/shared/components/layout/Grid';
import { Stack } from '@/shared/components/layout/Stack';
import { Section } from '@/shared/components/layout/Section';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';
import { Alert } from '@/shared/components/ui/alert';

export default function ConsultationPage() {
  const {
    transcription,
    templateId,
    quickNotes,
    setGeneratedNotes,
    setError,
    setLastGeneratedInput,
    getCurrentTranscript,
  } = useConsultation();
  const [loading, setLoading] = useState(false);
  const [showLiveAlert, setShowLiveAlert] = useState(false);
  const [resetTranscriptionSignal, setResetTranscriptionSignal] = useState(0);

  const handleClearAll = () => {
    setResetTranscriptionSignal(s => s + 1);
    // The following should be called in GeneratedNotes, but for clarity, you can also call context resets here if needed
    // resetConsultation();
    // resetLastGeneratedInput();
  };

  const handleGenerateNotes = async () => {
    setLoading(true);
    setError(null);
    let transcript = '';
    if (transcription.isLive) {
      setShowLiveAlert(true);
      if (transcription.final && transcription.interimBuffer) {
        transcript = `${transcription.final} ${transcription.interimBuffer}`.trim();
      } else {
        transcript = transcription.interimBuffer;
      }
    } else {
      setShowLiveAlert(false);
      transcript = transcription.final;
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
      const data = await res.json();
      if (res.ok && data.notes) {
        setGeneratedNotes(data.notes);
        setLastGeneratedInput(transcript, quickNotes);
      } else {
        setError(data.error || 'Failed to generate notes');
      }
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
              <Stack spacing="lg">
                {/* Template Selection */}
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold">Select Template</h2>
                  </CardHeader>
                  <CardContent>
                    <TemplateSelector />
                  </CardContent>
                </Card>

                {/* Transcription Controls */}
                <TranscriptionControls resetSignal={resetTranscriptionSignal} />

                {/* Quick Notes */}
                <QuickNotes />

                {/* Generated Notes */}
                {showLiveAlert && (
                  <Alert variant="info">
                    Note generation will use the current live transcript.
                  </Alert>
                )}
                <GeneratedNotes onGenerate={handleGenerateNotes} onClearAll={handleClearAll} />
                {loading && <div className="text-muted-foreground">Generating notes...</div>}
              </Stack>
            </div>

            {/* Right Column - Future Features */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Future Features</h2>
                </CardHeader>
                <CardContent>
                  <Section>
                    <p className="text-muted-foreground">
                      This space is reserved for future features like NZ Resources, Tools, etc.
                    </p>
                  </Section>
                </CardContent>
              </Card>
            </div>
          </Grid>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
