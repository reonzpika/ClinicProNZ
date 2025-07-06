import Link from 'next/link';
import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-auto w-full border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              ©
              {' '}
              {new Date().getFullYear()}
              {' '}
              ConsultAI NZ. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-blue-600">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
