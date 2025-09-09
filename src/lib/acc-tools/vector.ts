import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

export type VectorItem = {
	id: string;
	text: string;
	metadata?: Record<string, any>;
};

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'clinicpro-acc-tools';

function getOpenAI(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
    return new OpenAI({ apiKey });
}

function getPinecone(): Pinecone {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) throw new Error('Missing PINECONE_API_KEY');
    return new Pinecone({ apiKey });
}

export async function embed(texts: string[]): Promise<number[][]> {
	const res = await getOpenAI().embeddings.create({
		model: 'text-embedding-3-small',
		input: texts,
	});
	return res.data.map(d => d.embedding as unknown as number[]);
}

export async function upsertVectors(namespace: string, items: VectorItem[]): Promise<void> {
	const index = getPinecone().index(PINECONE_INDEX_NAME).namespace(namespace);
	const embeddings: number[][] = await embed(items.map(i => i.text));
	const vectors = items.map((item, i) => ({
		id: item.id,
		values: embeddings[i]!,
		metadata: item.metadata || {},
	}));
	await index.upsert(vectors);
}

export async function queryTopK(namespace: string, query: string, topK: number): Promise<{ id: string; score: number; metadata: Record<string, any> }[]> {
	const index = getPinecone().index(PINECONE_INDEX_NAME).namespace(namespace);
	const embedding = (await embed([query]))[0]!;
	const res = await index.query({
		topK,
		vector: embedding,
		includeMetadata: true,
	});
	return (res.matches || []).map(m => ({ id: m.id as string, score: m.score || 0, metadata: (m.metadata || {}) as Record<string, any> }));
}