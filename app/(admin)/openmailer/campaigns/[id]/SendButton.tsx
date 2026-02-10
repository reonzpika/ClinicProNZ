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

  async function handleSend() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/openmailer/campaigns/${campaignId}/send`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      const data = await res.json();
      alert(`Sent ${data.sent} of ${data.total} emails.`);
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
