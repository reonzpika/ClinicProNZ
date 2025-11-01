/**
 * Commit Dialog Component
 * 
 * Confirms commit of images to encounter with options for:
 * - Inbox routing (recipient selection)
 * - Task creation (assignee, due date)
 */

'use client';

import { useState } from 'react';
import { Check, Loader2, X, Inbox, ListTodo } from 'lucide-react';
import { useCommit } from '../../hooks/useCommit';
import { useImageWidgetStore } from '../../stores/imageWidgetStore';
import { Button } from '@/src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';

interface CommitDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommitDialog({ isOpen, onClose }: CommitDialogProps) {
  const {
    sessionImages,
    selectedImageIds,
    capabilities,
    encounterContext,
  } = useImageWidgetStore();
  
  const commitMutation = useCommit();
  
  const [inboxEnabled, setInboxEnabled] = useState(false);
  const [inboxRecipientId, setInboxRecipientId] = useState('');
  const [inboxNote, setInboxNote] = useState('');
  
  const [taskEnabled, setTaskEnabled] = useState(false);
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskNote, setTaskNote] = useState('');
  
  // Get images to commit
  const imagesToCommit = sessionImages.filter((img) =>
    selectedImageIds.includes(img.id) && img.status !== 'committed'
  );
  
  const handleCommit = async () => {
    if (imagesToCommit.length === 0) {
      return;
    }
    
    // Update commit options for selected images
    imagesToCommit.forEach((img) => {
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
    
    // Commit
    try {
      await commitMutation.mutateAsync(selectedImageIds);
      onClose();
    } catch (err) {
      // Error handled by mutation
    }
  };
  
  if (!capabilities) {
    return null;
  }
  
  const inboxRecipients = capabilities.recipients?.inbox || [];
  const taskAssignees = capabilities.recipients?.tasks || [];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Commit Images to Encounter</DialogTitle>
          <DialogDescription>
            {encounterContext && (
              <span>
                Patient: {encounterContext.patientName || encounterContext.patientId}
                {' • '}
                Encounter: {encounterContext.encounterId}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Images Summary */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              {imagesToCommit.length} image{imagesToCommit.length === 1 ? '' : 's'} selected
            </p>
            <div className="grid grid-cols-4 gap-2">
              {imagesToCommit.slice(0, 8).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded border">
                  <img
                    src={img.thumbnail || img.preview}
                    alt=""
                    className="size-full object-cover"
                  />
                  {img.metadata.laterality && (
                    <span className="absolute bottom-1 left-1 rounded bg-purple-500 px-1 py-0.5 text-[9px] font-medium text-white">
                      {img.metadata.laterality.display}
                    </span>
                  )}
                </div>
              ))}
              {imagesToCommit.length > 8 && (
                <div className="flex aspect-square items-center justify-center rounded border bg-slate-100 text-sm text-slate-600">
                  +{imagesToCommit.length - 8}
                </div>
              )}
            </div>
          </div>
          
          {/* Inbox Options */}
          {capabilities.features.images.inbox.enabled && (
            <div className="rounded-lg border border-slate-200 p-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inboxEnabled}
                  onChange={(e) => setInboxEnabled(e.target.checked)}
                  className="size-4"
                />
                <Inbox className="size-5 text-slate-600" />
                <span className="font-medium text-slate-900">Send to Inbox</span>
              </label>
              
              {inboxEnabled && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label htmlFor="inbox-recipient" className="mb-1 block text-xs font-medium text-slate-700">
                      Recipient
                    </label>
                    <select
                      id="inbox-recipient"
                      value={inboxRecipientId}
                      onChange={(e) => setInboxRecipientId(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select recipient...</option>
                      {inboxRecipients.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.display} ({r.type})
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
                      onChange={(e) => setInboxNote(e.target.value)}
                      placeholder="Optional message..."
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Task Options */}
          {capabilities.features.images.tasks.enabled && (
            <div className="rounded-lg border border-slate-200 p-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={taskEnabled}
                  onChange={(e) => setTaskEnabled(e.target.checked)}
                  className="size-4"
                />
                <ListTodo className="size-5 text-slate-600" />
                <span className="font-medium text-slate-900">Create Task</span>
              </label>
              
              {taskEnabled && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label htmlFor="task-assignee" className="mb-1 block text-xs font-medium text-slate-700">
                      Assignee
                    </label>
                    <select
                      id="task-assignee"
                      value={taskAssigneeId}
                      onChange={(e) => setTaskAssigneeId(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select assignee...</option>
                      {taskAssignees.map((a) => (
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
                      onChange={(e) => setTaskDue(e.target.value)}
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
                      onChange={(e) => setTaskNote(e.target.value)}
                      placeholder="Task description..."
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            disabled={commitMutation.isPending}
          >
            <X className="mr-2 size-4" />
            Cancel
          </Button>
          
          <Button
            onClick={handleCommit}
            disabled={commitMutation.isPending || imagesToCommit.length === 0}
          >
            {commitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Committing...
              </>
            ) : (
              <>
                <Check className="mr-2 size-4" />
                Commit {imagesToCommit.length} Image{imagesToCommit.length === 1 ? '' : 's'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
