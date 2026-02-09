'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';

type SubscriberRow = {
  id: string;
  email: string;
  name: string | null;
  listName: string;
  status: string;
};

export function SubscriberRowActions({ subscriber }: { subscriber: SubscriberRow }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: subscriber.name ?? '',
    listName: subscriber.listName,
    status: subscriber.status,
  });

  function openEdit() {
    setEditForm({
      name: subscriber.name ?? '',
      listName: subscriber.listName,
      status: subscriber.status,
    });
    setEditOpen(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await fetch(`/api/openmailer/subscribers/${subscriber.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim() || undefined,
          listName: editForm.listName,
          status: editForm.status,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      setEditOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update subscriber');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/openmailer/subscribers/${subscriber.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      setDeleteOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove subscriber');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openEdit}
          className="text-sm text-blue-600 hover:underline"
        >
          Edit
        </button>
        <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialog.Trigger asChild>
            <button
              type="button"
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
            <AlertDialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
              <AlertDialog.Title className="text-lg font-semibold text-gray-900">
                Remove subscriber?
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm text-gray-600">
                This will remove {subscriber.email} from the list. This action
                cannot be undone.
              </AlertDialog.Description>
              <div className="mt-6 flex justify-end gap-2">
                <AlertDialog.Cancel asChild>
                  <button
                    type="button"
                    className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </AlertDialog.Cancel>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:bg-gray-400"
                >
                  {deleteLoading ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit subscriber</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="text"
                value={subscriber.email}
                readOnly
                className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
              />
            </div>
            <div>
              <label
                htmlFor={`edit-name-${subscriber.id}`}
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id={`edit-name-${subscriber.id}`}
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="Optional"
              />
            </div>
            <div>
              <label
                htmlFor={`edit-list-${subscriber.id}`}
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                List
              </label>
              <select
                id={`edit-list-${subscriber.id}`}
                value={editForm.listName}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, listName: e.target.value }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="pho-contacts">pho-contacts</option>
                <option value="gp-users">gp-users</option>
                <option value="general">general</option>
              </select>
            </div>
            <div>
              <label
                htmlFor={`edit-status-${subscriber.id}`}
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id={`edit-status-${subscriber.id}`}
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, status: e.target.value }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="bounced">Bounced</option>
              </select>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {editLoading ? 'Saving…' : 'Save'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
