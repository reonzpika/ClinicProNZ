import React from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            ConsultAI NZ
          </Link>
          <div className="hidden md:flex items-center space-x-4">
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
              className="px-3 py-1 border rounded-md"
            />
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}; 