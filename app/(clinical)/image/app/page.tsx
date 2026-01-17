'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

type UsageResponse = {
  tier: 'free' | 'premium';
  imagesUsedThisMonth: number;
  limit: number | null;
};

type StatusImage = {
  id: string;
  createdAt: string;
  downloadUrl: string;
  fileSize?: number | null;
};

type StatusResponse = {
  images: StatusImage[];
  count: number;
};

type MobileLinkResponse = {
  token: string;
};

function buildShareText(url: string) {
  return `My clinical photo tool: ${url}`;
}

export default function ImageAppPage() {
  const [mobileToken, setMobileToken] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const mobileUrl = useMemo(() => {
    if (!mobileToken) {
      return null;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://clinicpro.co.nz';
    return `${origin}/image/mobile?u=${encodeURIComponent(mobileToken)}`;
  }, [mobileToken]);

  const shareText = useMemo(() => mobileUrl ? buildShareText(mobileUrl) : '', [mobileUrl]);

  useEffect(() => {
    let cancelled = false;
    async function loadMobileLink() {
      try {
        const resp = await fetch('/api/image/mobile-link', { method: 'POST' });
        if (!resp.ok) {
          const payload = await resp.json().catch(() => ({}));
          throw new Error(payload?.error || 'Failed to create mobile link');
        }
        const data = (await resp.json()) as MobileLinkResponse;
        if (!cancelled) {
          setMobileToken(data.token);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load mobile link');
        }
      }
    }
    loadMobileLink();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadUsage() {
      try {
        const resp = await fetch('/api/image/usage', { cache: 'no-store' });
        if (!resp.ok) {
          const payload = await resp.json().catch(() => ({}));
          throw new Error(payload?.error || 'Failed to load usage');
        }
        const data = (await resp.json()) as UsageResponse;
        if (!cancelled) {
          setUsage(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load usage');
        }
      }
    }
    loadUsage();
    const interval = setInterval(loadUsage, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadStatus() {
      try {
        const resp = await fetch('/api/image/status', { cache: 'no-store' });
        if (!resp.ok) {
          const payload = await resp.json().catch(() => ({}));
          throw new Error(payload?.error || 'Failed to load images');
        }
        const data = (await resp.json()) as StatusResponse;
        if (!cancelled) {
          setStatus(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load images');
        }
      }
    }
    loadStatus();
    const interval = setInterval(loadStatus, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const usageLabel = useMemo(() => {
    if (!usage) {
      return 'Loading…';
    }
    if (usage.tier === 'premium') {
      return 'Unlimited (Premium)';
    }
    const limit = usage.limit ?? 20;
    return `${usage.imagesUsedThisMonth}/${limit} images used this month`;
  }, [usage]);

  const showGentleUpgrade = usage?.tier === 'free' && (usage.limit ?? 20) - usage.imagesUsedThisMonth <= 5;
  const reachedLimit = usage?.tier === 'free' && usage.imagesUsedThisMonth >= (usage.limit ?? 20);

  async function copyLink() {
    if (!mobileUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(mobileUrl);
    } catch {
      // best-effort; no-op
    }
  }

  const smsHref = mobileUrl ? `sms:?&body=${encodeURIComponent(shareText)}` : '#';
  const emailHref = mobileUrl ? `mailto:?subject=${encodeURIComponent('ClinicPro Photo Tool')}&body=${encodeURIComponent(shareText)}` : '#';
  const whatsappHref = mobileUrl ? `https://wa.me/?text=${encodeURIComponent(shareText)}` : '#';

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">ClinicPro Photo Tool</h1>
        <p className="text-slate-600">
          Send this link to your phone once, then save it for future use.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send this link to your phone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border bg-white p-3">
              <div className="break-all font-mono text-sm text-slate-900">
                {mobileUrl || 'Loading link…'}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={copyLink} disabled={!mobileUrl} variant="default">
                Copy
              </Button>
              <Button asChild disabled={!mobileUrl} variant="outline">
                <a href={smsHref}>SMS</a>
              </Button>
              <Button asChild disabled={!mobileUrl} variant="outline">
                <a href={emailHref}>Email</a>
              </Button>
              <Button asChild disabled={!mobileUrl} variant="outline">
                <a href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp</a>
              </Button>
            </div>

            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              <strong>Tip:</strong>
              {' '}
              Save this link on your phone home screen for easy access.
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-slate-700">
                Usage:
                {' '}
                <strong>{usageLabel}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowQR(v => !v)}>
                  {showQR ? 'Hide QR' : 'Show QR'}
                </Button>
                <Button asChild variant="default">
                  <a href="/image/upgrade">Upgrade</a>
                </Button>
              </div>
            </div>

            {showGentleUpgrade && usage?.tier === 'free' && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                5 images left this month. Upgrade for unlimited?
              </div>
            )}

            {reachedLimit && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                Monthly limit reached. Upgrade to Premium for $50 (one-time payment).
              </div>
            )}

            {showQR && mobileUrl && (
              <div className="mt-2 rounded-md border bg-white p-4">
                <div className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
                  Optional QR (backup)
                </div>
                <div className="flex justify-center">
                  <QRCodeCanvas value={mobileUrl} size={160} includeMargin />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Images (updates live)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!status && (
              <div className="text-sm text-slate-600">Loading images…</div>
            )}

            {status && status.images.length === 0 && (
              <div className="rounded-md border bg-white p-4 text-sm text-slate-600">
                No images yet. Open the link on your phone and start capturing.
              </div>
            )}

            {status && status.images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {status.images.map(img => (
                  <a
                    key={img.id}
                    href={img.downloadUrl}
                    className="group block overflow-hidden rounded-md border bg-white"
                  >
                    <div className="flex aspect-square items-center justify-center bg-slate-50 text-xs text-slate-500">
                      Download
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-slate-600">
                        {new Date(img.createdAt).toLocaleString('en-NZ')}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

