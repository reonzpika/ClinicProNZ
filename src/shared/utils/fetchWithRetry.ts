export type RetryOptions = {
  maxRetries?: number; // number of retries after the first attempt
  baseDelayMs?: number; // initial backoff delay
  maxDelayMs?: number; // max backoff delay cap
  retryOnStatus?: (status: number) => boolean; // predicate to decide retry on HTTP response
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object'
    && error !== null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    && ((error as any).name === 'AbortError' || (error as any).code === 'ABORT_ERR')
  );
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: RetryOptions = {},
): Promise<Response> {
  const {
    maxRetries = 2,
    baseDelayMs = 1000,
    maxDelayMs = 4000,
    retryOnStatus = (status: number) => status === 500 || status === 502 || status === 503 || status === 504,
  } = options;

  const attempts = maxRetries + 1;

  // If caller passed an AbortSignal and it's already aborted, fail fast
  if (init?.signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  let lastError: unknown = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch(input, init);
      if (!response.ok && retryOnStatus(response.status) && attempt < attempts - 1) {
        // Exponential backoff with jitter
        const delay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs) + Math.floor(Math.random() * 250);
        await sleep(delay);
        continue;
      }
      return response;
    } catch (error) {
      // Do not retry AbortError
      if (isAbortError(error)) {
        throw error;
      }
      lastError = error;
      if (attempt < attempts - 1) {
        const delay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs) + Math.floor(Math.random() * 250);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }

  // Should not reach here; throw last error as a safeguard
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  throw lastError as unknown;
}

export default fetchWithRetry;
