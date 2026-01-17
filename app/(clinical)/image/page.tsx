import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

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

export default async function ImageLandingPage() {
  const { userId } = await auth();

  const startHref = userId
    ? '/image/app'
    : `/auth/register?redirect_url=${encodeURIComponent('/image/app')}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">ClinicPro Photo Tool</h1>
        <p className="max-w-2xl text-slate-600">
          Fast clinical photos for e-referrals. Capture on your phone; view on your desktop. Images auto-expire after 24 hours.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Sign in to generate your personal mobile link, then save it to your phone for future use.
            </p>
            <Button asChild className="w-full">
              <Link href={startHref}>Open Photo Tool</Link>
            </Button>
            <p className="text-xs text-slate-500">
              Looking for Medtech Evolution integration for your whole clinic?
              {' '}
              <a className="underline" href="mailto:contact@clinicpro.co.nz">Email us</a>
              {' '}
              to find out more about our clinic-wide solution.
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle>Free vs Premium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FeatureComparisonTable />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/image/app">I’m already signed in</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/image/upgrade">Upgrade to Premium</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

