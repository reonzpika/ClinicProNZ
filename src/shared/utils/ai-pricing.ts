export type ModelPricing = {
	inputPer1kUsd: number;
	outputPer1kUsd: number;
};

const PRICING_TABLE: Record<string, ModelPricing> = {
	'gpt-4': { inputPer1kUsd: 0.03, outputPer1kUsd: 0.06 },
	'gpt-4.1-mini': { inputPer1kUsd: 0.003, outputPer1kUsd: 0.006 },
};

export function getModelPricing(model: string): ModelPricing | null {
	const key = model.toLowerCase();
	return PRICING_TABLE[key] || null;
}

export function estimateTokensFromChars(charCount: number): number {
	const approx = Math.ceil(charCount / 4);
	return approx;
}

export function calculateCostUsd(model: string, inputTokens: number, outputTokens: number): number | null {
	const pricing = getModelPricing(model);
	if (!pricing) return null;
	const inCost = (inputTokens / 1000) * pricing.inputPer1kUsd;
	const outCost = (outputTokens / 1000) * pricing.outputPer1kUsd;
	return +(inCost + outCost).toFixed(6);
}