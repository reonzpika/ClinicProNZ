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
    console.log('makeAPIRequest called with prompt:', prompt);
    console.log('Patient summary:', patientSummary);
    setIsLoading(true);
    setError(null);
    try {
      const API_KEY = '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';
      const API_ENDPOINT = process.env.NEXT_PUBLIC_GPT_API_ENDPOINT;
      if (!API_ENDPOINT) {
        throw new Error('GPT API endpoint is not set');
      }
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that provides medical consultation suggestions.',
            },
            {
              role: 'user',
              content: `${prompt}: ${patientSummary}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI assistance: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      return data.choices[0].message.content;
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
  };
}
