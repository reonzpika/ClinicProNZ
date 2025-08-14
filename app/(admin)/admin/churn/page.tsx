import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import ChurnOverridesClient from '@/src/features/admin/ChurnOverridesClient';
import { checkTierFromSessionClaims } from '@/src/shared/utils/roles';

export default async function ChurnAdminPage() {
	const { userId, sessionClaims } = await auth();
	if (!userId) redirect('/login');
	const isAdmin = checkTierFromSessionClaims(sessionClaims, 'admin');
	if (!isAdmin) redirect('/dashboard');

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
				<ChurnOverridesClient />
			</div>
		</div>
	);
}