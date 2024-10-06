'use client';

import { SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold">Consultation App</Link>
        <nav className="flex items-center space-x-4">
          <Link href="/about" className="hover:underline">About</Link>
          {isSignedIn
            ? (
                <UserButton afterSignOutUrl="/" />
              )
            : (
                <>
                  <SignInButton mode="modal">
                    <button className="hover:underline">Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="hover:underline">Sign Up</button>
                  </SignUpButton>
                </>
              )}
        </nav>
      </div>
    </header>
  );
}
