'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeaders } from '@/src/shared/utils';

export default function ChurnOverridesClient() {
	const { userId } = useAuth();
	const { getUserTier } = useClerkMetadata();
	const tier = getUserTier();

	const [loading, setLoading] = useState(false);
	const [overrides, setOverrides] = useState<any[]>([]);

	const [stripeCustomerId, setStripeCustomerId] = useState('');
	const [customUserId, setCustomUserId] = useState('');
	const [status, setStatus] = useState('churned');
	const [effectiveDate, setEffectiveDate] = useState('');
	const [reason, setReason] = useState('');

	async function fetchOverrides() {
		setLoading(true);
		try {
			const res = await fetch('/api/investor/churn', {
				headers: createAuthHeaders(userId, tier),
			});
			if (res.ok) {
				const data = await res.json();
				setOverrides(data.overrides || []);
			}
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchOverrides();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!status || !effectiveDate) return;
		setLoading(true);
		try {
			const res = await fetch('/api/investor/churn', {
				method: 'POST',
				headers: createAuthHeaders(userId, tier),
				body: JSON.stringify({
					userId: customUserId || undefined,
					stripeCustomerId: stripeCustomerId || undefined,
					status,
					reason: reason || undefined,
					effectiveDate,
					source: 'manual',
				}),
			});
			if (res.ok) {
				setStripeCustomerId('');
				setCustomUserId('');
				setStatus('churned');
				setEffectiveDate('');
				setReason('');
				await fetchOverrides();
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Add Churn Override</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="md:col-span-2">
							<Label htmlFor="stripeCustomerId">Stripe Customer ID</Label>
							<Input id="stripeCustomerId" placeholder="cus_..." value={stripeCustomerId} onChange={e => setStripeCustomerId(e.target.value)} />
						</div>
						<div>
							<Label htmlFor="userId">User ID (optional)</Label>
							<Input id="userId" placeholder="user_..." value={customUserId} onChange={e => setCustomUserId(e.target.value)} />
						</div>
						<div>
							<Label htmlFor="status">Status</Label>
							<Input id="status" placeholder="active | churned" value={status} onChange={e => setStatus(e.target.value)} />
						</div>
						<div>
							<Label htmlFor="effectiveDate">Effective Date</Label>
							<Input id="effectiveDate" type="datetime-local" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} />
						</div>
						<div className="md:col-span-2">
							<Label htmlFor="reason">Reason</Label>
							<Input id="reason" placeholder="optional" value={reason} onChange={e => setReason(e.target.value)} />
						</div>
						<div className="md:col-span-2">
							<Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Overrides</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead className="bg-gray-100">
								<tr>
									<th className="px-3 py-2 text-left">Effective Date</th>
									<th className="px-3 py-2 text-left">Status</th>
									<th className="px-3 py-2 text-left">Stripe Customer ID</th>
									<th className="px-3 py-2 text-left">User ID</th>
									<th className="px-3 py-2 text-left">Reason</th>
								</tr>
							</thead>
							<tbody>
								{overrides.map((o) => (
									<tr key={o.id} className="border-b last:border-0">
										<td className="px-3 py-2">{o.effectiveDate}</td>
										<td className="px-3 py-2">{o.status}</td>
										<td className="px-3 py-2">{o.stripeCustomerId}</td>
										<td className="px-3 py-2">{o.userId}</td>
										<td className="px-3 py-2">{o.reason}</td>
									</tr>
								))}
								{!overrides.length && (
									<tr>
										<td className="px-3 py-4 text-gray-500" colSpan={5}>{loading ? 'Loading…' : 'No overrides yet'}</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}