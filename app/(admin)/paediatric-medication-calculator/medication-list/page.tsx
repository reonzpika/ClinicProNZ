"use client";

import { useEffect, useMemo, useState } from 'react';

import { AdminOnly } from '@/src/shared/components/RoleGuard';
import { Button } from '@/src/shared/components/ui/button';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';

type Med = {
  id: string;
  name: string;
  slug: string;
  nzfUrl: string;
  active: boolean;
  data: any;
};

export default function MedicationListPage() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Med[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Partial<Med>>({ active: true, data: {} });

  const load = async () => {
    const res = await fetch(`/api/admin/paediatric-medications${query ? `?query=${encodeURIComponent(query)}` : ''}`);
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => items, [items]);

  const onCreate = async () => {
    const res = await fetch('/api/admin/paediatric-medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setIsOpen(false);
      setForm({ active: true, data: {} });
      await load();
    }
  };

  return (
    <AdminOnly fallback={<div className="p-6">Admin access required</div>}>
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Paediatric medications</h1>
        <div className="mb-4 flex items-end gap-2">
          <div className="flex-1">
            <Label>Search</Label>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or slug" />
          </div>
          <Button onClick={load}>Search</Button>
          <Button onClick={() => setIsOpen(true)} variant="secondary">New</Button>
        </div>

        <div className="overflow-hidden rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Slug</th>
                <th className="px-3 py-2 text-left">NZF</th>
                <th className="px-3 py-2 text-left">Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-3 py-2">{m.name}</td>
                  <td className="px-3 py-2">{m.slug}</td>
                  <td className="px-3 py-2"><a className="text-blue-600 underline" href={m.nzfUrl} target="_blank" rel="noreferrer">link</a></td>
                  <td className="px-3 py-2">{m.active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">No medications</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New medication</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug || ''} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
              <div>
                <Label>NZF URL</Label>
                <Input value={form.nzfUrl || ''} onChange={(e) => setForm((f) => ({ ...f, nzfUrl: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={onCreate}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminOnly>
  );
}
