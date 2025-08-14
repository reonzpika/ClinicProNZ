'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeaders } from '@/src/shared/utils';

export default function MarketingSpendClient() {
	const { userId } = useAuth();
	const { getUserTier } = useClerkMetadata();
	const tier = getUserTier();

	const [loading, setLoading] = useState(false);
	const [entries, setEntries] = useState<any[]>([]);

	const [periodStart, setPeriodStart] = useState('');
	const [periodEnd, setPeriodEnd] = useState('');
	const [amount, setAmount] = useState('');
	const [channel, setChannel] = useState('');
	const [notes, setNotes] = useState('');

	async function fetchEntries() {
		setLoading(true);
		try {
			const res = await fetch('/api/investor/marketing-spend', {
				headers: createAuthHeaders(userId, tier),
			});
			if (res.ok) {
				const data = await res.json();
				setEntries(data.entries || []);
			}
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchEntries();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!periodStart || !periodEnd || !amount || !channel) return;
		setLoading(true);
		try {
			const res = await fetch('/api/investor/marketing-spend', {
				method: 'POST',
				headers: createAuthHeaders(userId, tier),
				body: JSON.stringify({
					periodStart,
					periodEnd,
					amountNzd: Number(amount),
					channel,
					notes,
				}),
			});
			if (res.ok) {
				setPeriodStart('');
				setPeriodEnd('');
				setAmount('');
				setChannel('');
				setNotes('');
				await fetchEntries();
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Add Marketing Spend</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="periodStart">Period Start</Label>
							<Input id="periodStart" type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
						</div>
						<div>
							<Label htmlFor="periodEnd">Period End</Label>
							<Input id="periodEnd" type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
						</div>
						<div>
							<Label htmlFor="amount">Amount (NZD)</Label>
							<Input id="amount" type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
						</div>
						<div>
							<Label htmlFor="channel">Channel</Label>
							<Input id="channel" placeholder="ads / content / events / other" value={channel} onChange={e => setChannel(e.target.value)} />
						</div>
						<div className="md:col-span-2">
							<Label htmlFor="notes">Notes</Label>
							<Input id="notes" placeholder="optional" value={notes} onChange={e => setNotes(e.target.value)} />
						</div>
						<div className="md:col-span-2">
							<Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Spend'}</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Entries</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead className="bg-gray-100">
								<tr>
									<th className="px-3 py-2 text-left">Period</th>
									<th className="px-3 py-2 text-left">Amount (NZD)</th>
									<th className="px-3 py-2 text-left">Channel</th>
									<th className="px-3 py-2 text-left">Notes</th>
								</tr>
							</thead>
							<tbody>
								{entries.map((e) => (
									<tr key={e.id} className="border-b last:border-0">
										<td className="px-3 py-2">{e.periodStart} → {e.periodEnd}</td>
										<td className="px-3 py-2">${'{'}(e.amountNzdCents ?? 0) / 100{'}'}</td>
										<td className="px-3 py-2">{e.channel}</td>
										<td className="px-3 py-2">{e.notes}</td>
									</tr>
								))}
								{!entries.length && (
									<tr>
										<td className="px-3 py-4 text-gray-500" colSpan={4}>{loading ? 'Loading…' : 'No entries yet'}</td>
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