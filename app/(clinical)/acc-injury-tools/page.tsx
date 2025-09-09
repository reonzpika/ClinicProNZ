'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useAuth } from '@clerk/nextjs';
import React, { useMemo, useState } from 'react';

import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { createAuthHeaders } from '@/src/shared/utils';

export default function AccInjuryToolsPage() {
	const { userId } = useAuth();
	const [injuries, setInjuries] = useState<string[]>(['']);
	const [job, setJob] = useState('');
	const [employerName, setEmployerName] = useState('');
	const [results, setResults] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const sessionId = useMemo(() => Math.random().toString(36).slice(2), []);

	const headers = createAuthHeaders(userId, undefined);

	const runAll = async () => {
		setLoading(true);
		try {
			const [injuryRes, jobRes, empRes] = await Promise.all([
				fetch('/api/tools/injury-codes', { method: 'POST', headers, body: JSON.stringify({ injuries: injuries.filter(Boolean), sessionId }) }).then(r => r.json()),
				job ? fetch('/api/tools/job-code', { method: 'POST', headers, body: JSON.stringify({ job, sessionId }) }).then(r => r.json()) : Promise.resolve(null),
				employerName ? fetch('/api/tools/employer-lookup', { method: 'POST', headers, body: JSON.stringify({ employerName, sessionId }) }).then(r => r.json()) : Promise.resolve(null),
			]);
			setResults({ injuryRes, jobRes, empRes });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container size="fluid" className="py-6">
			<h1 className="mb-4 text-2xl font-bold">ACC Injury Tools</h1>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Injuries</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{injuries.map((val, i) => (
							<div key={i} className="flex gap-2">
								<input className="flex-1 rounded border px-2 py-1 text-sm" value={val} onChange={e => {
									const next = injuries.slice();
									next[i] = e.target.value;
									setInjuries(next);
								}} placeholder="e.g., Right ankle sprain after inversion injury..." />
								<Button variant="outline" onClick={() => setInjuries(injuries.filter((_, idx) => idx !== i))}>Remove</Button>
							</div>
						))}
						<Button variant="ghost" onClick={() => setInjuries([...injuries, ''])}>Add Injury</Button>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Job and Employer</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<input className="w-full rounded border px-2 py-1 text-sm" value={job} onChange={e => setJob(e.target.value)} placeholder="Job description (e.g., warehouse picker)" />
						<input className="w-full rounded border px-2 py-1 text-sm" value={employerName} onChange={e => setEmployerName(e.target.value)} placeholder="Employer business name" />
						<Button onClick={runAll} disabled={loading || injuries.every(i => !i)}>{loading ? 'Processing...' : 'Process'}</Button>
					</CardContent>
				</Card>
			</div>
			{results && (
				<Card className="mt-4">
					<CardHeader>
						<CardTitle>Results</CardTitle>
					</CardHeader>
					<CardContent>
						<pre className="whitespace-pre-wrap text-xs">{JSON.stringify(results, null, 2)}</pre>
					</CardContent>
				</Card>
			)}
		</Container>
	);
}