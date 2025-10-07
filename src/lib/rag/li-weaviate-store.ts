/*
LlamaIndex Weaviate integration (TypeScript SDK)
- Builds a VectorStoreIndex backed by Weaviate
- Uses WEAVIATE_URL and WEAVIATE_API_KEY
- Optional: WEAVIATE_CLASS (default: 'HealthifyChunk'), WEAVIATE_TENANT

Note: This prefers LlamaIndex's built-in WeaviateVectorStore. If the store
requires a Weaviate client instance, we lazily import 'weaviate-ts-client'.
*/

import configureLlamaIndex from './settings';

export type WeaviateIndexHandle = {
  LI: any;
  store: any;
  index: any;
};

export async function getVectorIndexFromWeaviate(params?: {
  className?: string;
  tenant?: string;
}): Promise<WeaviateIndexHandle> {
  configureLlamaIndex();
  const LI: any = await import('llamaindex');

  const weaviateUrl = process.env.WEAVIATE_URL;
  const weaviateApiKey = process.env.WEAVIATE_API_KEY;
  if (!weaviateUrl || !weaviateApiKey) {
    throw new Error('[LlamaIndex/Weaviate] Missing WEAVIATE_URL or WEAVIATE_API_KEY');
  }

  const className = params?.className || process.env.WEAVIATE_CLASS || 'HealthifyChunk';
  const tenant = params?.tenant || process.env.WEAVIATE_TENANT || undefined;

  const WeaviateVectorStore = LI.WeaviateVectorStore || LI.WeaviateStore;
  if (!WeaviateVectorStore) {
    throw new Error('[LlamaIndex/Weaviate] WeaviateVectorStore not found in llamaindex');
  }

  let store: any;
  try {
    // Try simple constructor with url/apiKey
    store = new WeaviateVectorStore({
      url: weaviateUrl,
      apiKey: weaviateApiKey,
      className,
      tenant,
    });
  } catch (e) {
    // Fallback: attempt to construct a client via weaviate-ts-client
    try {
      const weaviate: any = await import('weaviate-ts-client');
      const url = new URL(weaviateUrl);
      const scheme = url.protocol.replace(':', '') || 'https';
      const host = url.host;
      const client = weaviate.default.client({
        scheme,
        host,
        apiKey: new weaviate.ApiKey(weaviateApiKey),
      });
      store = new WeaviateVectorStore({ client, className, tenant });
    } catch (inner) {
      throw new Error('[LlamaIndex/Weaviate] Failed to initialise store. Ensure llamaindex supports WeaviateVectorStore and install weaviate-ts-client if required.');
    }
  }

  const index = await LI.VectorStoreIndex.fromVectorStore(store);
  return { LI, store, index };
}
