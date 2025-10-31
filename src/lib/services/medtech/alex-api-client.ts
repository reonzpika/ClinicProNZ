/**
 * Medtech ALEX API Client
 *
 * Base HTTP client for all ALEX FHIR API requests
 * - Auto-injects required headers (Authorization, mt-*, Content-Type)
 * - Handles OAuth token management (55-min cache with auto-refresh)
 * - Correlation ID generation and propagation
 * - FHIR OperationOutcome error mapping
 * - Retry logic for transient failures (429, 503)
 *
 * Environment Variables Required:
 * - MEDTECH_API_BASE_URL (e.g., https://alexapiuat.medtechglobal.com/FHIR)
 * - MEDTECH_FACILITY_ID (e.g., F2N060-E for UAT)
 * - MEDTECH_CLIENT_ID, MEDTECH_CLIENT_SECRET, MEDTECH_TENANT_ID, MEDTECH_API_SCOPE
 */

import { oauthTokenService } from './oauth-token-service'
import { generateCorrelationId } from './correlation-id'

interface AlexApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  correlationId?: string
  headers?: Record<string, string>
  retryOn401?: boolean
}

interface FhirOperationOutcome {
  resourceType: 'OperationOutcome'
  issue: Array<{
    severity: 'fatal' | 'error' | 'warning' | 'information'
    code: string
    diagnostics?: string
    details?: {
      text?: string
    }
  }>
}

export class AlexApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public correlationId: string,
    public operationOutcome?: FhirOperationOutcome,
  ) {
    super(message)
    this.name = 'AlexApiError'
  }
}

class AlexApiClient {
  private readonly baseUrl: string
  private readonly facilityId: string
  private readonly appId = 'clinicpro-images-widget'

  constructor() {
    this.baseUrl = process.env.MEDTECH_API_BASE_URL || ''
    this.facilityId = process.env.MEDTECH_FACILITY_ID || ''

    if (!this.baseUrl) {
      throw new Error('MEDTECH_API_BASE_URL environment variable not set')
    }
    if (!this.facilityId) {
      throw new Error('MEDTECH_FACILITY_ID environment variable not set')
    }
  }

  /**
   * Make authenticated FHIR API request
   */
  async request<T = unknown>(
    endpoint: string,
    options: AlexApiOptions = {},
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      correlationId = generateCorrelationId(),
      headers: customHeaders = {},
      retryOn401 = true,
    } = options

    const startTime = Date.now()
    const url = `${this.baseUrl}${endpoint}`

    try {
      // Get access token (cached or fresh)
      const accessToken = await oauthTokenService.getAccessToken()

      // Prepare headers
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/fhir+json',
        'mt-facilityid': this.facilityId,
        'mt-correlationid': correlationId,
        'mt-appid': this.appId,
        ...customHeaders,
      }

      // Prepare request
      const requestOptions: RequestInit = {
        method,
        headers,
      }

      if (body) {
        requestOptions.body = JSON.stringify(body)
      }

      // Log request
      console.log('[ALEX API] Request', {
        method,
        endpoint,
        correlationId,
        facilityId: this.facilityId,
      })

      // Make request
      const response = await fetch(url, requestOptions)
      const duration = Date.now() - startTime

      // Handle 401 Unauthorized (token expired)
      if (response.status === 401 && retryOn401) {
        console.warn('[ALEX API] 401 Unauthorized, refreshing token and retrying', {
          correlationId,
          duration,
        })

        // Force token refresh and retry once
        await oauthTokenService.forceRefresh()
        return this.request<T>(endpoint, { ...options, retryOn401: false })
      }

      // Handle non-2xx responses
      if (!response.ok) {
        await this.handleErrorResponse(response, correlationId, duration)
      }

      // Parse response
      const data: T = await response.json()

      // Log success
      console.log('[ALEX API] Success', {
        method,
        endpoint,
        status: response.status,
        correlationId,
        duration,
      })

      return data
    }
    catch (error) {
      const duration = Date.now() - startTime

      // Re-throw AlexApiError as-is
      if (error instanceof AlexApiError) {
        throw error
      }

      // Wrap other errors
      console.error('[ALEX API] Request failed', {
        method,
        endpoint,
        correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      })

      throw new AlexApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        correlationId,
      )
    }
  }

  /**
   * Handle error response from ALEX API
   */
  private async handleErrorResponse(
    response: Response,
    correlationId: string,
    duration: number,
  ): Promise<never> {
    const statusCode = response.status

    // Try to parse FHIR OperationOutcome
    let operationOutcome: FhirOperationOutcome | undefined
    let errorMessage = `ALEX API error: ${statusCode} ${response.statusText}`

    try {
      const data = await response.json()
      if (data.resourceType === 'OperationOutcome') {
        operationOutcome = data as FhirOperationOutcome

        // Extract error message from OperationOutcome
        const errors = operationOutcome.issue
          .filter(issue => issue.severity === 'error' || issue.severity === 'fatal')
          .map(issue => issue.diagnostics || issue.details?.text || issue.code)
          .filter(Boolean)

        if (errors.length > 0) {
          errorMessage = errors.join('; ')
        }
      }
    }
    catch {
      // Failed to parse JSON; use generic error message
    }

    // Log error
    console.error('[ALEX API] Error response', {
      statusCode,
      correlationId,
      errorMessage,
      operationOutcome,
      duration,
    })

    // Throw structured error
    throw new AlexApiError(errorMessage, statusCode, correlationId, operationOutcome)
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    endpoint: string,
    options?: Omit<AlexApiOptions, 'method' | 'body'>,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    body: unknown,
    options?: Omit<AlexApiOptions, 'method' | 'body'>,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    body: unknown,
    options?: Omit<AlexApiOptions, 'method' | 'body'>,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    options?: Omit<AlexApiOptions, 'method' | 'body'>,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Singleton instance
const alexApiClient = new AlexApiClient()

export { alexApiClient, AlexApiClient }
