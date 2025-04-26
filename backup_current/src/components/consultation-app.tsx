'use client';

import React from 'react';

import { AIAssistance } from '@/components/AIAssistance';
import { ConsultTimerProvider } from '@/components/ConsultTimerProvider';
import { PatientSummaryWrapper } from '@/components/PatientSummaryWrapper';
import { Search } from '@/components/Search';
import { Tools } from '@/components/Tools';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConsultationApp } from '@/hooks/useConsultationApp';
import type { Template } from '@/types/templates';

export function ConsultationApp() {
  const {
    patientSummary,
    setPatientSummary,
    rightColumnTab,
    setRightColumnTab,
    selectedTemplate,
    handleTemplateChange,
    isRecording,
    startRecording,
    stopRecording,
    toolsSearchQuery,
    setToolsSearchQuery,
    activeToolsCategory,
    setActiveToolsCategory,
    consultAssistResults,
    differentialDiagnosisResults,
    handleConsultAssist,
    handleDifferentialDiagnosis,
    prompts,
    customPromptResults,
    isLoading,
    error,
    resetAll,
    templates,
    handleCustomPrompt,
    recordingError,
    searchQuery,
    setSearchQuery,
  } = useConsultationApp();

  return (
    <ConsultTimerProvider>
      <div className="flex h-[calc(100vh-4rem)] flex-col gap-0.5 bg-background lg:flex-row">
        <div className="flex-1 overflow-hidden lg:w-1/2">
          <PatientSummaryWrapper
            patientSummary={patientSummary}
            setPatientSummary={setPatientSummary}
            selectedTemplate={selectedTemplate}
            handleTemplateChange={handleTemplateChange}
            isRecording={isRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
            templates={templates as Template[]}
            resetAll={resetAll}
            isLoading={isLoading}
            error={error}
            recordingError={recordingError}
          />
        </div>

        <div className="flex-1 overflow-hidden lg:w-1/2">
          <Card className="h-full rounded-none border-0">
            <Tabs value={rightColumnTab} onValueChange={setRightColumnTab}>
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger value="ai" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  AI Assistance
                </TabsTrigger>
                <TabsTrigger value="tools" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Tools
                </TabsTrigger>
                <TabsTrigger value="search" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Search
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="mt-0">
                <AIAssistance
                  consultAssistResults={consultAssistResults}
                  differentialDiagnosisResults={differentialDiagnosisResults}
                  handleConsultAssist={handleConsultAssist}
                  handleDifferentialDiagnosis={handleDifferentialDiagnosis}
                  prompts={prompts}
                  customPromptResults={customPromptResults}
                  handleCustomPrompt={handleCustomPrompt}
                  isLoading={isLoading}
                  error={error}
                  patientSummary={patientSummary}
                />
              </TabsContent>

              <TabsContent value="tools" className="mt-0">
                <Tools
                  searchQuery={toolsSearchQuery}
                  setSearchQuery={setToolsSearchQuery}
                  activeCategory={activeToolsCategory}
                  setActiveCategory={setActiveToolsCategory}
                />
              </TabsContent>

              <TabsContent value="search" className="mt-0">
                <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </ConsultTimerProvider>
  );
}
