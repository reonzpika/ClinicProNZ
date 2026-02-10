import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { checkTierFromSessionClaims } from '@/src/shared/utils/roles';

export default async function OpenmailerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    redirect('/login');
  }
  if (!checkTierFromSessionClaims(sessionClaims, 'admin')) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 border-r border-gray-200 bg-white p-4">
          <h1 className="text-lg font-bold text-gray-900">OpenMailer</h1>
          <nav className="mt-4 space-y-1">
            <Link
              href="/openmailer"
              className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </Link>
            <Link
              href="/openmailer/subscribers"
              className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              Subscribers
            </Link>
            <Link
              href="/openmailer/subscribers/import"
              className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              Import CSV
            </Link>
            <Link
              href="/openmailer/campaigns"
              className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              Campaigns
            </Link>
            <Link
              href="/openmailer/campaigns/new"
              className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              New campaign
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
