import { SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';

export const Header = () => {
  const { isSignedIn } = useAuth();

  return (
    <header className="w-full border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            ConsultAI NZ
          </Link>
          <div className="hidden items-center space-x-4 md:flex">
            <Link href="/consultation" className="hover:text-blue-600">
              Consultation
            </Link>
            {isSignedIn && (
              <Link href="/templates" className="hover:text-blue-600">
                Templates
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isSignedIn
            ? (
                <>
                  <div className="hidden md:block">
                    <input
                      type="search"
                      placeholder="Search..."
                      className="rounded-md border px-3 py-1"
                    />
                  </div>
                  <UserButton afterSignOutUrl="/" />
                </>
              )
            : (
                <div className="space-x-2">
                  <SignInButton mode="modal">
                    <button className="rounded-lg px-4 py-2 text-blue-600 hover:bg-blue-50">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
        </div>
      </div>
    </header>
  );
};
