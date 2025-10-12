"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { Button } from '@/src/shared/components/ui/button';
import { Textarea } from '@/src/shared/components/ui/textarea';

function tokenEstimate(text: string): number {
  // rough: 4 chars/token
  return Math.ceil((text || '').length / 4);
}

export function AdminPromptOverridesPanel() {
  const { hasTier } = useClerkMetadata();
  const isAdmin = hasTier('admin');

  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [activeSelfVersionId, setActiveSelfVersionId] = useState<string | null>(null);
  const [activeGlobalVersionId, setActiveGlobalVersionId] = useState<string | null>(null);

  const [systemText, setSystemText] = useState('');
  const [userText, setUserText] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');

  const canSave = useMemo(() => {
    return systemText.includes('{{TEMPLATE}}') && userText.includes('{{DATA}}') && systemText.length <= 16000 && userText.length <= 16000;
  }, [systemText, userText]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    fetch('/api/admin/prompts', { method: 'GET' })
      .then(async r => r.json())
      .then(data => {
        setVersions(data.versions || []);
        setActiveSelfVersionId(data.activeSelfVersionId || null);
        setActiveGlobalVersionId(data.activeGlobalVersionId || null);
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) return null;

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createVersion', systemText, userText, rating: rating === '' ? undefined : rating, feedback }),
    });
    const data = await res.json();
    if (res.ok) {
      setVersions((prev: any[]) => [data.version, ...prev]);
    }
    setLoading(false);
  };

  const activateSelf = async (versionId: string) => {
    setLoading(true);
    const res = await fetch('/api/admin/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'activateSelf', versionId }),
    });
    if (res.ok) setActiveSelfVersionId(versionId);
    setLoading(false);
  };

  const publishGlobal = async (versionId: string) => {
    if (!confirm('Publish this version to all users?')) return;
    setLoading(true);
    const res = await fetch('/api/admin/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publishGlobal', versionId }),
    });
    if (res.ok) setActiveGlobalVersionId(versionId);
    setLoading(false);
  };

  return (
    <div className="rounded-md border border-slate-200 p-3">
      <div className="mb-2 text-sm font-semibold text-slate-700">Admin · Note Prompt Overrides</div>

      <div className="mb-3 grid grid-cols-1 gap-3">
        <div>
          <div className="mb-1 text-xs font-medium text-slate-600">System override (replace) — must include {{TEMPLATE}}</div>
          <Textarea value={systemText} onChange={e => setSystemText(e.target.value)} placeholder="... include {{TEMPLATE}} ..." className="min-h-[120px]" />
          <div className="mt-1 text-[11px] text-slate-500">~{tokenEstimate(systemText)} tokens</div>
        </div>
        <div>
          <div className="mb-1 text-xs font-medium text-slate-600">User override (replace) — must include {{DATA}}</div>
          <Textarea value={userText} onChange={e => setUserText(e.target.value)} placeholder="... include {{DATA}} ..." className="min-h-[120px]" />
          <div className="mt-1 text-[11px] text-slate-500">~{tokenEstimate(userText)} tokens</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input className="col-span-1 rounded border border-slate-200 p-2 text-xs" placeholder="Rating (1-5)" value={rating} onChange={e => setRating(e.target.value ? Number(e.target.value) : '')} />
          <input className="col-span-2 rounded border border-slate-200 p-2 text-xs" placeholder="Feedback (optional)" value={feedback} onChange={e => setFeedback(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => { setSystemText(''); setUserText(''); setRating(''); setFeedback(''); }}>New</Button>
          <Button type="button" onClick={handleSave} disabled={!canSave || loading}>Save</Button>
        </div>
      </div>

      <div className="mb-2 text-xs font-medium text-slate-600">History</div>
      <div className="space-y-2">
        {versions.map(v => (
          <div key={v.id} className="rounded border border-slate-200 p-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium">v{v.versionNumber} · {new Date(v.createdAt).toLocaleString()}</div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => { setSystemText(v.systemText); setUserText(v.userText); setRating(v.rating ?? ''); setFeedback(v.feedback ?? ''); }}>Load</Button>
                <Button type="button" variant="outline" onClick={() => activateSelf(v.id)} disabled={activeSelfVersionId === v.id}>Activate for me</Button>
                <Button type="button" onClick={() => publishGlobal(v.id)} disabled={activeGlobalVersionId === v.id}>Publish to all</Button>
              </div>
            </div>
            {(v.feedback || v.rating) && (
              <div className="mt-1 text-[11px] text-slate-600">{v.rating ? `Rating: ${v.rating}` : ''} {v.feedback ? `· ${v.feedback}` : ''}</div>
            )}
          </div>
        ))}
        {versions.length === 0 && <div className="text-xs text-slate-500">No versions yet.</div>}
      </div>
    </div>
  );
}
