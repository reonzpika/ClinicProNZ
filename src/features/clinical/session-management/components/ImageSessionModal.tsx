'use client';

import { Calendar, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';
import { Input } from '@/src/shared/components/ui/input';
import { usePatientSessions } from '@/src/features/clinical/session-management/hooks/usePatientSessions';

export type ImageSessionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSessionSelected: (id: string) => void;
};

function formatNzDate(dateString?: string) {
  const date = new Date(dateString || new Date());
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '';
  return {
    date: `${get('day')}/${get('month')}/${get('year')}`,
    time: `${get('hour')}:${get('minute')}`,
  };
}

export const ImageSessionModal: React.FC<ImageSessionModalProps> = ({ isOpen, onClose, onSessionSelected }) => {
  const { sessions, create, rename, remove, removeAll, refetch } = usePatientSessions();
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [pendingName, setPendingName] = useState('');

  useEffect(() => {
    if (isOpen) refetch();
  }, [isOpen, refetch]);

  const filtered = useMemo(() => sessions.filter(s => (s.patientName || '').toLowerCase().includes(search.toLowerCase())), [sessions, search]);

  const sorted = useMemo(() => filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [filtered]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col border border-slate-200 bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Patient Sessions
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Search and Create */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search sessions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="New patient name"
                value={pendingName}
                onChange={e => setPendingName(e.target.value)}
              />
              <Button
                onClick={async () => {
                  const name = pendingName.trim();
                  if (!name) return;
                  setIsCreating(true);
                  try {
                    const s = await create.mutateAsync(name);
                    setPendingName('');
                    onSessionSelected(s.id);
                    onClose();
                  } catch {}
                  setIsCreating(false);
                }}
                disabled={isCreating}
              >
                {isCreating ? (
                  <span className="inline-flex items-center gap-1">
                    <RefreshCw className="size-3 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Plus className="size-4" />
                    Create
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Sessions */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {sorted.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No patient sessions found</div>
            ) : (
              sorted.map((s) => {
                const nz = formatNzDate(s.createdAt);
                return (
                  <div key={s.id} className="rounded-lg border p-4 hover:border-gray-300 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="truncate font-medium text-gray-900">{s.patientName || 'Untitled Session'}</h3>
                        </div>
                        <div className="mb-2 flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            <span>{nz.date}</span>
                          </div>
                          <span>{nz.time}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <Button onClick={() => { onSessionSelected(s.id); onClose(); }} size="sm" variant="outline">Select</Button>
                        <Button
                          onClick={async () => { try { await remove.mutateAsync(s.id); } catch {} }}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
