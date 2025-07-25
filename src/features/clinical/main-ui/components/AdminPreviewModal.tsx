import { AlertCircle, CheckCircle, Edit3 } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';
import { Textarea } from '@/src/shared/components/ui/textarea';

type AdminPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  structuredContent: string;
  originalContent: string;
  onApprove: (approvedContent: string, wasEdited: boolean) => void;
  isLoading?: boolean;
};

export function AdminPreviewModal({
  isOpen,
  onClose,
  structuredContent,
  originalContent,
  onApprove,
  isLoading = false,
}: AdminPreviewModalProps) {
  const [editedContent, setEditedContent] = useState(structuredContent);
  const [isEditing, setIsEditing] = useState(false);

  const hasChanges = editedContent !== structuredContent;

  const handleApprove = () => {
    onApprove(editedContent, hasChanges);
  };

  const handleReset = () => {
    setEditedContent(structuredContent);
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="size-5" />
            Admin Content Review
            <Badge variant="secondary" className="ml-2">
              Admin Preview Mode
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review and optionally edit the AI-structured content before generating clinical notes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {/* Content Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>
              Original:
              {originalContent.length}
              {' '}
              chars
            </span>
            <span>
              Structured:
              {structuredContent.length}
              {' '}
              chars
            </span>
            {hasChanges && (
              <span className="font-medium text-orange-600">
                Edited:
                {' '}
                {editedContent.length}
                {' '}
                chars
              </span>
            )}
          </div>

          {/* Content Editor */}
          <div className="min-h-0 flex-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Structured Content</span>
              <div className="flex gap-2">
                {!isEditing
                  ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="mr-1 size-3" />
                        Edit
                      </Button>
                    )
                  : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        disabled={!hasChanges}
                      >
                        Reset
                      </Button>
                    )}
              </div>
            </div>

            {isEditing
              ? (
                  <Textarea
                    value={editedContent}
                    onChange={e => setEditedContent(e.target.value)}
                    className="h-[400px] resize-none font-mono text-sm"
                    placeholder="Edit the structured content..."
                  />
                )
              : (
                  <div className="h-[400px] overflow-y-auto rounded-md border bg-muted/30 p-3">
                    <pre className="whitespace-pre-wrap text-sm">{editedContent}</pre>
                  </div>
                )}
          </div>

          {/* Change Indicator */}
          {hasChanges && (
            <div className="flex items-center gap-2 rounded bg-orange-50 p-2 text-sm text-orange-600">
              <AlertCircle className="size-4" />
              Content has been modified
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <div className="flex w-full gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <CheckCircle className="size-4" />
              {isLoading ? 'Processing...' : 'Approve & Generate Notes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
