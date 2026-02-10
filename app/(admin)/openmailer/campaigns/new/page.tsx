'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OpenmailerNewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    subject: '',
    bodyHtml: '',
    listName: 'pho-contacts',
    fromName: 'Dr. Ryo Eguchi',
    fromEmail: 'ryo@clinicpro.co.nz',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/openmailer/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      const campaign = await res.json();
      router.push(`/openmailer/campaigns/${campaign.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create campaign</h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Campaign name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2"
            placeholder="e.g. PHO Outreach – Feb 2026"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Subject line
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2"
            placeholder="e.g. Free tool for referral photos"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email body (HTML). Use
{' '}
{'{{organization}}'}
{' '}
and
{' '}
{'{{unsubscribe_url}}'}
{' '}
for merge fields.
          </label>
          <textarea
            value={form.bodyHtml}
            onChange={e => setForm(f => ({ ...f, bodyHtml: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"
            rows={20}
            placeholder="Paste HTML…"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              From name
            </label>
            <input
              type="text"
              value={form.fromName}
              onChange={e => setForm(f => ({ ...f, fromName: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              From email
            </label>
            <input
              type="email"
              value={form.fromEmail}
              onChange={e => setForm(f => ({ ...f, fromEmail: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Recipient list
          </label>
          <select
            value={form.listName}
            onChange={e => setForm(f => ({ ...f, listName: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="pho-contacts">pho-contacts</option>
            <option value="gp-users">gp-users</option>
            <option value="general">general</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating…' : 'Create campaign'}
        </button>
      </form>
    </div>
  );
}
