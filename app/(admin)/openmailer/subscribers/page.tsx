import { getDb } from 'database/client';
import { desc, eq } from 'drizzle-orm';

import { openmailerSubscribers } from '@/db/schema';

export default async function OpenmailerSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const { list } = await searchParams;
  const db = getDb();
  const rows = list
    ? await db
        .select()
        .from(openmailerSubscribers)
        .where(eq(openmailerSubscribers.listName, list))
        .orderBy(desc(openmailerSubscribers.subscribedAt))
    : await db
        .select()
        .from(openmailerSubscribers)
        .orderBy(desc(openmailerSubscribers.subscribedAt));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Email
                </th>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Name
                </th>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  List
                </th>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Subscribed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-900">
                    {r.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                    {r.name ?? '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                    {r.listName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-700">
                    {r.status}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                    {r.subscribedAt
                      ? new Date(r.subscribedAt).toLocaleDateString()
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
