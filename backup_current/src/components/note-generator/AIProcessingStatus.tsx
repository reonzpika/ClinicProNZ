import { AlertCircle, CheckCircle2, Loader2, RefreshCw, StopCircle } from 'lucide-react';
import type { FC } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { ProcessingStatus } from '@/hooks/useAIProcessing';
import { cn } from '@/utils/ui';

type AIProcessingStatusProps = {
  status: ProcessingStatus;
  progress: number;
  currentStep?: string;
  error?: {
    message: string;
    retryable: boolean;
  };
  onCancel?: () => void;
  onRetry?: () => void;
  canRetry?: boolean;
  className?: string;
};

export const AIProcessingStatus: FC<AIProcessingStatusProps> = ({
  status,
  progress,
  currentStep,
  error,
  onCancel,
  onRetry,
  canRetry,
  className,
}) => {
  const isProcessing = status === 'processing' || status === 'preparing';
  const showProgress = isProcessing || status === 'success';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Indicator */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {isProcessing && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle2 className="size-4 text-green-500" />
              )}
              <span>
                {isProcessing ? currentStep : 'Processing complete'}
              </span>
            </div>
            <span>
              {Math.round(progress)}
              %
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Error State */}
      {status === 'error' && error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Processing Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{error.message}</p>
            {canRetry && (
              <p className="mt-2 text-sm">
                You can try processing again.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {isProcessing && onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="gap-2"
          >
            <StopCircle className="size-4" />
            Cancel
          </Button>
        )}
        {status === 'error' && canRetry && onRetry && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            Retry
          </Button>
        )}
      </div>

      {/* Success State */}
      {status === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="size-4 text-green-500" />
          <AlertTitle className="text-green-800">
            Processing Complete
          </AlertTitle>
          <AlertDescription className="text-green-700">
            The note has been generated successfully.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
