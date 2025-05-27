import { useCallback, useState } from 'react';

type TokenResponse = { token: string; expires_in?: number };

export function useDeepgramToken() {
  const [token, setToken] = useState<string>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);

  const fetchToken = useCallback(async (): Promise<string> => {
    if (token) {
      return token;
    } // cached

    setLoading(true);
    setError(undefined);

    try {
      const res = await fetch('/api/deepgram/token', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || res.statusText);
      }

      const data = (await res.json()) as TokenResponse;
      if (!data.token) {
        throw new Error('Missing token in response');
      }

      setToken(data.token);
      return data.token;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { fetchToken, token, loading, error };
}
