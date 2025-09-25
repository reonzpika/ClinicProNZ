/**
 * Cost tracking service for recording API usage costs
 */

import { getDb } from 'database/client';

import { apiUsageCosts, type NewApiUsageCost } from '@/db/schema/api_usage_costs';

import type { ApiFunction, ApiProvider, CostBreakdown, UsageMetrics } from './costCalculator';
import { calculateApiCost } from './costCalculator';

export type TrackingContext = {
  userId: string | null;
  sessionId?: string;
};

/**
 * Track and store API usage cost
 */
export async function trackApiUsage(
  context: TrackingContext,
  provider: ApiProvider,
  apiFunction: ApiFunction,
  metrics: UsageMetrics,
): Promise<CostBreakdown> {
  try {
    // Calculate cost
    const costBreakdown = calculateApiCost(provider, apiFunction, metrics);

    // Prepare database record
    const record: NewApiUsageCost = {
      userId: context.userId,
      sessionId: context.sessionId || null,
      apiProvider: provider,
      apiFunction,
      usageMetrics: metrics,
      costUsd: costBreakdown.costUsd.toString(),
    };

    // Store in database
    const db = getDb();
    await db.insert(apiUsageCosts).values(record);

    console.log(`[CostTracker] ${provider}/${apiFunction}: $${costBreakdown.costUsd.toFixed(6)} for user ${context.userId}`);

    return costBreakdown;
  } catch (error) {
    console.error('[CostTracker] Failed to track API usage:', error);

    // Return calculated cost even if storage fails
    return calculateApiCost(provider, apiFunction, metrics);
  }
}

/**
 * Track Deepgram transcription usage
 */
export async function trackDeepgramUsage(
  context: TrackingContext,
  durationMinutes: number,
): Promise<CostBreakdown> {
  return trackApiUsage(context, 'deepgram', 'transcription', {
    duration: durationMinutes,
  });
}

/**
 * Track OpenAI note generation usage
 */
export async function trackOpenAIUsage(
  context: TrackingContext,
  inputTokens: number,
  outputTokens: number,
  cachedInputTokens: number = 0,
): Promise<CostBreakdown> {
  return trackApiUsage(context, 'openai', 'note_generation', {
    inputTokens,
    outputTokens,
    cachedInputTokens,
  });
}

/**
 * Track Perplexity chat usage
 */
export async function trackPerplexityUsage(
  context: TrackingContext,
  inputTokens: number,
  outputTokens: number,
  requests: number = 1,
  contextSize: 'low' | 'medium' | 'high' = 'low',
): Promise<CostBreakdown> {
  return trackApiUsage(context, 'perplexity', 'chat', {
    inputTokens,
    outputTokens,
    requests,
    contextSize,
  });
}
