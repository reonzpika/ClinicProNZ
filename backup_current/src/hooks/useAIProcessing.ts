import { useCallback, useRef, useState } from 'react';

import { toast } from '@/components/ui/use-toast';

export type ProcessingStatus = 'idle' | 'preparing' | 'processing' | 'cancelling' | 'error' | 'success';

type ProcessingError = {
  code: string;
  message: string;
  retryable: boolean;
};

type ProcessingProgress = {
  status: ProcessingStatus;
  progress: number;
  currentStep?: string;
  error?: ProcessingError;
  startTime?: Date;
  endTime?: Date;
};

type AIProcessingOptions = {
  onSuccess?: (result: any) => void;
  onError?: (error: ProcessingError) => void;
  onProgress?: (progress: ProcessingProgress) => void;
  maxRetries?: number;
};

export function useAIProcessing(options: AIProcessingOptions = {}) {
  const [processing, setProcessing] = useState<ProcessingProgress>({
    status: 'idle',
    progress: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = options.maxRetries ?? 3;

  const updateProgress = useCallback((update: Partial<ProcessingProgress>) => {
    setProcessing(prev => ({
      ...prev,
      ...update,
    }));
    options.onProgress?.({
      ...processing,
      ...update,
    });
  }, [options, processing]);

  const handleError = useCallback((error: ProcessingError) => {
    updateProgress({
      status: 'error',
      error,
      endTime: new Date(),
    });

    toast({
      title: 'Processing Error',
      description: error.message,
      variant: 'destructive',
    });

    options.onError?.(error);
  }, [options, updateProgress]);

  const cancel = useCallback(() => {
    if (processing.status !== 'processing' && processing.status !== 'preparing') {
      return;
    }

    updateProgress({ status: 'cancelling' });
    abortControllerRef.current?.abort();

    toast({
      title: 'Processing Cancelled',
      description: 'AI processing has been cancelled.',
    });
  }, [processing.status, updateProgress]);

  const startProcessing = useCallback(async () => {
    if (processing.status === 'processing') {
      return;
    }

    // Reset state for new processing
    abortControllerRef.current = new AbortController();
    retryCountRef.current = 0;

    updateProgress({
      status: 'preparing',
      progress: 0,
      error: undefined,
      startTime: new Date(),
      endTime: undefined,
    });

    try {
      // Simulated processing steps - replace with actual API calls
      const steps = [
        'Initializing AI model',
        'Processing template',
        'Generating content',
        'Applying formatting',
        'Finalizing output',
      ];

      for (let i = 0; i < steps.length; i++) {
        if (abortControllerRef.current.signal.aborted) {
          throw new Error('Processing cancelled');
        }

        updateProgress({
          status: 'processing',
          progress: (i + 1) / steps.length * 100,
          currentStep: steps[i],
        });

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Simulate successful completion
      const result = { success: true, data: 'Processing completed successfully' };

      updateProgress({
        status: 'success',
        progress: 100,
        endTime: new Date(),
      });

      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const processingError: ProcessingError = {
        code: 'PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        retryable: true,
      };

      handleError(processingError);
      throw error;
    }
  }, [processing.status, updateProgress, options, handleError]);

  const retry = useCallback(async () => {
    if (!processing.error?.retryable || retryCountRef.current >= maxRetries) {
      toast({
        title: 'Cannot Retry',
        description: retryCountRef.current >= maxRetries
          ? `Maximum retry attempts (${maxRetries}) reached`
          : 'This error cannot be retried',
        variant: 'destructive',
      });
      return;
    }

    retryCountRef.current += 1;
    updateProgress({
      status: 'preparing',
      progress: 0,
      error: undefined,
      startTime: new Date(),
      endTime: undefined,
    });

    try {
      await startProcessing();
    } catch {
      handleError({
        code: 'RETRY_FAILED',
        message: 'Failed to retry processing',
        retryable: retryCountRef.current < maxRetries,
      });
    }
  }, [processing.error?.retryable, maxRetries, updateProgress, handleError, startProcessing]);

  return {
    processing,
    startProcessing,
    cancel,
    retry,
    canRetry: processing.error?.retryable && retryCountRef.current < maxRetries,
  };
}
