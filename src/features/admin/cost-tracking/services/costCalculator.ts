/**
 * Cost calculation service for API usage tracking
 * Updated pricing as of 2024
 */

export type ApiProvider = 'deepgram' | 'openai' | 'perplexity';
export type ApiFunction = 'transcription' | 'note_generation' | 'chat';

export type UsageMetrics = {
  // Deepgram transcription
  duration?: number; // minutes

  // OpenAI note generation
  inputTokens?: number;
  outputTokens?: number;
  cachedInputTokens?: number;

  // Perplexity chat
  requests?: number;
  contextSize?: 'low' | 'medium' | 'high';
};

export type CostBreakdown = {
  provider: ApiProvider;
  function: ApiFunction;
  usage: UsageMetrics;
  costUsd: number;
  details: string;
};

// API Pricing Constants (2024)
const PRICING = {
  deepgram: {
    transcription: {
      perMinute: 0.0043, // Nova-3 model
    },
  },
  openai: {
    note_generation: {
      inputPerToken: 0.25 / 1_000_000, // GPT-5 mini: $0.25/1M tokens
      cachedInputPerToken: 0.025 / 1_000_000, // GPT-5 mini cached: $0.025/1M tokens
      outputPerToken: 2.0 / 1_000_000, // GPT-5 mini: $2.00/1M tokens
    },
  },
  perplexity: {
    chat: {
      inputPerToken: 1.0 / 1_000_000, // Sonar: $1/1M tokens
      outputPerToken: 1.0 / 1_000_000, // Sonar: $1/1M tokens
      requestCosts: {
        low: 5.0 / 1000, // $5 per 1000 requests
        medium: 8.0 / 1000, // $8 per 1000 requests
        high: 12.0 / 1000, // $12 per 1000 requests
      },
    },
  },
} as const;

/**
 * Calculate cost for Deepgram transcription
 */
export function calculateDeepgramCost(metrics: UsageMetrics): CostBreakdown {
  const duration = metrics.duration || 0;
  const cost = duration * PRICING.deepgram.transcription.perMinute;

  return {
    provider: 'deepgram',
    function: 'transcription',
    usage: { duration },
    costUsd: Number(cost.toFixed(6)),
    details: `${duration} minutes × $${PRICING.deepgram.transcription.perMinute}`,
  };
}

/**
 * Calculate cost for OpenAI note generation
 */
export function calculateOpenAICost(metrics: UsageMetrics): CostBreakdown {
  const inputTokens = metrics.inputTokens || 0;
  const cachedInputTokens = metrics.cachedInputTokens || 0;
  const outputTokens = metrics.outputTokens || 0;

  const inputCost = inputTokens * PRICING.openai.note_generation.inputPerToken;
  const cachedInputCost = cachedInputTokens * PRICING.openai.note_generation.cachedInputPerToken;
  const outputCost = outputTokens * PRICING.openai.note_generation.outputPerToken;

  const totalCost = inputCost + cachedInputCost + outputCost;

  return {
    provider: 'openai',
    function: 'note_generation',
    usage: { inputTokens, cachedInputTokens, outputTokens },
    costUsd: Number(totalCost.toFixed(6)),
    details: `${inputTokens} input + ${cachedInputTokens} cached + ${outputTokens} output tokens`,
  };
}

/**
 * Calculate cost for Perplexity chat
 */
export function calculatePerplexityCost(metrics: UsageMetrics): CostBreakdown {
  const inputTokens = metrics.inputTokens || 0;
  const outputTokens = metrics.outputTokens || 0;
  const requests = metrics.requests || 0;
  const contextSize = metrics.contextSize || 'low';

  const inputCost = inputTokens * PRICING.perplexity.chat.inputPerToken;
  const outputCost = outputTokens * PRICING.perplexity.chat.outputPerToken;
  const requestCost = requests * PRICING.perplexity.chat.requestCosts[contextSize];

  const totalCost = inputCost + outputCost + requestCost;

  return {
    provider: 'perplexity',
    function: 'chat',
    usage: { inputTokens, outputTokens, requests, contextSize },
    costUsd: Number(totalCost.toFixed(6)),
    details: `${inputTokens} input + ${outputTokens} output tokens + ${requests} ${contextSize} requests`,
  };
}

/**
 * Main cost calculation function
 */
export function calculateApiCost(
  provider: ApiProvider,
  apiFunction: ApiFunction,
  metrics: UsageMetrics,
): CostBreakdown {
  switch (provider) {
    case 'deepgram':
      if (apiFunction === 'transcription') {
        return calculateDeepgramCost(metrics);
      }
      break;
    case 'openai':
      if (apiFunction === 'note_generation') {
        return calculateOpenAICost(metrics);
      }
      break;
    case 'perplexity':
      if (apiFunction === 'chat') {
        return calculatePerplexityCost(metrics);
      }
      break;
  }

  throw new Error(`Unsupported combination: ${provider} + ${apiFunction}`);
}

/**
 * Format cost as currency string
 */
export function formatCost(costUsd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(costUsd);
}
