import { useCallback, useState } from 'react';

type ConsultAssistResults = {
  history: string[];
  examination: string[];
};

export function useConsultAssist() {
  console.log('API Key:', process.env.NEXT_PUBLIC_GPT_API_KEY);
  
  const [consultAssistResults, setConsultAssistResults] = useState<ConsultAssistResults>({
    history: [],
    examination: [],
  });

  const handleConsultAssist = useCallback(async (patientSummary: string) => {
    console.log('handleConsultAssist called with:', patientSummary);
    console.log('API Endpoint:', process.env.NEXT_PUBLIC_GPT_API_ENDPOINT);
    
    try {
      console.log('Attempting to fetch from API...');
      const API_KEY = process.env.NEXT_PUBLIC_GPT_API_KEY || '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';
      const response = await fetch(process.env.NEXT_PUBLIC_GPT_API_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",  // Specify the model here
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that provides medical consultation suggestions."
            },
            {
              role: "user",
              content: patientSummary
            }
          ]
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to get AI assistance: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);

      // Assuming the API returns the required format, adjust as necessary
      setConsultAssistResults({
        history: [data.choices[0].message.content],
        examination: [],  // You might need to parse the content to extract examination details
      });
    } catch (error) {
      console.error('Error in handleConsultAssist:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      // Handle error (e.g., show an error message to the user)
    }
  }, []);

  return { consultAssistResults, handleConsultAssist };
}
