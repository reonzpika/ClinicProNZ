'use client';

import React from 'react';

import { AIAssistance } from '@/components/AIAssistance';
import { PatientSummary } from '@/components/PatientSummary';
import { Search } from '@/components/Search';
import { Tools } from '@/components/Tools';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConsultationApp } from '@/hooks/useConsultationApp';

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
    selectedAITask,
    setSelectedAITask,
    customPromptResults,
    isLoading,
    error,
    resetAll,
    templates,
    handleCustomPrompt,
  } = useConsultationApp();

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="lg:w-1/2">
        <PatientSummary
          patientSummary={patientSummary}
          setPatientSummary={setPatientSummary}
          selectedTemplate={selectedTemplate}
          handleTemplateChange={handleTemplateChange}
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          templates={templates}
          resetAll={resetAll}
          isLoading={isLoading}
          error={error}
        />
      </div>

      <div className="lg:w-1/2">
        <Tabs value={rightColumnTab} onValueChange={setRightColumnTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai">AI Assistance</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>
          <TabsContent value="ai" className="mt-2">
            <AIAssistance
              selectedAITask={selectedAITask}
              setSelectedAITask={setSelectedAITask}
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
          <TabsContent value="search" className="mt-2">
            <Search
              searchQuery={toolsSearchQuery}
              setSearchQuery={setToolsSearchQuery}
            />
          </TabsContent>
          <TabsContent value="tools" className="mt-2">
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
