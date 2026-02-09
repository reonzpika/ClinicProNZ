import { getDb } from 'database/client';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';

import { openmailerSubscribers } from '@/db/schema';

import { AddSubscriberButton } from './AddSubscriberButton';
import { SubscriberRowActions } from './SubscriberRowActions';

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">List:</span>
          <div className="flex gap-2">
            <Link
              href="/openmailer/subscribers"
              className={`rounded px-3 py-1.5 text-sm ${
                !list
                  ? 'bg-gray-200 font-medium text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </Link>
            <Link
              href="/openmailer/subscribers?list=pho-contacts"
              className={`rounded px-3 py-1.5 text-sm ${
                list === 'pho-contacts'
                  ? 'bg-gray-200 font-medium text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              pho-contacts
            </Link>
            <Link
              href="/openmailer/subscribers?list=gp-users"
              className={`rounded px-3 py-1.5 text-sm ${
                list === 'gp-users'
                  ? 'bg-gray-200 font-medium text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              gp-users
            </Link>
            <Link
              href="/openmailer/subscribers?list=general"
              className={`rounded px-3 py-1.5 text-sm ${
                list === 'general'
                  ? 'bg-gray-200 font-medium text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              general
            </Link>
          </div>
          <AddSubscriberButton />
        </div>
      </div>
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
                <th className="bg-gray-50 px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Actions
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
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <SubscriberRowActions
                      subscriber={{
                        id: r.id,
                        email: r.email,
                        name: r.name,
                        listName: r.listName,
                        status: r.status,
                      }}
                    />
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
