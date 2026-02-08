'use client';

import { useState } from 'react';

export default function OpenmailerImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [listName, setListName] = useState('pho-contacts');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('listName', listName);
      const res = await fetch('/api/openmailer/subscribers/import', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: 0,
        failed: 0,
      });
      alert(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Import subscribers</h1>
      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-gray-600">
          CSV columns: email, name, organization (or Email, Name, Organization)
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              CSV file
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              List name
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. pho-contacts"
            />
          </div>
          <button
            type="submit"
            disabled={!file || loading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            {loading ? 'Importing…' : 'Import'}
          </button>
        </form>
        {result && (
          <div className="mt-4 rounded bg-green-50 p-4 text-sm">
            <p className="font-medium text-green-800">Import complete</p>
            <p className="text-green-700">
              Success: {result.success} · Failed: {result.failed}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
