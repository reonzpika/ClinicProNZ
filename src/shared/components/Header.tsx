import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';

export const Header = () => {
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
            <Link href="/templates" className="hover:text-blue-600">
              Templates
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <input
              type="search"
              placeholder="Search..."
              className="rounded-md border px-3 py-1"
            />
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
};
