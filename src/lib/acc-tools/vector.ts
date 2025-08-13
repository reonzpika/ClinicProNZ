import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

export type VectorItem = {
	id: string;
	text: string;
	metadata?: Record<string, any>;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'clinicpro-acc-tools';

if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');
if (!PINECONE_API_KEY) throw new Error('Missing PINECONE_API_KEY');
if (!PINECONE_ENVIRONMENT) throw new Error('Missing PINECONE_ENVIRONMENT');

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY, environment: PINECONE_ENVIRONMENT });

export async function embed(texts: string[]): Promise<number[][]> {
	const res = await openai.embeddings.create({
		model: 'text-embedding-3-small',
		input: texts,
	});
	return res.data.map(d => d.embedding as unknown as number[]);
}

export async function upsertVectors(namespace: string, items: VectorItem[]): Promise<void> {
	const index = pinecone.Index(PINECONE_INDEX_NAME).namespace(namespace);
	const embeddings = await embed(items.map(i => i.text));
	const vectors = items.map((item, i) => ({
		id: item.id,
		values: embeddings[i],
		metadata: item.metadata || {},
	}));
	await index.upsert(vectors);
}

export async function queryTopK(namespace: string, query: string, topK: number): Promise<{ id: string; score: number; metadata: Record<string, any> }[]> {
	const index = pinecone.Index(PINECONE_INDEX_NAME).namespace(namespace);
	const [embedding] = await embed([query]);
	const res = await index.query({
		topK,
		vector: embedding,
		includeMetadata: true,
	});
	return (res.matches || []).map(m => ({ id: m.id as string, score: m.score || 0, metadata: (m.metadata || {}) as Record<string, any> }));
}