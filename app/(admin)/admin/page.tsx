import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { AdminDashboard } from '@/src/features/admin/components/AdminDashboard';
import { checkTierFromSessionClaims } from '@/src/shared/utils/roles';

export default async function AdminPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    redirect('/login');
  }

  const isAdmin = checkTierFromSessionClaims(sessionClaims, 'admin');
  if (!isAdmin) {
    redirect('/dashboard');
  }

  return <AdminDashboard />;
}
