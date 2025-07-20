import { AlertCircle, CheckCircle, Clock, Loader2, Radio, RefreshCw } from 'lucide-react';
import { useCallback } from 'react';

import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';

import type { HealthCheckIssue, RecordingHealthStatus } from '../hooks/useRecordingHealthCheck';

type RecordingStatusWidgetProps = {
  status: RecordingHealthStatus;
  issues: HealthCheckIssue[];
  isRunningHealthCheck: boolean;
  lastSync: number | null;
  transcriptionRate: number;
  canStartRecording: boolean;
  onRunHealthCheck: () => Promise<boolean>;
  onShowMobileSetup?: () => void;
};

export const RecordingStatusWidget: React.FC<RecordingStatusWidgetProps> = ({
  status,
  issues,
  isRunningHealthCheck,
  lastSync,
  transcriptionRate,
  canStartRecording,
  onRunHealthCheck,
  onShowMobileSetup,
}) => {
  const getStatusConfig = useCallback(() => {
    switch (status) {
      case 'setup-required':
        return {
          icon: AlertCircle,
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          title: 'Setup Required',
          description: 'Complete setup to start recording',
        };
      case 'testing':
        return {
          icon: Loader2,
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500',
          title: 'Testing System',
          description: 'Validating recording pipeline...',
        };
      case 'ready':
        return {
          icon: CheckCircle,
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-500',
          title: 'Ready to Record',
          description: 'All systems validated',
        };
      case 'recording':
        return {
          icon: Radio,
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500',
          title: 'Recording Active',
          description: 'Live recording in progress',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'orange',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          iconColor: 'text-orange-500',
          title: 'Issues Detected',
          description: 'Some issues found',
        };
      default:
        return {
          icon: Clock,
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-500',
          title: 'Unknown Status',
          description: 'Status unclear',
        };
    }
  }, [status]);

  const formatLastSync = useCallback(() => {
    if (!lastSync) {
      return null;
    }
    const secondsAgo = Math.round((Date.now() - lastSync) / 1000);
    if (secondsAgo < 5) {
      return 'just now';
    }
    if (secondsAgo < 60) {
      return `${secondsAgo}s ago`;
    }
    return `${Math.round(secondsAgo / 60)}m ago`;
  }, [lastSync]);

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <Alert variant="default" className={`${config.bgColor} ${config.borderColor} p-3 text-xs`}>
      <div className="space-y-2">
        {/* Main Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon
              className={`size-4 ${config.iconColor} ${status === 'testing' || status === 'recording' ? 'animate-pulse' : ''}`}
            />
            <div>
              <div className={`font-medium ${config.textColor}`}>
                {config.title}
              </div>
              <div className={`text-xs ${config.textColor.replace('800', '600')}`}>
                {config.description}
              </div>
            </div>
          </div>

          {/* Health Check Button */}
          {status !== 'recording' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRunHealthCheck}
              disabled={isRunningHealthCheck}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className={`size-3 ${isRunningHealthCheck ? 'animate-spin' : ''}`} />
              {isRunningHealthCheck ? 'Testing...' : 'Test'}
            </Button>
          )}
        </div>

        {/* Live Recording Stats */}
        {status === 'recording' && (
          <div className="flex items-center gap-4 text-xs">
            {lastSync && (
              <div className="flex items-center gap-1">
                <div className="size-2 animate-pulse rounded-full bg-green-500" />
                <span>
                  Sync:
                  {formatLastSync()}
                </span>
              </div>
            )}
            {transcriptionRate > 0 && (
              <div className="flex items-center gap-1">
                <span>
                  Rate:
                  {transcriptionRate}
                  {' '}
                  wpm
                </span>
              </div>
            )}
          </div>
        )}

        {/* Issues List */}
        {issues.length > 0 && (
          <div className="space-y-1">
            {issues.map((issue, index) => (
              <div key={`${issue.type}-${issue.message}-${index}`} className="space-y-1">
                <div className="flex items-start justify-between">
                  <span className={`text-xs ${config.textColor.replace('800', '700')}`}>
                    •
                    {' '}
                    {issue.message}
                  </span>
                </div>
                {issue.actionable && issue.action && (
                  <div className="ml-2">
                    {issue.type === 'mobile-disconnected' && onShowMobileSetup
                      ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onShowMobileSetup}
                            className="h-6 px-2 text-xs"
                          >
                            {issue.action}
                          </Button>
                        )
                      : (
                          <span className={`text-xs italic ${config.textColor.replace('800', '600')}`}>
                            →
                            {' '}
                            {issue.action}
                          </span>
                        )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ready State Additional Info */}
        {status === 'ready' && canStartRecording && (
          <div className="text-xs text-green-600">
            ✓ Ready to start recording
          </div>
        )}

        {/* Setup Required Call to Action */}
        {status === 'setup-required' && (
          <div className="flex gap-2 pt-1">
            {onShowMobileSetup && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onShowMobileSetup}
                className="h-6 px-2 text-xs"
              >
                Set up Mobile Recording
              </Button>
            )}
          </div>
        )}
      </div>
    </Alert>
  );
};
