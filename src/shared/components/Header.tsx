'use client';
/* eslint-disable react-dom/no-missing-button-type */
import { SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { FeedbackModal } from '@/features/roadmap/components/FeedbackModal';
import { submitFeatureRequest } from '@/features/roadmap/roadmap-service';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/shared/components/ui/dialog';

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
    <header className="w-full border-b">
      <div className="container mx-auto flex items-center justify-between px-2 py-1">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-base font-bold">
            ConsultAI NZ
          </Link>
          <div className="hidden items-center space-x-2 md:flex">
            <Link href="/consultation" className="text-xs hover:text-blue-600">
              Consultation
            </Link>
            <button
              className="m-0 cursor-pointer border-none bg-transparent p-0 text-xs hover:text-blue-600"
              onClick={(e) => {
                if (!isSignedIn) {
                  e.preventDefault();
                  setShowAuthModal(true);
                } else {
                  router.push('/templates');
                }
              }}
            >
              Templates
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden items-center space-x-2 md:flex">
            <Link href="/about" className="text-xs hover:text-blue-600">
              About
            </Link>
            <Link href="/roadmap" className="text-xs hover:text-blue-600">
              Roadmap
            </Link>
            <Link href="/privacy-info" className="text-xs hover:text-blue-600">
              Privacy
            </Link>
          </div>
          <button
            className="rounded-lg border border-yellow-500 bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-100"
            onClick={() => {
              setFeedbackModalOpen(true);
              setFeedbackSuccess(false);
              setFeedbackError(undefined);
            }}
          >
            💡 Feedback
          </button>
          {isSignedIn
            ? (
                <UserButton afterSignOutUrl="/" />
              )
            : (
                <div className="space-x-1">
                  <SignInButton mode="modal">
                    <button className="rounded-lg border border-blue-600 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-lg bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
        </div>
      </div>
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent>
          <DialogHeader>
            <h2 className="text-center text-xs font-semibold">You need to sign in or sign up to access templates.</h2>
          </DialogHeader>
          <DialogFooter className="mt-2 flex flex-row justify-center gap-2">
            <SignInButton mode="modal">
              <button className="rounded-lg border border-blue-600 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-lg bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">Sign Up</button>
            </SignUpButton>
            <button className="ml-2 rounded-lg border px-2 py-1 text-xs" onClick={() => setShowAuthModal(false)}>Close</button>
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
