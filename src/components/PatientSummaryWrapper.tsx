'use client';

import React from 'react';

import { PatientSummary } from '@/components/PatientSummary';
import type { Template } from '@/types/templates';

type PatientSummaryWrapperProps = {
  patientSummary: string;
  setPatientSummary: (summary: string) => void;
  selectedTemplate: string;
  handleTemplateChange: (template: string) => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  templates: Template[];
  resetAll: () => void;
  isLoading: boolean;
  error: string | null;
  recordingError: string | null;
};

export function PatientSummaryWrapper(props: PatientSummaryWrapperProps) {
  return <PatientSummary {...props} />;
}
