/**
 * Medtech ALEX OAuth Token Service
 * Manages OAuth 2.0 client credentials with 55-minute cache
 */

class OAuthTokenService {
  constructor() {
    this.cachedToken = null
    this.tokenRefreshPromise = null
    this.TOKEN_CACHE_TTL_MS = 55 * 60 * 1000 // 55 minutes
  }

  async getAccessToken() {
    // Return cached token if still valid
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.accessToken
    }

    // If refresh already in progress, wait for it
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise
    }

    // Start new refresh
    this.tokenRefreshPromise = this.refreshToken()
    try {
      const token = await this.tokenRefreshPromise
      return token
    } finally {
      this.tokenRefreshPromise = null
    }
  }

  async forceRefresh() {
    this.cachedToken = null
    this.tokenRefreshPromise = null
    return this.getAccessToken()
  }

  async refreshToken() {
    const startTime = Date.now()
    const tenantId = process.env.MEDTECH_TENANT_ID
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`

    try {
      const params = new URLSearchParams({
        client_id: process.env.MEDTECH_CLIENT_ID,
        client_secret: process.env.MEDTECH_CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: process.env.MEDTECH_API_SCOPE,
      })

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OAuth failed: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      const expiresAt = Date.now() + this.TOKEN_CACHE_TTL_MS

      this.cachedToken = {
        accessToken: data.access_token,
        expiresAt,
      }

      console.log('[OAuth] Token acquired', {
        duration: Date.now() - startTime,
        expiresIn: data.expires_in,
      })

      return data.access_token
    } catch (error) {
      console.error('[OAuth] Failed', error.message)
      throw error
    }
  }

  getTokenInfo() {
    if (!this.cachedToken) {
      return { isCached: false }
    }
    return {
      isCached: true,
      expiresIn: Math.max(0, this.cachedToken.expiresAt - Date.now()),
      expiresAt: this.cachedToken.expiresAt,
    }
  }
}

module.exports = new OAuthTokenService()
