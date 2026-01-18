'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

function FeatureComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="border-b border-slate-200 p-3 text-left font-semibold text-slate-900">Feature</th>
            <th className="border-b border-slate-200 p-3 text-left font-semibold text-slate-900">Free</th>
            <th className="border-b border-slate-200 bg-purple-50 p-3 text-left font-semibold text-slate-900">
              Premium
            </th>
          </tr>
        </thead>
        <tbody className="[&_td]:border-b [&_td]:border-slate-100">
          <tr>
            <td className="p-3 font-medium text-slate-900">Images per month</td>
            <td className="p-3 text-slate-700">20 images</td>
            <td className="bg-purple-50 p-3 text-slate-700">Unlimited</td>
          </tr>
          <tr>
            <td className="p-3 font-medium text-slate-900">Output formats</td>
            <td className="p-3 text-slate-700">JPEG only</td>
            <td className="bg-purple-50 p-3 text-slate-700">JPEG + PDF</td>
          </tr>
          <tr>
            <td className="p-3 font-medium text-slate-900">Annotation tools</td>
            <td className="p-3 text-slate-700">❌</td>
            <td className="bg-purple-50 p-3 text-slate-700">✅ Arrows, circles, crop, markup</td>
          </tr>
          <tr>
            <td className="p-3 font-medium text-slate-900">Batch processing</td>
            <td className="p-3 text-slate-700">Single images</td>
            <td className="bg-purple-50 p-3 text-slate-700">Multiple images at once</td>
          </tr>
          <tr>
            <td className="p-3 font-medium text-slate-900">File size</td>
            <td className="p-3 text-slate-700">&lt;1MB guaranteed</td>
            <td className="bg-purple-50 p-3 text-slate-700">&lt;1MB guaranteed</td>
          </tr>
          <tr>
            <td className="p-3 font-medium text-slate-900">Storage</td>
            <td className="p-3 text-slate-700">24 hours</td>
            <td className="bg-purple-50 p-3 text-slate-700">24 hours</td>
          </tr>
          <tr>
            <td className="p-3 font-medium text-slate-900">Support</td>
            <td className="p-3 text-slate-700">Email</td>
            <td className="bg-purple-50 p-3 text-slate-700">Priority email</td>
          </tr>
          <tr>
            <td className="p-3 font-medium text-slate-900">Price</td>
            <td className="p-3 text-slate-700">
              <strong>Free</strong>
            </td>
            <td className="bg-purple-50 p-3 text-slate-700">
              <strong>$50 one-time</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function ImageUpgradePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [status, setStatus] = useState<string | null>(null);

  const signInHref = useMemo(() => {
    return `/auth/login?redirect_url=${encodeURIComponent('/image/upgrade')}`;
  }, []);

  const startCheckout = useCallback(async () => {
    try {
      setStatus('Creating checkout…');
      const resp = await fetch('/api/image/upgrade/checkout', { method: 'POST' });
      if (!resp.ok) {
        const payload = await resp.json().catch(() => ({}));
        throw new Error(payload?.error || 'Failed to create checkout');
      }
      const data = await resp.json() as { checkoutUrl: string };
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Checkout failed');
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Upgrade</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">Loading…</CardContent>
        </Card>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Premium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FeatureComparisonTable />
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              Sign in first so we can apply Premium to your account.
            </div>
            <Button asChild className="w-full">
              <a href={signInHref}>Sign in to upgrade</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/image">Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle>Upgrade to Premium</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FeatureComparisonTable />
          <Button onClick={startCheckout} className="w-full" size="lg" type="button">
            Upgrade for $50 (one-time)
          </Button>
          {status && (
            <div className="rounded-md border bg-white p-3 text-sm text-slate-700">
              {status}
            </div>
          )}
          <p className="text-xs text-slate-500">
            Looking for Medtech Evolution integration for your whole clinic?
            {' '}
            <a className="underline" href="mailto:contact@clinicpro.co.nz">Email us</a>
            {' '}
            to find out more about our clinic-wide solution.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
