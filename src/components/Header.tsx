import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold">Consultation App</Link>
        <nav className="space-x-4">
          <Link href="/about" className="hover:underline">About</Link>
          <UserButton afterSignOutUrl="/" />
        </nav>
      </div>
    </header>
  );
}
