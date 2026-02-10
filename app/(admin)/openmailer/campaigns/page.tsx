import { getDb } from 'database/client';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

import { openmailerCampaigns } from '@/db/schema';

export default async function OpenmailerCampaignsPage() {
  const db = getDb();
  const campaigns = await db
    .select()
    .from(openmailerCampaigns)
    .orderBy(desc(openmailerCampaigns.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Link
          href="/openmailer/campaigns/new"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          New campaign
        </Link>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Name
                </th>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Subject
                </th>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="bg-gray-50 px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Sent
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/openmailer/campaigns/${c.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{c.subject}</td>
                  <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-700">
                    {c.status}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-gray-700">
                    {c.totalSent}
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
