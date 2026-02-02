'use client';

import { useState } from 'react';
import { Copy, Mail, MessageSquare } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/src/shared/components/ui/dialog';
import { trackShare } from './trackShare';

const SHARE_TEXT =
  'Photo to desktop in 30 seconds. Always JPEG, auto-resized. Saves >10 minutes per referral. Free for GPs.';

export interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  location: string;
  userId: string;
  onShareComplete?: () => void;
}

export function ShareModal({
  open,
  onOpenChange,
  shareUrl,
  location,
  userId,
  onShareComplete,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      await trackShare(userId, location, 'copy_link');
      onShareComplete?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`${SHARE_TEXT}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    trackShare(userId, location, 'whatsapp');
    onShareComplete?.();
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Tool for referral photos (saves >10 min)');
    const body = encodeURIComponent(
      `Hi,\n\nI just started using ClinicPro for referral photos - it's been a game-changer. No more emailing photos to myself, resizing, re-uploading. Photo to desktop in 30 seconds, always as JPEG. Saves me >10 minutes per referral. Free to use, built by a NZ GP.\n\nTry it: ${shareUrl}\n\nCheers`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    trackShare(userId, location, 'email');
    onShareComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share ClinicPro with Colleagues</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Help GPs stop wasting &gt;10 minutes per referral on the email-resize-upload
          workflow.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={handleEmail}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
        </div>
        <div className="text-sm text-muted-foreground">Or copy link</div>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg font-mono text-sm"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {copied ? (
              <>Copied</>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
