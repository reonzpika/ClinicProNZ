export type NzbnResult = {
	nzbn: string;
	name: string;
	address?: string;
	status?: string;
};

const NZBN_API_KEY = process.env.NZBN_API_KEY;
const NZBN_API_BASE = process.env.NZBN_API_BASE || 'https://api.business.govt.nz/services/nzbn/v5/';

if (!NZBN_API_KEY) console.warn('NZBN_API_KEY not set. Employer lookup will fail until configured.');

export async function searchNzbnByName(name: string): Promise<NzbnResult[]> {
	if (!NZBN_API_KEY) return [];
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 4000);
	try {
		const url = new URL('search/organisations', NZBN_API_BASE);
		url.searchParams.set('name', name);
		// Other filters as required by NZBN docs can be added here
		const res = await fetch(url.toString(), {
			headers: {
				'Accept': 'application/json',
				'Authorization': `Bearer ${NZBN_API_KEY}`,
			},
			signal: controller.signal,
		});
		if (!res.ok) return [];
		const data: any = await res.json();
		const items: any[] = data?.items || data?.results || [];
		return items.map(it => ({
			nzbn: it.nzbn || it.NZBN || '',
			name: it.entityName || it.name || '',
			address: it.registeredAddress || it.address || undefined,
			status: it.entityStatus || it.status || undefined,
		})).filter(r => r.nzbn && r.name);
	} catch {
		return [];
	} finally {
		clearTimeout(timeout);
	}
}