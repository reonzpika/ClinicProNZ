import { algoliasearch, type SearchClient } from 'algoliasearch';

export function createAlgoliaSearchClient(): SearchClient {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;

  if (!appId || !apiKey) {
    throw new Error('Algolia env vars missing: NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_SEARCH_KEY');
  }

  return algoliasearch(appId, apiKey);
}

export function getAlgoliaIndex(indexNameEnv: string = 'ALGOLIA_INDEX_NAME_NZ_MED') {
  const client = createAlgoliaSearchClient();
  const indexName = process.env[indexNameEnv];
  if (!indexName) {
    throw new Error(`Algolia index env var missing: ${indexNameEnv}`);
  }
  // v5 client uses .index(name)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (client as any).index(indexName);
}