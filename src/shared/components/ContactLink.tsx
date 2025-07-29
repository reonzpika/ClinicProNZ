'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';

export function ContactLink() {
  return (
    <Link
      href="/contact"
      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md"
    >
      <Mail size={16} className="text-slate-400" />
      <span className="font-medium">Contact Support</span>
    </Link>
  );
}
