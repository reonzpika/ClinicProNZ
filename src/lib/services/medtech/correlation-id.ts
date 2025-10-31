/**
 * Correlation ID Generator for Medtech ALEX API
 *
 * Generates UUID v4 correlation IDs for request tracing
 * - Used in `mt-correlationid` header for all ALEX API calls
 * - Enables end-to-end request tracing across systems
 * - Included in logs and error responses
 */

import { randomUUID } from 'node:crypto'

/**
 * Generate new correlation ID (UUID v4)
 */
export function generateCorrelationId(): string {
  return randomUUID()
}

/**
 * Extract correlation ID from request headers
 * Supports multiple header formats: x-correlation-id, x-request-id, traceparent
 */
export function extractCorrelationId(headers: Headers): string | undefined {
  // Try common correlation ID headers
  const correlationId
    = headers.get('x-correlation-id')
    ?? headers.get('x-request-id')
    ?? headers.get('correlation-id')

  if (correlationId) {
    return correlationId
  }

  // Try W3C Trace Context (traceparent)
  const traceparent = headers.get('traceparent')
  if (traceparent) {
    // traceparent format: version-traceId-spanId-flags
    // Extract traceId (32 hex chars)
    const parts = traceparent.split('-')
    if (parts.length >= 2) {
      return parts[1]
    }
  }

  return undefined
}

/**
 * Get or generate correlation ID from request
 * Reuses existing correlation ID if present, otherwise generates new one
 */
export function getOrGenerateCorrelationId(headers: Headers): string {
  return extractCorrelationId(headers) ?? generateCorrelationId()
}
