'use client';

import * as Tabs from '@radix-ui/react-tabs';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';

type BookmarkInstructionsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function BookmarkInstructionsModal({ open, onClose }: BookmarkInstructionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How to Bookmark This Page</DialogTitle>
        </DialogHeader>
        <Tabs.Root defaultValue="chrome" className="mt-4">
          <Tabs.List className="mb-4 flex gap-1 rounded-lg border border-border p-1">
            <Tabs.Trigger
              value="chrome"
              className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-surface data-[state=active]:shadow-sm"
            >
              Chrome/Edge
            </Tabs.Trigger>
            <Tabs.Trigger
              value="safari"
              className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-surface data-[state=active]:shadow-sm"
            >
              Safari
            </Tabs.Trigger>
            <Tabs.Trigger
              value="firefox"
              className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-surface data-[state=active]:shadow-sm"
            >
              Firefox
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="chrome" className="text-sm text-text-secondary">
            <ol className="list-inside list-decimal space-y-2">
              <li>
                Press
{' '}
<kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs">Ctrl+D</kbd>
{' '}
(Windows) or
{' '}
<kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs">⌘+D</kbd>
{' '}
(Mac)
              </li>
              <li>Click &quot;Done&quot; or &quot;Save&quot;</li>
            </ol>
            <p className="mt-3 text-text-tertiary">Or click the star icon in the address bar</p>
          </Tabs.Content>
          <Tabs.Content value="safari" className="text-sm text-text-secondary">
            <ol className="list-inside list-decimal space-y-2">
              <li>
Press
<kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs">⌘+D</kbd>
              </li>
              <li>Choose &quot;Favorites&quot; or &quot;Bookmarks&quot;</li>
              <li>Click &quot;Add&quot;</li>
            </ol>
          </Tabs.Content>
          <Tabs.Content value="firefox" className="text-sm text-text-secondary">
            <ol className="list-inside list-decimal space-y-2">
              <li>
                Press
{' '}
<kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs">Ctrl+D</kbd>
{' '}
(Windows) or
{' '}
<kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs">⌘+D</kbd>
{' '}
(Mac)
              </li>
              <li>Click &quot;Done&quot;</li>
            </ol>
          </Tabs.Content>
        </Tabs.Root>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark"
        >
          Got it
        </button>
      </DialogContent>
    </Dialog>
  );
}
