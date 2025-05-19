import { recoverSession } from '../auth/clerk';

export type ErrorType = 'network' | 'api' | 'session' | 'template' | 'unknown';

export type ErrorRecoveryOptions = {
  maxRetries?: number;
  retryDelay?: number;
};

export class ErrorRecoveryService {
  private static instance: ErrorRecoveryService;
  private retryCount: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService();
    }
    return ErrorRecoveryService.instance;
  }

  public async handleError(
    error: Error,
    type: ErrorType,
    options: ErrorRecoveryOptions = {},
  ): Promise<boolean> {
    const { maxRetries = 3, retryDelay = 1000 } = options;
    const errorKey = `${type}-${error.message}`;

    try {
      switch (type) {
        case 'network':
          return await this.handleNetworkError(error, errorKey, maxRetries, retryDelay);
        case 'api':
          return await this.handleApiError(error);
        case 'session':
          return await this.handleSessionError();
        case 'template':
          return await this.handleTemplateError();
        default:
          console.error('Unknown error type:', error);
          return false;
      }
    } catch (recoveryError) {
      console.error('Error recovery failed:', recoveryError);
      return false;
    }
  }

  private async handleNetworkError(
    error: Error,
    errorKey: string,
    maxRetries: number,
    retryDelay: number,
  ): Promise<boolean> {
    console.error('Network Error:', error);
    const currentRetries = this.retryCount.get(errorKey) || 0;

    if (currentRetries < maxRetries) {
      this.retryCount.set(errorKey, currentRetries + 1);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return true; // Retry the operation
    }

    this.retryCount.delete(errorKey);
    return false; // Max retries reached
  }

  private async handleApiError(error: Error): Promise<boolean> {
    // Log the error for monitoring
    console.error('API Error:', error);

    // In a real implementation, this would notify the user
    // and potentially queue the failed operation
    return false;
  }

  private async handleSessionError(): Promise<boolean> {
    const recoveredState = await recoverSession(new Request(''));
    if (recoveredState) {
      // Restore the recovered state
      localStorage.setItem('consultationState', JSON.stringify(recoveredState));
      return true;
    }
    return false;
  }

  private async handleTemplateError(): Promise<boolean> {
    try {
      // TODO: Implement template error recovery logic if needed
      // const lastTemplateId = await TemplateService.getLastUsedTemplate();
      // if (lastTemplateId) {
      //   await TemplateService.persistTemplateSelection(lastTemplateId);
      //   return true;
      // }
      return false;
    } catch (error) {
      console.error('Template error recovery failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const errorRecoveryService = ErrorRecoveryService.getInstance();
