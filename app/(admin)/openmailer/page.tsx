import { getDb } from 'database/client';
import { count, desc, eq } from 'drizzle-orm';
import Link from 'next/link';

import { openmailerCampaigns, openmailerSubscribers } from '@/db/schema';

export default async function OpenmailerDashboardPage() {
  const db = getDb();
  const [subscriberCount] = await db
    .select({ count: count() })
    .from(openmailerSubscribers)
    .where(eq(openmailerSubscribers.status, 'active'));
  const [campaignCount] = await db
    .select({ count: count() })
    .from(openmailerCampaigns);
  const recentCampaigns = await db
    .select({
      id: openmailerCampaigns.id,
      name: openmailerCampaigns.name,
      subject: openmailerCampaigns.subject,
      status: openmailerCampaigns.status,
      totalSent: openmailerCampaigns.totalSent,
      totalOpens: openmailerCampaigns.totalOpens,
      totalClicks: openmailerCampaigns.totalClicks,
      sentAt: openmailerCampaigns.sentAt,
    })
    .from(openmailerCampaigns)
    .orderBy(desc(openmailerCampaigns.createdAt))
    .limit(10);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Email dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Active subscribers</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {subscriberCount?.count ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Total campaigns</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {campaignCount?.count ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Sent this month</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {
              recentCampaigns.filter(
                c => c.status === 'sent' && c.sentAt,
              ).length
            }
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent campaigns</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Campaign
                </th>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="bg-gray-50 px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Sent
                </th>
                <th className="bg-gray-50 px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Opens
                </th>
                <th className="bg-gray-50 px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Clicks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentCampaigns.map(c => (
                <tr key={c.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/openmailer/campaigns/${c.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-700">
                    {c.status}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-gray-700">
                    {c.totalSent}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-gray-700">
                    {c.totalSent > 0
                      ? `${((c.totalOpens / c.totalSent) * 100).toFixed(1)}%`
                      : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-gray-700">
                    {c.totalSent > 0
                      ? `${((c.totalClicks / c.totalSent) * 100).toFixed(1)}%`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
