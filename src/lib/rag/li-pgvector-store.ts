/*
LlamaIndex PGVector integration (TypeScript SDK)
- Builds a VectorStoreIndex backed by PGVector
- Uses DATABASE_URL for connection; configure collection via LI_PGV_COLLECTION

Note: This relies on LlamaIndex TS's PGVectorStore API.
If the class name changes between versions, this module uses dynamic import fallbacks.
*/

import configureLlamaIndex from './settings';

export type PgVectorIndexHandle = {
  LI: any;
  store: any;
  index: any;
};

export async function getVectorIndexFromPg(params?: {
  collection?: string;
  tableName?: string;
  schema?: string;
  dimensions?: number;
}): Promise<PgVectorIndexHandle> {
  configureLlamaIndex();
  const LI: any = await import('llamaindex');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('[LlamaIndex/PGVector] Missing DATABASE_URL');
  }

  const collection = params?.collection || process.env.LI_PGV_COLLECTION || 'healthify_rag';
  const tableName = params?.tableName || process.env.LI_PGV_TABLE || 'li_pgvector';
  const schema = params?.schema || process.env.LI_PGV_SCHEMA || 'public';
  const dimensions = params?.dimensions || Number(process.env.LI_EMBED_DIM || 1536);

  // Prefer PGVectorStore; fallback: SqlVectorStore if naming differs in version
  const PGVectorStore = LI.PGVectorStore || LI.PgVectorStore || LI.SQLVectorStore || LI.SqlVectorStore;
  if (!PGVectorStore) {
    throw new Error('[LlamaIndex/PGVector] PGVectorStore class not found in llamaindex');
  }

  const store = new PGVectorStore({
    connectionString,
    schema,
    tableName,
    collection,
    dimensions,
  });

  const index = await LI.VectorStoreIndex.fromVectorStore(store);
  return { LI, store, index };
}
