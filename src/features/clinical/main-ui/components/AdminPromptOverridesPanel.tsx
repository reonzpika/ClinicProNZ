"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { Button } from '@/src/shared/components/ui/button';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';

function tokenEstimate(text: string): number {
  // rough: 4 chars/token
  return Math.ceil((text || '').length / 4);
}

export function AdminPromptOverridesPanel() {
  const { hasTier } = useClerkMetadata();
  const isAdmin = hasTier('admin');

  // Read current consultation data for output preview
  const {
    transcription,
    typedInput,
    getCompiledConsultationText,
    templateId,
  } = useConsultationStores();

  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [activeSelfVersionId, setActiveSelfVersionId] = useState<string | null>(null);
  const [activeGlobalVersionId, setActiveGlobalVersionId] = useState<string | null>(null);

  const [systemText, setSystemText] = useState('');
  const [userText, setUserText] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  // Enlarge editor modals
  const [systemEditorOpen, setSystemEditorOpen] = useState(false);
  const [userEditorOpen, setUserEditorOpen] = useState(false);

  // Output preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState('');
  const [previewSystem, setPreviewSystem] = useState('');
  const [previewUser, setPreviewUser] = useState('');

  // Insert base placeholders into editors
  const [insertLoading, setInsertLoading] = useState<'none' | 'system' | 'user'>('none');

  // Base prompts preview state (deprecated UI)

  // Version view modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewVersion, setViewVersion] = useState<any | null>(null);

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

  const handlePreviewOutput = async () => {
    // Build request from current consultation data; do not store to session (client-side)
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewText('');
    setPreviewSystem('');
    setPreviewUser('');
    try {
      const body: any = {
        templateId,
        additionalNotes: getCompiledConsultationText(),
        transcription: transcription?.transcript || '',
        typedInput: typedInput || '',
        generate: true,
      };
      const res = await fetch('/api/admin/prompts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to generate preview');
      setPreviewSystem(data?.effective?.system || '');
      setPreviewUser(data?.effective?.user || '');
      setPreviewText(data?.note || '');
    } catch (e: any) {
      setPreviewError(e?.message || 'Preview failed');
    } finally {
      setPreviewLoading(false);
    }
  };

  const insertSystemBase = async () => {
    if (!templateId) return;
    setInsertLoading('system');
    try {
      const res = await fetch('/api/admin/prompts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, placeholdersOnly: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to fetch base system prompt');
      setSystemText(data?.placeholders?.system || '');
    } catch {
      // no-op
    } finally {
      setInsertLoading('none');
    }
  };

  const insertUserBase = async () => {
    if (!templateId) return;
    setInsertLoading('user');
    try {
      const res = await fetch('/api/admin/prompts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, placeholdersOnly: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to fetch base user prompt');
      setUserText(data?.placeholders?.user || '');
    } catch {
      // no-op
    } finally {
      setInsertLoading('none');
    }
  };

  // removed legacy base prompts dialog trigger; insertion happens inside editors

  // removed: show current prompts (me/global) per requirements

  return (
    <div className="rounded-md border border-slate-200 p-3">
      <div className="mb-2 text-sm font-semibold text-slate-700">Admin · Note Prompt Overrides</div>

      <div className="mb-3 grid grid-cols-1 gap-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>System override (replace) — must include {'{{TEMPLATE}}'}</span>
            <Button type="button" variant="secondary" className="h-7 px-2 text-[11px]" onClick={() => setSystemEditorOpen(true)}>Enlarge</Button>
          </div>
          <Textarea value={systemText} onChange={e => setSystemText(e.target.value)} placeholder="... include {{TEMPLATE}} ..." className="min-h-[120px]" />
          <div className="mt-1 text-[11px] text-slate-500">~{tokenEstimate(systemText)} tokens</div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>User override (replace) — must include {'{{DATA}}'}</span>
            <Button type="button" variant="secondary" className="h-7 px-2 text-[11px]" onClick={() => setUserEditorOpen(true)}>Enlarge</Button>
          </div>
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
          <Button type="button" variant="outline" onClick={handlePreviewOutput} disabled={previewLoading || !templateId}>Preview Output</Button>
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
                <Button type="button" variant="secondary" onClick={() => { setViewVersion(v); setViewOpen(true); }}>View</Button>
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

      {/* Output Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-sm">Preview · Generated Note (not saved)</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {previewError && (<div className="mb-2 text-xs text-red-600">{previewError}</div>)}
            <div className="mb-2">
              <div className="mb-1 text-xs font-medium text-slate-700">System (Effective)</div>
              <Textarea value={previewSystem} readOnly className="min-h-[120px]" placeholder={previewLoading ? 'Loading…' : 'No content'} />
            </div>
            <div className="mb-2">
              <div className="mb-1 text-xs font-medium text-slate-700">User (Effective)</div>
              <Textarea value={previewUser} readOnly className="min-h-[120px]" placeholder={previewLoading ? 'Loading…' : 'No content'} />
            </div>
            <Textarea value={previewText} readOnly className="min-h-[320px]" placeholder={previewLoading ? 'Generating…' : 'No content'} />
            <div className="mt-2 flex gap-2">
              <Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(previewText || '')} disabled={!previewText}>Copy</Button>
              <Button type="button" onClick={() => setPreviewOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enlarge System Editor */}
      <Dialog open={systemEditorOpen} onOpenChange={setSystemEditorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit System Override ({'{{TEMPLATE}}'})</DialogTitle>
          </DialogHeader>
          <Textarea value={systemText} onChange={e => setSystemText(e.target.value)} className="min-h-[420px]" />
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="secondary" onClick={insertSystemBase} disabled={insertLoading==='system' || !templateId}>
              {insertLoading==='system' ? 'Inserting…' : 'Insert system base'}
            </Button>
            <Button type="button" onClick={() => setSystemEditorOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enlarge User Editor */}
      <Dialog open={userEditorOpen} onOpenChange={setUserEditorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit User Override ({'{{DATA}}'})</DialogTitle>
          </DialogHeader>
          <Textarea value={userText} onChange={e => setUserText(e.target.value)} className="min-h-[420px]" />
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="secondary" onClick={insertUserBase} disabled={insertLoading==='user' || !templateId}>
              {insertLoading==='user' ? 'Inserting…' : 'Insert user base'}
            </Button>
            <Button type="button" onClick={() => setUserEditorOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Base Prompts Dialog removed per requirements */}

      {/* View Version Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-sm">View Saved Version {viewVersion ? `(v${viewVersion.versionNumber})` : ''}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            {viewVersion && (
              <>
                <div>
                  <div className="mb-1 text-xs font-medium text-slate-700">System (Saved)</div>
                  <Textarea value={viewVersion.systemText} readOnly className="min-h-[200px]" />
                  <div className="mt-2 flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(viewVersion.systemText || '')}>Copy System</Button>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium text-slate-700">User (Saved)</div>
                  <Textarea value={viewVersion.userText} readOnly className="min-h-[200px]" />
                  <div className="mt-2 flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(viewVersion.userText || '')}>Copy User</Button>
                    <Button type="button" onClick={() => setViewOpen(false)}>Close</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
