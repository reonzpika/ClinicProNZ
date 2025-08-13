"use client";

import { useState } from 'react';
import { Input } from '@/src/shared/components/ui/input';
import { Button } from '@/src/shared/components/ui/button';

export function SearchBar({ onSearch, placeholder = 'Search trusted NZ medical sources...' }: { onSearch: (q: string) => void; placeholder?: string }) {
  const [q, setQ] = useState('');

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    onSearch(q.trim());
  }

  return (
    <form onSubmit={submit} className="flex gap-2 w-full">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}