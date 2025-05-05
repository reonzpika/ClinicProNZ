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

import type { Template } from '@/features/templates/types';

export default function ConsultationPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>({
    id: '1',
    name: 'Multi-problem SOAP (Default)',
    type: 'default',
    description: 'Default template for multi-problem SOAP notes',
    sections: [],
    prompts: {
      structure: '',
    },
  });

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
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
                    <TemplateSelector
                      selectedTemplate={selectedTemplate}
                      onTemplateSelect={handleTemplateSelect}
                    />
                  </CardContent>
                </Card>

                {/* Transcription Controls */}
                <TranscriptionControls />

                {/* Quick Notes */}
                <QuickNotes />

                {/* Generated Notes */}
                <GeneratedNotes />
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
