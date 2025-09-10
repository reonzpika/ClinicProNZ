'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';

export function ContactLink({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/contact"
      className={`flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md ${className}`}
    >
      <Mail size={16} className="text-slate-400" />
      <span className="font-medium">Contact Support</span>
    </Link>
  );
}
