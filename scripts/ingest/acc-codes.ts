import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

import { db } from '../../database/client';
import { accCodes } from '../../database/schema/acc_codes';
import { upsertVectors } from '../../src/lib/acc-tools/vector';

async function main() {
	const file = process.argv[2] || resolve(process.cwd(), 'data/acc_codes.csv');
	const csv = await readFile(file, 'utf8');
	const rows = csv.split(/\r?\n/).filter(Boolean);
	const header = rows.shift()?.split(',') || [];
	const col = (name: string) => header.findIndex(h => h.trim().toLowerCase() === name);
	const idxCode = col('read_code');
	const idxTerm = col('preferred_term');
	const idxDesc = col('description');
	const idxSyn = col('synonyms');
	if (idxCode < 0 || idxTerm < 0) throw new Error('CSV must include read_code and preferred_term');

	const batch = [] as any[];
	const vectors: { id: string; text: string; metadata: Record<string, any> }[] = [];
	for (const line of rows) {
		const parts = line.split(',');
		const code = (parts[idxCode] || '').trim();
		const term = (parts[idxTerm] || '').trim();
		const description = (parts[idxDesc] || '').trim();
		const synonyms = (parts[idxSyn] || '').trim();
		if (!code || !term) continue;
		const id = randomUUID();
		batch.push({ id, readCode: code, preferredTerm: term, description, synonyms });
		vectors.push({
			id,
			text: `${term} ${description} ${synonyms}`.trim(),
			metadata: { code, preferredTerm: term, description },
		});
	}

	if (batch.length === 0) throw new Error('No rows to ingest');
	console.log(`Inserting ${batch.length} ACC code metadata rows...`);
	await db.insert(accCodes).values(batch);
	console.log(`Upserting ${vectors.length} vectors into Pinecone (namespace: acc-codes)...`);
	await upsertVectors('acc-codes', vectors);
	console.log('Done');
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});