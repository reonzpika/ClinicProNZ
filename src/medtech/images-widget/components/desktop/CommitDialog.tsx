/**
 * Commit Dialog Component
 *
 * Simplified form-only dialog for inbox/task details
 */

'use client';

import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';

import { useImageWidgetStore } from '../../stores/imageWidgetStore';

type CommitDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  inboxEnabled: boolean;
  taskEnabled: boolean;
  uncommittedCount: number;
};

export function CommitDialog({
  isOpen,
  onClose,
  inboxEnabled,
  taskEnabled,
  uncommittedCount,
}: CommitDialogProps) {
  const {
    capabilities,
    encounterContext,
  } = useImageWidgetStore();

  const [inboxRecipientId, setInboxRecipientId] = useState('');
  const [inboxNote, setInboxNote] = useState('');

  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskNote, setTaskNote] = useState('');

  const handleDone = () => {
    // Save inbox/task options to store for the commit
    if (inboxEnabled || taskEnabled) {
      const uncommittedImages = useImageWidgetStore.getState().sessionImages.filter(
        img => img.status !== 'committed',
      );

      uncommittedImages.forEach((img) => {
        useImageWidgetStore.getState().updateCommitOptions(img.id, {
          alsoInbox: inboxEnabled
            ? {
                enabled: true,
                recipientId: inboxRecipientId,
                note: inboxNote,
              }
            : undefined,
          alsoTask: taskEnabled
            ? {
                enabled: true,
                assigneeId: taskAssigneeId,
                due: taskDue,
                note: taskNote,
              }
            : undefined,
        });
      });
    }

    // Close modal (commit will happen in main page after close)
    onClose();
  };

  if (!capabilities) {
    return null;
  }

  const inboxRecipients = capabilities.recipients?.inbox || [];
  const taskAssignees = capabilities.recipients?.tasks || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {inboxEnabled && taskEnabled
              ? 'Inbox & Task Details'
              : inboxEnabled
                ? 'Inbox Details'
                : 'Task Details'}
          </DialogTitle>
          <DialogDescription>
            {encounterContext && (
              <span>
                Committing
{' '}
{uncommittedCount}
{' '}
image
{uncommittedCount === 1 ? '' : 's'}
{' '}
to encounter
{' '}
{encounterContext.encounterId}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Inbox Options */}
          {inboxEnabled && capabilities.features.images.inbox.enabled && (
            <div className="space-y-3">
              <div>
                <label htmlFor="inbox-recipient" className="mb-1 block text-xs font-medium text-slate-700">
                  Recipient
                </label>
                <select
                  id="inbox-recipient"
                  value={inboxRecipientId}
                  onChange={e => setInboxRecipientId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Select recipient...</option>
                  {inboxRecipients.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.display}
{' '}
(
{r.type}
)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="inbox-note" className="mb-1 block text-xs font-medium text-slate-700">
                  Note
                </label>
                <textarea
                  id="inbox-note"
                  value={inboxNote}
                  onChange={e => setInboxNote(e.target.value)}
                  placeholder="Optional message..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Task Options */}
          {taskEnabled && capabilities.features.images.tasks.enabled && (
            <div className="space-y-3">
              <div>
                <label htmlFor="task-assignee" className="mb-1 block text-xs font-medium text-slate-700">
                  Assignee
                </label>
                <select
                  id="task-assignee"
                  value={taskAssigneeId}
                  onChange={e => setTaskAssigneeId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Select assignee...</option>
                  {taskAssignees.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.display}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="task-due" className="mb-1 block text-xs font-medium text-slate-700">
                  Due Date
                </label>
                <input
                  id="task-due"
                  type="date"
                  value={taskDue}
                  onChange={e => setTaskDue(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="task-note" className="mb-1 block text-xs font-medium text-slate-700">
                  Note
                </label>
                <textarea
                  id="task-note"
                  value={taskNote}
                  onChange={e => setTaskNote(e.target.value)}
                  placeholder="Task description..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleDone}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
