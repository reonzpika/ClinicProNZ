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
    const prompt = `Identify and list concise, key considerations for this patient case that are crucial for narrowing down the differential diagnosis. Highlight any missing clinical details or characteristics that could differentiate between potential diagnoses. Include reminders about common pitfalls and misconceptions related to the symptoms. Consider how the patient's medical history or lifestyle might impact the differential diagnosis, if such information is available. Highlight any urgent considerations or red flags that should prompt immediate action or referral. Present each consideration clearly on a new line.`;
    const response = await makeAPIRequest(prompt, patientSummary);
    setConsultAssistResults({ response });
  }, [makeAPIRequest]);

  const handleDifferentialDiagnosis = useCallback(async (patientSummary: string) => {
    const prompt = 'List potential differential diagnoses for the patient summary described below. Please be concise. If the patient summary is not sufficient to identify narrow differential diagnoses , please respond with "Please use "Consult Assist" to gather more information." at the end of your response.';
    const response = await makeAPIRequest(prompt, patientSummary);
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
