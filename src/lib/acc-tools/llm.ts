import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function rerankAccCodes(input: {
	injury: string;
	candidates: { code: string; description: string }[];
	topK?: number;
}): Promise<{
	improvedDescription: string;
	missingInfo: string[];
	accCodes: { code: string; description: string; justification: string }[];
}> {
	const system = 'You are an assistant for NZ ACC coding. Use only provided candidates. Return compact JSON only.';
	const user = `Injury description:\n${input.injury}\n\nCandidates:\n${JSON.stringify(input.candidates)}\n\nRules:\n- Use only provided candidates.\n- Rank by clinical appropriateness.\n- Provide a single improved, ACC-compliant description.\n- List missing mandatory info (mechanism, body location, injury specifics).\n- Output strictly in this JSON schema: { "improvedDescription": string, "missingInfo": string[], "accCodes": [{"code": string, "description": string, "justification": string}] }`;
	const resp = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: system },
			{ role: 'user', content: user },
		],
		temperature: 0.2,
		max_tokens: 500,
	});
	const content = resp.choices?.[0]?.message?.content || '{}';
	return JSON.parse(content);
}

export async function rerankAnzsco(input: {
	job: string;
	candidates: { code: string; title: string; description: string }[];
	topK?: number;
}): Promise<{
	results: { code: string; title: string; description: string; confidence: number; justification: string }[];
}> {
	const system = 'You are an assistant mapping free-text jobs to ANZSCO. Use only provided candidates. Return compact JSON only.';
	const user = `Job description:\n${input.job}\n\nCandidates:\n${JSON.stringify(input.candidates)}\n\nRules:\n- Use only provided candidates.\n- Return top 1-3 with confidence in [0,1] and brief justification.\n- Output strictly as { "results": [{"code": string, "title": string, "description": string, "confidence": number, "justification": string}] }`;
	const resp = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: system },
			{ role: 'user', content: user },
		],
		temperature: 0.2,
		max_tokens: 400,
	});
	const content = resp.choices?.[0]?.message?.content || '{}';
	return JSON.parse(content);
}