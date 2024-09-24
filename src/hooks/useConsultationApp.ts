import { useState } from 'react';

import { useConsultAssist } from '@/hooks/useConsultAssist';
import { usePromptManagement } from '@/hooks/usePromptManagement';

export function useConsultationApp() {
  const [patientSummary, setPatientSummary] = useState('');
  const [rightColumnTab, setRightColumnTab] = useState('ai');
  const [selectedTemplate, setSelectedTemplate] = useState('general');
  const [isRecording, setIsRecording] = useState(false);
  const [toolsSearchQuery, setToolsSearchQuery] = useState('');
  const [activeToolsCategory, setActiveToolsCategory] = useState('');

  const {
    consultAssistResults,
    differentialDiagnosisResults,
    handleConsultAssist,
    handleDifferentialDiagnosis,
    isLoading,
    error,
    makeAPIRequest, // This should be provided by useConsultAssist
  } = useConsultAssist();

  const { prompts, addPrompt, editPrompt, deletePrompt } = usePromptManagement();

  const [selectedAITask, setSelectedAITask] = useState('consult');
  const [customPromptResults, setCustomPromptResults] = useState<Record<string, string>>({});

  const [templates, setTemplates] = useState({
    general: `Chief Complaint:

History of Present Illness:

Past Medical History:

Medications:

Allergies:

Social History:

Family History:

Review of Systems:

Physical Examination:

Assessment:

Plan:`,
    followup: `Reason for Follow-up:

Progress Since Last Visit:

Current Symptoms:

Medication Review:

New Concerns:

Physical Examination:

Assessment:

Plan:`,
    chronic: `Chronic Condition:

Current Status:

Symptom Review:

Medication Adherence:

Lifestyle Modifications:

Physical Examination:

Disease-Specific Metrics:

Complications Screening:

Assessment:

Management Plan:`,
  });

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    setPatientSummary(templates[value]);
  };

  const startRecording = () => {
    setIsRecording(true);
    // Implement recording logic
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Implement stop recording logic
  };

  const resetAll = () => {
    setPatientSummary('');
    setSelectedAITask('consult');
    setCustomPromptResults({});
    // Reset other state variables as needed
  };

  const handleCustomPrompt = async (promptId: string) => {
    try {
      const selectedPrompt = prompts.find(p => p.id === promptId);
      if (selectedPrompt && makeAPIRequest) {
        const response = await makeAPIRequest(selectedPrompt.content, patientSummary);
        setCustomPromptResults(prev => ({ ...prev, [promptId]: response }));
        setSelectedAITask(promptId);
      }
    } catch (err) {
      console.error('Error in custom prompt:', err);
      // Error handling is managed by makeAPIRequest
    }
  };

  const addNewTemplate = (name: string, content: string) => {
    setTemplates(prev => ({
      ...prev,
      [name]: content,
    }));
  };

  return {
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
    addNewTemplate,
    handleCustomPrompt,
  };
}
