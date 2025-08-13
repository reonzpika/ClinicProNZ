import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

import { db } from '../../database/client';
import { anzscoOccupations } from '../../database/schema/anzsco';
import { upsertVectors } from '../../src/lib/acc-tools/vector';

async function main() {
	const file = process.argv[2] || resolve(process.cwd(), 'data/anzsco.csv');
	const csv = await readFile(file, 'utf8');
	const rows = csv.split(/\r?\n/).filter(Boolean);
	const header = rows.shift()?.split(',') || [];
	const col = (name: string) => header.findIndex(h => h.trim().toLowerCase() === name);
	const idxCode = col('code');
	const idxTitle = col('title');
	const idxDesc = col('description');
	if (idxCode < 0 || idxTitle < 0) throw new Error('CSV must include code and title');

	const batch = [] as any[];
	const vectors: { id: string; text: string; metadata: Record<string, any> }[] = [];
	for (const line of rows) {
		const parts = line.split(',');
		const code = (parts[idxCode] || '').trim();
		const title = (parts[idxTitle] || '').trim();
		const description = (parts[idxDesc] || '').trim();
		if (!code || !title) continue;
		const id = randomUUID();
		batch.push({ id, code, title, description });
		vectors.push({ id, text: `${title} ${description}`.trim(), metadata: { code, title, description } });
	}

	if (batch.length === 0) throw new Error('No rows to ingest');
	console.log(`Inserting ${batch.length} ANZSCO metadata rows...`);
	await db.insert(anzscoOccupations).values(batch);
	console.log(`Upserting ${vectors.length} vectors into Pinecone (namespace: anzsco)...`);
	await upsertVectors('anzsco', vectors);
	console.log('Done');
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});