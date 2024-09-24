'use client';

import React from 'react';

import { AIAssistance } from '@/components/AIAssistance';
import { PatientSummary } from '@/components/PatientSummary';
import { Search } from '@/components/Search';
import { Tools } from '@/components/Tools';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConsultationApp } from '@/hooks/useConsultationApp';
import { TemplateManagementInterface } from '@/components/TemplateManagementInterface';

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
    addPrompt,
    editPrompt,
    deletePrompt,
    selectedAITask,
    setSelectedAITask,
    customPromptResults,
    isLoading,
    error,
    resetAll,
    templates,
    addTemplate,
    editTemplate,
    deleteTemplate,
    handleCustomPrompt,
  } = useConsultationApp();

  return (
    <div className="flex h-screen max-h-screen flex-col bg-background">
      <main className="grow overflow-hidden">
        <div className="mx-auto h-full max-w-7xl p-4 sm:px-6 lg:px-8">
          <div className="flex h-full gap-4">
            <div className="flex w-1/2 flex-col">
              <PatientSummary
                patientSummary={patientSummary}
                setPatientSummary={setPatientSummary}
                selectedTemplate={selectedTemplate}
                handleTemplateChange={handleTemplateChange}
                isRecording={isRecording}
                startRecording={startRecording}
                stopRecording={stopRecording}
                templates={templates}
                addTemplate={addTemplate}
                editTemplate={editTemplate}
                deleteTemplate={deleteTemplate}
                handleConsultAssist={handleConsultAssist}
                handleDifferentialDiagnosis={handleDifferentialDiagnosis}
                resetAll={resetAll}
                prompts={prompts}
                handleCustomPrompt={handleCustomPrompt}
                addPrompt={addPrompt}
                isLoading={isLoading}
                error={error}
              />
            </div>

            <div className="w-1/2 overflow-y-auto">
              <Tabs value={rightColumnTab} onValueChange={setRightColumnTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="ai">AI Assistance</TabsTrigger>
                  <TabsTrigger value="search">Search</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
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
                <TabsContent value="templates" className="mt-2">
                  <TemplateManagementInterface
                    templates={templates}
                    addTemplate={addTemplate}
                    editTemplate={editTemplate}
                    deleteTemplate={deleteTemplate}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
