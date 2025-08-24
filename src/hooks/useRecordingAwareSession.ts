import { createContext, useContext } from 'react';

// Context to provide recording-aware session switching
export const RecordingAwareSessionContext = createContext<{
  switchToPatientSession: (sessionId: string, onSwitch?: (sessionId: string, patientName: string) => void) => Promise<void>;
} | null>(null);

export const useRecordingAwareSession = () => {
  const context = useContext(RecordingAwareSessionContext);
  if (!context) {
    throw new Error('useRecordingAwareSession must be used within RecordingAwareSessionProvider');
  }
  return context;
};
