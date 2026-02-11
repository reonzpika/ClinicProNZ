'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';

const STORAGE_PREFIX = 'clinicpro_newsletter_';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const DELAY_MS = 10_000;

function getSubscribedKey(storageKey: string) {
  return `${STORAGE_PREFIX}${storageKey}_subscribed`;
}

function getDismissedUntilKey(storageKey: string) {
  return `${STORAGE_PREFIX}${storageKey}_dismissed_until`;
}

export function markNewsletterSubscribed(storageKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getSubscribedKey(storageKey), '1');
  } catch {
    // ignore
  }
}

export type NewsletterPopupProps = {
  storageKey: string;
  subscribeEndpoint: string;
  title: string;
  description: string;
  successMessage: string;
  submitLabel: string;
};

export function NewsletterPopup({
  storageKey,
  subscribeEndpoint,
  title,
  description,
  successMessage,
  submitLabel,
}: NewsletterPopupProps) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const justSubscribedRef = useRef(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(getSubscribedKey(storageKey)) === '1') return;
      const dismissedUntil = window.localStorage.getItem(getDismissedUntilKey(storageKey));
      if (dismissedUntil) {
        const until = Number(dismissedUntil);
        if (Number.isFinite(until) && Date.now() < until) return;
      }
      const t = window.setTimeout(() => {
        setVisible(true);
        justSubscribedRef.current = false;
      }, DELAY_MS);
      return () => window.clearTimeout(t);
    } catch {
      return undefined;
    }
  }, [storageKey]);

  function handleOpenChange(open: boolean) {
    if (!open) {
      if (!justSubscribedRef.current) {
        try {
          window.localStorage.setItem(
            getDismissedUntilKey(storageKey),
            String(Date.now() + SEVEN_DAYS_MS),
          );
        } catch {
          // ignore
        }
      }
      setVisible(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch(subscribeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        markNewsletterSubscribed(storageKey);
        justSubscribedRef.current = true;
        setStatus('success');
        setMessage(successMessage);
        setEmail('');
        setTimeout(() => setVisible(false), 1500);
      } else {
        setStatus('error');
        setMessage(data?.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <Dialog open={visible} onOpenChange={handleOpenChange}>
      <DialogContent
        className="border bg-white shadow-lg sm:max-w-md"
        aria-describedby={visible ? 'newsletter-popup-description' : undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">{title}</DialogTitle>
          <DialogDescription id="newsletter-popup-description" className="text-text-secondary">
            {description}
          </DialogDescription>
        </DialogHeader>
        {status === 'success' ? (
          <p className="text-sm font-medium text-green-700">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newsletter-popup-email" className="text-text-primary">
                Email
              </Label>
              <Input
                id="newsletter-popup-email"
                type="email"
                placeholder="your.email@practice.co.nz"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border-border text-text-primary"
                required
                disabled={status === 'loading'}
                aria-invalid={status === 'error'}
              />
            </div>
            {message && status === 'error' && (
              <p className="text-sm text-red-600" role="alert">
                {message}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Subscribing…' : submitLabel}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
