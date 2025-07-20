import { AlertCircle, CheckCircle, Clock, Loader2, Radio, RefreshCw, Settings } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';

import type { HealthCheckIssue, RecordingHealthStatus } from '../hooks/useRecordingHealthCheck';

type RecordingStatusModalProps = {
  isOpen: boolean;
  onClose: () => void;
  status: RecordingHealthStatus;
  issues: HealthCheckIssue[];
  isRunningHealthCheck: boolean;
  lastSync: number | null;
  transcriptionRate: number;
  canStartRecording: boolean;
  onRunHealthCheck: () => Promise<boolean>;
  onShowMobileSetup?: () => void;
  apiCacheStatus?: {
    lastChecked: number | null;
    isAvailable: boolean;
    cacheFor: number;
  };
};

export const RecordingStatusModal: React.FC<RecordingStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  issues,
  isRunningHealthCheck,
  lastSync,
  transcriptionRate,
  canStartRecording: _canStartRecording, // Unused but kept for interface consistency
  onRunHealthCheck,
  onShowMobileSetup,
  apiCacheStatus,
}) => {
  const getStatusConfig = useCallback(() => {
    switch (status) {
      case 'setup-required':
        return {
          icon: AlertCircle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          title: 'Setup Required',
          description: 'Complete the setup steps below to start recording',
        };
      case 'testing':
        return {
          icon: Loader2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'System Testing',
          description: 'Validating all recording components...',
        };
      case 'ready':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Ready to Record',
          description: 'All systems operational and ready for recording',
        };
      case 'recording':
        return {
          icon: Radio,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Recording Active',
          description: 'Live recording session with real-time monitoring',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Issues Detected',
          description: 'Some issues need attention before recording',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Unknown Status',
          description: 'Status information unavailable',
        };
    }
  }, [status]);

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatLastSync = useCallback(() => {
    if (!lastSync) {
      return 'Never';
    }
    const secondsAgo = Math.floor((Date.now() - lastSync) / 1000);
    if (secondsAgo < 60) {
      return `${secondsAgo} seconds ago`;
    }
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) {
      return `${minutesAgo} minutes ago`;
    }
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo} hours ago`;
  }, [lastSync]);

  const formatApiCache = useCallback(() => {
    if (!apiCacheStatus?.lastChecked) {
      return 'Not checked';
    }
    const age = Math.floor((Date.now() - apiCacheStatus.lastChecked) / 1000);
    const remaining = Math.floor((apiCacheStatus.cacheFor - (Date.now() - apiCacheStatus.lastChecked)) / 1000);
    return `Checked ${age}s ago, expires in ${remaining}s`;
  }, [apiCacheStatus]);

  const handleRunHealthCheck = async () => {
    await onRunHealthCheck();
  };

  const handleSetupMobile = () => {
    onClose();
    onShowMobileSetup?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`size-5 ${config.color}`} />
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Description */}
          <div className={`rounded-lg p-3 ${config.bgColor} ${config.borderColor} border`}>
            <p className="text-sm text-gray-700">{config.description}</p>
          </div>

          {/* Live Stats (during recording) */}
          {status === 'recording' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs uppercase tracking-wide text-gray-500">Last Sync</div>
                <div className="text-sm font-medium">{formatLastSync()}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs uppercase tracking-wide text-gray-500">Transcription Rate</div>
                <div className="text-sm font-medium">
                  {transcriptionRate}
                  {' '}
                  words/min
                </div>
              </div>
            </div>
          )}

          {/* Issues List */}
          {issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">
                Issues Found (
                {issues.length}
                )
              </h4>
              <div className="space-y-2">
                {issues.map(issue => (
                  <div
                    key={`${issue.type}-${issue.message.slice(0, 30).replace(/\s+/g, '-')}`} // Use type + message hash for uniqueness
                    className="rounded-lg border border-red-200 bg-red-50 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-red-800">
                          {issue.message}
                        </div>
                        {issue.actionable && issue.action && (
                          <div className="mt-1 text-xs text-red-600">
                            💡
                            {' '}
                            {issue.action}
                          </div>
                        )}
                      </div>
                      <div className="ml-2 text-xs text-red-500">
                        {issue.type.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {status === 'ready' && issues.length === 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                <span className="text-sm text-green-800">
                  All systems are operational and ready for recording
                </span>
              </div>
            </div>
          )}

          {/* Debug Information (development) */}
          {process.env.NODE_ENV === 'development' && apiCacheStatus && (
            <div className="rounded-lg border-l-4 border-gray-400 bg-gray-50 p-3">
              <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                Debug Info
              </div>
              <div className="space-y-1 text-xs text-gray-700">
                <div>
                  API Cache:
                  {formatApiCache()}
                </div>
                <div>
                  Available:
                  {apiCacheStatus.isAvailable ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            {status === 'setup-required' && onShowMobileSetup && (
              <Button
                onClick={handleSetupMobile}
                className="w-full"
              >
                <Settings className="mr-2 size-4" />
                Set up Mobile Recording
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleRunHealthCheck}
              disabled={isRunningHealthCheck}
              className="w-full"
            >
              {isRunningHealthCheck
                ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Testing System...
                    </>
                  )
                : (
                    <>
                      <RefreshCw className="mr-2 size-4" />
                      Run Health Check
                    </>
                  )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
