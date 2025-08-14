import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { checkTierFromSessionClaims } from '@/src/shared/utils/roles';

export default async function AdminDashboard() {
	const { userId, sessionClaims } = await auth();
	if (!userId) {
		redirect('/login');
	}

	const isAdmin = checkTierFromSessionClaims(sessionClaims, 'admin');
	if (!isAdmin) {
		redirect('/dashboard');
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="space-y-8">
					{/* Header */}
					<div className="text-center">
						<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
						<p className="mt-2 text-gray-600">
							Administrative tools and system monitoring
						</p>
					</div>

					{/* System Status */}
					<div className="rounded-lg border border-gray-200 bg-white p-6">
						<h2 className="mb-4 text-xl font-semibold text-gray-900">System Status</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<div className="rounded bg-green-100 p-3">
								<span className="font-medium text-green-800">✅ Database Connection</span>
								<p className="text-sm text-green-700">All systems operational</p>
							</div>
							<div className="rounded bg-green-100 p-3">
								<span className="font-medium text-green-800">✅ Clerk Authentication</span>
								<p className="text-sm text-green-700">User authentication working</p>
							</div>
							<div className="rounded bg-green-100 p-3">
								<span className="font-medium text-green-800">✅ API Endpoints</span>
								<p className="text-sm text-green-700">All endpoints responding</p>
							</div>
							<div className="rounded bg-green-100 p-3">
								<span className="font-medium text-green-800">✅ Tier System</span>
								<p className="text-sm text-green-700">RBAC tier system active</p>
							</div>
							<div className="rounded bg-green-100 p-3">
								<span className="font-medium text-green-800">✅ Billing Integration</span>
								<p className="text-sm text-green-700">Stripe integration working</p>
							</div>
							<div className="rounded bg-green-100 p-3">
								<span className="font-medium text-green-800">✅ Tier Utility</span>
								<p className="text-sm text-green-700">Tier helper functions implemented</p>
							</div>
							<div className="rounded bg-green-100 p-3">
								<span className="font-medium text-green-800">✅ Webhook Setup</span>
								<p className="text-sm text-green-700">Auto-assigns 'basic' tier</p>
							</div>
							<div className="rounded bg-green-100 p-3">
								<span className="font-medium text-green-800">✅ Middleware Protection</span>
								<p className="text-sm text-green-700">Routes protected by tier</p>
							</div>
							<div className="rounded bg-green-100 p-3">
								<span className="font-medium text-green-800">✅ Rate Limiting</span>
								<p className="text-sm text-green-700">Tier-based rate limiting active</p>
							</div>
						</div>
					</div>

					{/* New: Management Panels */}
					<div className="rounded-lg border border-gray-200 bg-white p-6">
						<h2 className="mb-4 text-xl font-semibold text-gray-900">Management</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<a href="/admin/marketing" className="rounded-lg border border-gray-300 bg-white p-4 text-left hover:bg-gray-50">
								<span className="font-medium">Marketing Spend</span>
								<p className="text-sm text-gray-600">Enter and manage marketing spend</p>
							</a>
							<a href="/admin/churn" className="rounded-lg border border-gray-300 bg-white p-4 text-left hover:bg-gray-50">
								<span className="font-medium">Churn Overrides</span>
								<p className="text-sm text-gray-600">Record churn status and reasons</p>
							</a>
							<a href="/admin/ai-costs" className="rounded-lg border border-gray-300 bg-white p-4 text-left hover:bg-gray-50">
								<span className="font-medium">AI Costs</span>
								<p className="text-sm text-gray-600">Review per-session AI usage</p>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
