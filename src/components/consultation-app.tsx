'use client';

import React from 'react';

import { AIAssistance } from '@/components/AIAssistance';
import { PatientSummaryWrapper } from '@/components/PatientSummaryWrapper';
import { Search } from '@/components/Search';
import { Tools } from '@/components/Tools';
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
  } = useConsultationApp();

  return (
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
        <Tabs value={rightColumnTab} onValueChange={setRightColumnTab} className="flex h-full flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-muted p-0.5">
            <TabsTrigger value="ai">AI Assistance</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>
          <TabsContent value="ai" className="m-0 grow overflow-auto p-0.5">
            <AIAssistance
              consultAssistResults={consultAssistResults}
              differentialDiagnosisResults={differentialDiagnosisResults}
              prompts={prompts}
              customPromptResults={customPromptResults}
              isLoading={isLoading}
              error={error}
              handleConsultAssist={handleConsultAssist}
              handleDifferentialDiagnosis={handleDifferentialDiagnosis}
              handleCustomPrompt={handleCustomPrompt}
              patientSummary={patientSummary}
            />
          </TabsContent>
          <TabsContent value="search" className="grow overflow-auto p-0.5">
            <Search
              searchQuery={toolsSearchQuery}
              setSearchQuery={setToolsSearchQuery}
            />
          </TabsContent>
          <TabsContent value="tools" className="grow overflow-auto p-0.5">
            <Tools
              toolsSearchQuery={toolsSearchQuery}
              setToolsSearchQuery={setToolsSearchQuery}
              activeToolsCategory={activeToolsCategory}
              setActiveToolsCategory={setActiveToolsCategory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
