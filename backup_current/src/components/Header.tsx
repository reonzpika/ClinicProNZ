'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="border-b bg-background px-4 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Consultation App</span>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/about" className="text-muted-foreground hover:text-foreground">
            About
          </Link>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="ghost" size="sm">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}
