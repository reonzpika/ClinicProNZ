'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ConsultTimerContextType = {
  isRunning: boolean;
  time: string;
  seconds: number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
};

const ConsultTimerContext = createContext<ConsultTimerContextType | null>(null);

export function useConsultTimer() {
  const context = useContext(ConsultTimerContext);
  if (!context) {
    throw new Error('useConsultTimer must be used within a ConsultTimerProvider');
  }
  return context;
}

export function useCreateConsultTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setSeconds(0);
    setIsRunning(false);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    isRunning,
    time: formatTime(seconds),
    seconds,
    startTimer,
    stopTimer,
    resetTimer,
  };
}

export { ConsultTimerContext };
