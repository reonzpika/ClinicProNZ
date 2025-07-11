'use client';
/* eslint-disable react-dom/no-missing-button-type */
import { SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { FeedbackModal } from '@/src/features/marketing/roadmap/components/FeedbackModal';
import { submitFeatureRequest } from '@/src/features/marketing/roadmap/roadmap-service';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/src/shared/components/ui/dialog';

export const Header = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | undefined>();
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleFeedback = async (data: { idea: string; details?: string; email?: string }) => {
    setFeedbackLoading(true);
    setFeedbackError(undefined);
    setFeedbackSuccess(false);
    const res = await submitFeatureRequest(data);
    if (res.success) {
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackModalOpen(false), 1200);
    } else {
      setFeedbackError(res.message || 'Something went wrong');
    }
    setFeedbackLoading(false);
  };

  return (
    <header className="w-full border-b border-slate-200 bg-slate-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-lg font-semibold text-slate-700">
            MedScribe NZ
          </Link>
          <div className="hidden items-center space-x-4 md:flex">
            <Link href="/landing-page" className="text-sm text-slate-600 hover:text-slate-800">
              Digital Scribing
            </Link>
            <Link href="/consultation" className="text-sm text-slate-600 hover:text-slate-800">
              Clinical Notes
            </Link>
            <button
              className="m-0 cursor-pointer border-none bg-transparent p-0 text-sm text-slate-600 hover:text-slate-800"
              onClick={(e) => {
                if (!isSignedIn) {
                  e.preventDefault();
                  setShowAuthModal(true);
                } else {
                  router.push('/templates');
                }
              }}
            >
              Note Templates
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden items-center space-x-4 md:flex">
            <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-800">
              Pricing
            </Link>
            <Link href="/about" className="text-sm text-slate-600 hover:text-slate-800">
              About
            </Link>
            <Link href="/roadmap" className="text-sm text-slate-600 hover:text-slate-800">
              Updates
            </Link>
            <Link href="/privacy-info" className="text-sm text-slate-600 hover:text-slate-800">
              Privacy
            </Link>
          </div>
          <button
            className="rounded-md border border-slate-300 bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200"
            onClick={() => {
              setFeedbackModalOpen(true);
              setFeedbackSuccess(false);
              setFeedbackError(undefined);
            }}
          >
            📝 Feedback
          </button>
          {isSignedIn
            ? (
                <UserButton afterSignOutUrl="/" />
              )
            : (
                <div className="space-x-2">
                  <SignInButton mode="modal">
                    <button className="rounded-md border border-slate-400 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-md bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-800">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
        </div>
      </div>
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="border border-slate-200 bg-white shadow-lg">
          <DialogHeader>
            <h2 className="text-center text-sm font-semibold text-slate-900">You need to sign in or sign up to access note templates.</h2>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-row justify-center gap-3">
            <SignInButton mode="modal">
              <button className="rounded-md border border-slate-400 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-md bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-800">Sign Up</button>
            </SignUpButton>
            <button className="ml-2 rounded-md border border-slate-300 px-3 py-1 text-sm" onClick={() => setShowAuthModal(false)}>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <FeedbackModal
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleFeedback}
        loading={feedbackLoading}
        error={feedbackError}
        success={feedbackSuccess}
      />
    </header>
  );
};
