import { useCallback, useState } from 'react';

type ConsultAssistResults = {
  response: string;
};

type DifferentialDiagnosisResults = {
  response: string;
};

export function useConsultAssist() {
  const [consultAssistResults, setConsultAssistResults] = useState<ConsultAssistResults>({
    response: '',
  });
  const [differentialDiagnosisResults, setDifferentialDiagnosisResults] = useState<DifferentialDiagnosisResults>({
    response: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeAPIRequest = useCallback(async (prompt: string, patientSummary: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, patientSummary }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI assistance: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error in makeAPIRequest:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
      return '';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleConsultAssist = useCallback(async (patientSummary: string) => {
    console.log('handleConsultAssist called with:', patientSummary);
    const prompt = 'Please provide a concise summary of the following patient case in HTML format, suitable for a busy GP to quickly reference';
    const response = await makeAPIRequest(prompt, patientSummary);
    console.log('Consult Assist response:', response);
    setConsultAssistResults({ response });
  }, [makeAPIRequest]);

  const handleDifferentialDiagnosis = useCallback(async (patientSummary: string) => {
    console.log('handleDifferentialDiagnosis called with:', patientSummary);
    const prompt = 'Please provide a concise list of possible differential diagnoses for the following patient case in HTML format, suitable for a busy GP to quickly reference';
    const response = await makeAPIRequest(prompt, patientSummary);
    console.log('Differential Diagnosis response:', response);
    setDifferentialDiagnosisResults({ response });
  }, [makeAPIRequest]);

  return {
    consultAssistResults,
    differentialDiagnosisResults,
    handleConsultAssist,
    handleDifferentialDiagnosis,
    isLoading,
    error,
    makeAPIRequest, // Make sure this is returned
  };
}
