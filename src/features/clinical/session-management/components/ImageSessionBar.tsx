'use client';

import { Calendar, ChevronDown, RefreshCw, UserCheck, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';
import { usePatientSessions } from '@/src/features/clinical/session-management/hooks/usePatientSessions';

export type ImageSessionBarProps = {
  selectedSessionId: string | 'none';
  onSwitch: () => void;
  onSelectSession: (id: string | 'none') => void;
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

export const ImageSessionBar: React.FC<ImageSessionBarProps> = ({ selectedSessionId, onSwitch, onSelectSession }) => {
  const { sessions, rename, remove } = usePatientSessions();
  const current = useMemo(() => sessions.find(s => s.id === selectedSessionId), [sessions, selectedSessionId]);

  const [tempName, setTempName] = useState(current?.patientName || '');

  // Keep tempName in sync when selection changes
  const [prevId, setPrevId] = useState<string | 'none'>(selectedSessionId);
  if (prevId !== selectedSessionId) {
    setPrevId(selectedSessionId);
    setTempName(current?.patientName || '');
  }

  const nz = formatNzDate(current?.createdAt);

  return (
    <Card className="border-blue-200 bg-blue-50 shadow-sm">
      <CardContent className="p-3">
        {/* Responsive two-row layout to avoid overlaps */}
        <div className="flex flex-col gap-2">
          {/* Row 1: name + actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <UserCheck className="mt-0.5 size-4 shrink-0 text-blue-600" />
              {current ? (
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={async () => {
                    const name = tempName.trim();
                    if (name && name !== current.patientName) {
                      try { await rename.mutateAsync({ sessionId: current.id, patientName: name }); } catch {}
                    }
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const name = tempName.trim();
                      if (name && current && name !== current.patientName) {
                        try { await rename.mutateAsync({ sessionId: current.id, patientName: name }); } catch {}
                      }
                    }
                  }}
                  className="h-7 flex-1 border-blue-300 bg-blue-50 text-sm font-medium text-blue-800 focus:border-blue-500"
                />
              ) : (
                <div className="text-sm font-medium text-blue-800">No session selected</div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button onClick={onSwitch} size="sm" variant="outline" className="h-8 border-blue-300 px-3 text-xs text-blue-700 hover:bg-blue-100">
                <span className="mr-1">Switch Session</span>
                <ChevronDown className="size-3" />
              </Button>
              {current && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-red-300 px-3 text-xs text-red-700 hover:bg-red-100"
                  onClick={async () => {
                    try { await remove.mutateAsync(current.id); onSelectSession('none'); } catch {}
                  }}
                  disabled={remove.isPending}
                >
                  {remove.isPending ? (
                    <span className="inline-flex items-center gap-1">
                      <RefreshCw className="size-3 animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Trash2 className="size-3" />
                      Delete
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Row 2: date/time */}
          <div className="flex items-center gap-2 text-xs text-blue-600">
            {current && (
              <>
                <Calendar className="size-3" />
                <span className="truncate">{nz.date} • {nz.time}</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
