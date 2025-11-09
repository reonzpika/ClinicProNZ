/**
 * Medtech ALEX API Integration Services
 *
 * Main exports for Medtech integration
 */

export { AlexApiClient, alexApiClient, AlexApiError } from './alex-api-client';
export {
  extractCorrelationId,
  generateCorrelationId,
  getOrGenerateCorrelationId,
} from './correlation-id';
export { OAuthTokenService, oauthTokenService } from './oauth-token-service';
