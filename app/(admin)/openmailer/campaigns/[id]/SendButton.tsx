'use client';

import { useState } from 'react';

export function SendButton({
  campaignId,
  campaignName,
}: {
  campaignId: string;
  campaignName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [progress, setProgress] = useState<{ sent: number; total: number } | null>(null);

  async function sendBatch(): Promise<{ sent: number; total: number; continue: boolean }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s client timeout

    try {
      const res = await fetch(`/api/openmailer/campaigns/${campaignId}/send`, {
        method: 'POST',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      return res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request timed out - batch may have partially completed. Retrying...');
      }
      throw err;
    }
  }

  async function handleSend() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    setProgress(null);
    try {
      let shouldContinue = true;
      let retryCount = 0;
      const maxRetries = 3;

      while (shouldContinue) {
        try {
          const data = await sendBatch();
          setProgress({ sent: data.sent, total: data.total });
          shouldContinue = data.continue;
          retryCount = 0; // Reset retry count on success

          if (shouldContinue) {
            // Exponential backoff: 1s, 2s, 4s, 8s...
            const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
            await new Promise(r => setTimeout(r, delay));
          }
        } catch (err) {
          if (retryCount < maxRetries && err instanceof Error && err.message.includes('timed out')) {
            retryCount++;
            console.warn(`Batch timeout, retry ${retryCount}/${maxRetries}`);
            await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
            continue; // Retry the batch
          }
          throw err; // Non-timeout error or max retries exceeded
        }
      }
      alert(`Campaign sent successfully! ${progress?.sent} of ${progress?.total} emails delivered.`);
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="mb-2 text-sm font-medium text-amber-900">
        Send campaign &quot;
{campaignName}
&quot; to all subscribers in the list?
      </p>
      {confirm
? (
        <p className="mb-2 text-sm text-amber-800">
          Click again to confirm send.
        </p>
      )
: null}
      {progress && (
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-sm text-amber-900">
            <span>Sending emails...</span>
            <span className="font-semibold">
              {progress.sent}
              {' '}
              /
              {' '}
              {progress.total}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${(progress.sent / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:bg-gray-400"
      >
        {loading ? 'Sending…' : confirm ? 'Confirm send' : 'Send campaign'}
      </button>
    </div>
  );
}
