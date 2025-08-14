import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { checkTierFromSessionClaims } from '@/src/shared/utils/roles';

export default async function AICostsAdminPage() {
	const { userId, sessionClaims } = await auth();
	if (!userId) redirect('/login');
	const isAdmin = checkTierFromSessionClaims(sessionClaims, 'admin');
	if (!isAdmin) redirect('/dashboard');

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
				<Card>
					<CardHeader>
						<CardTitle>AI Usage & Costs</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-sm text-gray-600">Daily AI token usage and costs will appear here. (API wiring next)</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}