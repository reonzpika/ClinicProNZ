/**
 * Medtech ALEX OAuth Token Service
 *
 * Manages OAuth 2.0 client credentials flow with Azure AD
 * - Token caching with 55-minute TTL (refreshes before 60-min expiry)
 * - Thread-safe for concurrent requests
 * - Automatic retry on 401 errors
 *
 * Environment Variables Required:
 * - MEDTECH_CLIENT_ID
 * - MEDTECH_CLIENT_SECRET
 * - MEDTECH_TENANT_ID
 * - MEDTECH_API_SCOPE
 */

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

class OAuthTokenService {
  private cachedToken: CachedToken | null = null;
  private tokenRefreshPromise: Promise<string> | null = null;

  // Token cache TTL: 55 minutes (refresh before 60-min expiry)
  private readonly TOKEN_CACHE_TTL_MS = 55 * 60 * 1000;

  private readonly AZURE_AD_TOKEN_ENDPOINT = `https://login.microsoftonline.com/${process.env.MEDTECH_TENANT_ID}/oauth2/v2.0/token`;

  /**
   * Get valid access token (cached or fresh)
   * Thread-safe: concurrent requests will share the same refresh promise
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.accessToken;
    }

    // If refresh already in progress, wait for it
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    // Start new refresh
    this.tokenRefreshPromise = this.refreshToken();

    try {
      const token = await this.tokenRefreshPromise;
      return token;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  /**
   * Force token refresh (clears cache and acquires new token)
   * Use when 401 Unauthorized received
   */
  async forceRefresh(): Promise<string> {
    this.cachedToken = null;
    this.tokenRefreshPromise = null;
    return this.getAccessToken();
  }

  /**
   * Clear cached token (useful for testing or manual invalidation)
   */
  clearCache(): void {
    this.cachedToken = null;
    this.tokenRefreshPromise = null;
  }

  /**
   * Acquire new token from Azure AD
   */
  private async refreshToken(): Promise<string> {
    const startTime = Date.now();

    try {
      // Validate required environment variables
      this.validateEnvironment();

      // Prepare OAuth request
      const params = new URLSearchParams({
        client_id: process.env.MEDTECH_CLIENT_ID!,
        client_secret: process.env.MEDTECH_CLIENT_SECRET!,
        grant_type: 'client_credentials',
        scope: process.env.MEDTECH_API_SCOPE!,
      });

      // Request token from Azure AD
      const response = await fetch(this.AZURE_AD_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OAuth token acquisition failed: ${response.status} ${response.statusText}. ${errorText}`,
        );
      }

      const data: TokenResponse = await response.json();

      // Cache token with 55-minute expiry
      const expiresAt = Date.now() + this.TOKEN_CACHE_TTL_MS;
      this.cachedToken = {
        accessToken: data.access_token,
        expiresAt,
      };

      const duration = Date.now() - startTime;

      // Log token acquisition (first 10 chars only for security)
      console.log('[Medtech OAuth] Token acquired', {
        tokenPrefix: data.access_token.substring(0, 10),
        expiresIn: data.expires_in,
        cacheTTL: this.TOKEN_CACHE_TTL_MS / 1000,
        duration,
      });

      return data.access_token;
    } catch (error) {
      console.error('[Medtech OAuth] Token acquisition failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }

  /**
   * Validate required environment variables
   */
  private validateEnvironment(): void {
    const required = [
      'MEDTECH_CLIENT_ID',
      'MEDTECH_CLIENT_SECRET',
      'MEDTECH_TENANT_ID',
      'MEDTECH_API_SCOPE',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`,
      );
    }
  }

  /**
   * Get token info (for debugging/monitoring)
   */
  getTokenInfo(): {
    isCached: boolean;
    expiresIn?: number;
    expiresAt?: number;
  } {
    if (!this.cachedToken) {
      return { isCached: false };
    }

    const expiresIn = Math.max(0, this.cachedToken.expiresAt - Date.now());

    return {
      isCached: true,
      expiresIn,
      expiresAt: this.cachedToken.expiresAt,
    };
  }
}

// Singleton instance
const oauthTokenService = new OAuthTokenService();

export { OAuthTokenService, oauthTokenService };
