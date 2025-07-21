import { AlertCircle, CheckCircle, Clock, Loader2, Radio } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/src/shared/components/ui/button';

import type { HealthCheckIssue, RecordingHealthStatus } from '../hooks/useRecordingHealthCheck';

type RecordingStatusIndicatorProps = {
  status: RecordingHealthStatus;
  issues: HealthCheckIssue[];
  isRunningHealthCheck: boolean;
  lastSync: number | null;
  transcriptionRate: number;
  canStartRecording: boolean;
  onClick: () => void; // For showing detailed popup
  onShowMobileSetup?: () => void;
};

export const RecordingStatusIndicator: React.FC<RecordingStatusIndicatorProps> = ({
  status,
  issues,
  isRunningHealthCheck,
  lastSync,
  transcriptionRate,
  canStartRecording: _canStartRecording, // Unused but kept for interface consistency
  onClick,
  onShowMobileSetup: _onShowMobileSetup, // Unused but kept for interface consistency
}) => {
  const getStatusConfig = useCallback(() => {
    switch (status) {
      case 'setup-required':
        return {
          icon: AlertCircle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 hover:bg-amber-100',
          borderColor: 'border-amber-200',
          title: 'Setup Required',
          description: 'Click to see what needs to be configured',
        };
      case 'testing':
        return {
          icon: Loader2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 hover:bg-blue-100',
          borderColor: 'border-blue-200',
          title: 'Testing System',
          description: 'Validating recording components...',
        };
      case 'ready':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50 hover:bg-green-100',
          borderColor: 'border-green-200',
          title: 'Ready to Record',
          description: 'All systems operational',
        };
      case 'recording':
        return {
          icon: Radio,
          color: 'text-red-600',
          bgColor: 'bg-red-50 hover:bg-red-100',
          borderColor: 'border-red-200',
          title: 'Recording Active',
          description: `Live recording • ${transcriptionRate} wpm`,
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 hover:bg-red-100',
          borderColor: 'border-red-200',
          title: 'Issues Detected',
          description: 'Click to see issues and solutions',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 hover:bg-gray-100',
          borderColor: 'border-gray-200',
          title: 'Unknown Status',
          description: 'Click for details',
        };
    }
  }, [status, transcriptionRate]);

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatLastSync = useCallback(() => {
    if (!lastSync) {
      return 'Never';
    }
    const secondsAgo = Math.floor((Date.now() - lastSync) / 1000);
    if (secondsAgo < 60) {
      return `${secondsAgo}s ago`;
    }
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m ago`;
  }, [lastSync]);

  const getTooltipText = () => {
    if (status === 'recording') {
      return `${config.title} • Last sync: ${formatLastSync()} • Rate: ${transcriptionRate} wpm`;
    }

    if (issues.length > 0) {
      const issueCount = issues.length === 1 ? '1 issue found' : `${issues.length} issues found`;
      return `${config.title} • ${issueCount} • Click for details`;
    }

    return `${config.title} • ${config.description}`;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={getTooltipText()} // Simple title tooltip
      className={`
        flex h-auto items-center gap-2 px-3 py-2
        ${config.bgColor} ${config.borderColor} ${config.color}
        border transition-all duration-200
        ${isRunningHealthCheck ? 'animate-pulse' : ''}
      `}
    >
      <Icon
        className={`size-4 ${isRunningHealthCheck && status === 'testing' ? 'animate-spin' : ''}`}
      />
      <span className="text-sm font-medium">
        {status === 'setup-required' && 'Setup Required'}
        {status === 'testing' && 'Testing...'}
        {status === 'ready' && 'Ready'}
        {status === 'recording' && 'Recording'}
        {status === 'error' && 'Issues'}
      </span>
    </Button>
  );
};
 