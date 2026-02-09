'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/shared/components/ui/dialog';

export function AddSubscriberButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    name: '',
    listName: 'pho-contacts',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/openmailer/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          name: form.name.trim() || undefined,
          listName: form.listName,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      setOpen(false);
      setForm({ email: '', name: '', listName: 'pho-contacts' });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add subscriber');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add subscriber
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add subscriber</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="add-email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="add-email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. name@example.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="add-name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="add-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="Optional"
            />
          </div>
          <div>
            <label
              htmlFor="add-list"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              List
            </label>
            <select
              id="add-list"
              value={form.listName}
              onChange={(e) =>
                setForm((f) => ({ ...f, listName: e.target.value }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="pho-contacts">pho-contacts</option>
              <option value="gp-users">gp-users</option>
              <option value="general">general</option>
            </select>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding…' : 'Add'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
