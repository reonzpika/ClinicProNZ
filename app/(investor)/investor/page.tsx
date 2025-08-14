import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

export default function InvestorDashboardPage() {
	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid gap-6 md:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle>MRR / ARR</CardTitle>
						</CardHeader>
						<CardContent>Coming soon</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Gross Margin</CardTitle>
						</CardHeader>
						<CardContent>Coming soon</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>CAC : LTV</CardTitle>
						</CardHeader>
						<CardContent>Coming soon</CardContent>
					</Card>
				</div>
				<div className="mt-8 grid gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Marketing Spend</CardTitle>
						</CardHeader>
						<CardContent>
							<a href="/admin/marketing" className="text-blue-600 underline">Manage marketing spend</a>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Churn</CardTitle>
						</CardHeader>
						<CardContent>
							<a href="/admin/churn" className="text-blue-600 underline">Manage churn overrides</a>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}