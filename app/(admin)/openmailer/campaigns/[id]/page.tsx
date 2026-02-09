import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { openmailerCampaigns } from '@/db/schema';

import { SendButton } from './SendButton';

export default async function OpenmailerCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  const [campaign] = await db
    .select()
    .from(openmailerCampaigns)
    .where(eq(openmailerCampaigns.id, id))
    .limit(1);
  if (!campaign) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
        <Link
          href="/openmailer/campaigns"
          className="text-blue-600 hover:underline"
        >
          Back to campaigns
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Status</p>
          <p className="mt-1 font-semibold capitalize text-gray-900">
            {campaign.status}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Sent</p>
          <p className="mt-1 font-semibold text-gray-900">
            {campaign.totalSent} / {campaign.totalRecipients}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Opens / Clicks</p>
          <p className="mt-1 font-semibold text-gray-900">
            {campaign.totalOpens} / {campaign.totalClicks}
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">Subject</p>
        <p className="mt-1 font-medium text-gray-900">{campaign.subject}</p>
      </div>
      {campaign.status === 'draft' && (
        <SendButton campaignId={campaign.id} campaignName={campaign.name} />
      )}
    </div>
  );
}
