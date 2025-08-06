'use client';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';
import { ScrollArea } from '@/src/shared/components/ui/scroll-area';
import { Separator } from '@/src/shared/components/ui/separator';

import { SessionData } from '../types';

interface SessionDetailModalProps {
  session: SessionData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionDetailModal({ session, open, onOpenChange }: SessionDetailModalProps) {
  if (!session) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'edited': return 'bg-amber-100 text-amber-800';
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Session Details - {session.id}</DialogTitle>
          <DialogDescription>
            {session.patientInitials} • {new Date(session.dateTime).toLocaleString('en-NZ')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            
            {/* Session Metadata */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Template</p>
                  <p className="text-base text-gray-900">{session.template}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="text-base text-gray-900">{session.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Generation Time</p>
                  <p className="text-base text-gray-900">{session.generationTime} seconds</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusColor(session.status)}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Satisfaction</p>
                  <div className="flex items-center gap-1">
                    {renderStars(session.satisfaction)}
                    <span className="ml-2 text-sm text-gray-600">
                      ({session.satisfaction}/5)
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Consent</p>
                  <span className={`text-sm ${session.consent ? 'text-green-600' : 'text-red-600'}`}>
                    {session.consent ? '✓ Obtained' : '✗ Not obtained'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Transcript Section */}
            {session.transcript && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Transcript</h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {session.transcript}
                  </pre>
                </div>
              </div>
            )}

            <Separator />

            {/* Final Note Section */}
            {session.finalNote && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Final Clinical Note</h3>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900">
                    {session.finalNote}
                  </pre>
                </div>
              </div>
            )}

            {/* Performance Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Summary</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-500">Processing Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {session.generationTime}s
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-500">Completion Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {session.completionTime} min
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-500">Efficiency</p>
                  <p className="text-lg font-semibold text-green-600">
                    {session.status === 'completed' ? 'Optimal' : 'Needs Review'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => navigator.clipboard.writeText(session.id)}>
            Copy Session ID
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}