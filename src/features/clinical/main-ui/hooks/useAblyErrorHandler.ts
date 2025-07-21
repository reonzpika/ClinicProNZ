import { useCallback } from 'react';

// Ably error codes that should be handled gracefully
const EXPECTED_ABLY_ERRORS = {
  ATTACH_SUPERSEDED: /attach.*superseded.*detach/i,
  CONNECTION_CLOSED: /connection.*closed/i,
  TOKEN_EXPIRED: /token.*expired/i,
  NOT_CONFIGURED: /ably.*not.*configured/i,
  CONNECTION_FAILED: /connection.*failed/i,
  CHANNEL_DETACHED: /channel.*detached/i,
  AUTH_FAILED: /auth.*failed/i,
} as const;

// Error codes from Ably that we want to handle specifically
const ABLY_ERROR_CODES = {
  TOKEN_ERROR: 40140,
  CONNECTION_FAILED: 80003,
  CONNECTION_SUSPENDED: 80002,
  ATTACH_FAILED: 90001,
  DETACH_FAILED: 90002,
  PRESENCE_FAILED: 91000,
} as const;

export interface AblyErrorInfo {
  code?: number;
  message: string;
  statusCode?: number;
  cause?: any;
  isRetryable: boolean;
  category: 'connection' | 'channel' | 'auth' | 'presence' | 'unknown';
  action: 'retry' | 'reconnect' | 'ignore' | 'alert';
}

/**
 * Hook for handling Ably-related errors with smart categorization and actions
 */
export function useAblyErrorHandler() {
  const categorizeError = useCallback((error: any): AblyErrorInfo => {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorCode = error?.code || error?.statusCode;

    let category: AblyErrorInfo['category'] = 'unknown';
    let action: AblyErrorInfo['action'] = 'alert';
    let isRetryable = false;

    // Check for specific error patterns
    if (EXPECTED_ABLY_ERRORS.ATTACH_SUPERSEDED.test(errorMessage)) {
      category = 'channel';
      action = 'ignore'; // This is expected during rapid state changes
      isRetryable = false;
    } else if (EXPECTED_ABLY_ERRORS.CONNECTION_CLOSED.test(errorMessage)) {
      category = 'connection';
      action = 'ignore'; // Often expected during cleanup
      isRetryable = false;
    } else if (EXPECTED_ABLY_ERRORS.NOT_CONFIGURED.test(errorMessage)) {
      category = 'auth';
      action = 'ignore'; // Expected in some deployments
      isRetryable = false;
    } else if (EXPECTED_ABLY_ERRORS.TOKEN_EXPIRED.test(errorMessage)) {
      category = 'auth';
      action = 'retry';
      isRetryable = true;
    } else if (EXPECTED_ABLY_ERRORS.CONNECTION_FAILED.test(errorMessage)) {
      category = 'connection';
      action = 'reconnect';
      isRetryable = true;
    } else if (EXPECTED_ABLY_ERRORS.CHANNEL_DETACHED.test(errorMessage)) {
      category = 'channel';
      action = 'retry';
      isRetryable = true;
    } else if (EXPECTED_ABLY_ERRORS.AUTH_FAILED.test(errorMessage)) {
      category = 'auth';
      action = 'retry';
      isRetryable = true;
    }

    // Check specific error codes
    switch (errorCode) {
      case ABLY_ERROR_CODES.TOKEN_ERROR:
        category = 'auth';
        action = 'retry';
        isRetryable = true;
        break;
      case ABLY_ERROR_CODES.CONNECTION_FAILED:
      case ABLY_ERROR_CODES.CONNECTION_SUSPENDED:
        category = 'connection';
        action = 'reconnect';
        isRetryable = true;
        break;
      case ABLY_ERROR_CODES.ATTACH_FAILED:
      case ABLY_ERROR_CODES.DETACH_FAILED:
        category = 'channel';
        action = 'retry';
        isRetryable = true;
        break;
      case ABLY_ERROR_CODES.PRESENCE_FAILED:
        category = 'presence';
        action = 'retry';
        isRetryable = true;
        break;
    }

    return {
      code: errorCode,
      message: errorMessage,
      statusCode: error?.statusCode,
      cause: error,
      isRetryable,
      category,
      action,
    };
  }, []);

  const handleError = useCallback((
    error: any,
    context: string,
    onRetry?: () => void,
    onReconnect?: () => void,
    onAlert?: (errorInfo: AblyErrorInfo) => void
  ) => {
    const errorInfo = categorizeError(error);

    // Log the error with context for debugging
    if (errorInfo.action === 'ignore') {
      console.debug(`[Ably/${context}] Expected error (ignored):`, errorInfo.message);
    } else {
      console.warn(`[Ably/${context}] Error:`, {
        message: errorInfo.message,
        code: errorInfo.code,
        category: errorInfo.category,
        action: errorInfo.action,
        isRetryable: errorInfo.isRetryable,
      });
    }

    // Take appropriate action based on error type
    switch (errorInfo.action) {
      case 'retry':
        if (onRetry) {
          console.debug(`[Ably/${context}] Attempting retry...`);
          onRetry();
        }
        break;
      case 'reconnect':
        if (onReconnect) {
          console.debug(`[Ably/${context}] Attempting reconnection...`);
          onReconnect();
        }
        break;
      case 'alert':
        if (onAlert) {
          console.error(`[Ably/${context}] Critical error:`, errorInfo);
          onAlert(errorInfo);
        }
        break;
      case 'ignore':
        // Do nothing - this is expected
        break;
    }

    return errorInfo;
  }, [categorizeError]);

  const isExpectedError = useCallback((error: any): boolean => {
    const errorMessage = error?.message || error?.toString() || '';
    
    return Object.values(EXPECTED_ABLY_ERRORS).some(pattern => 
      pattern.test(errorMessage)
    );
  }, []);

  const shouldRetry = useCallback((error: any): boolean => {
    const errorInfo = categorizeError(error);
    return errorInfo.isRetryable;
  }, [categorizeError]);

  return {
    handleError,
    categorizeError,
    isExpectedError,
    shouldRetry,
  };
}