import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Search({ searchQuery, setSearchQuery }: SearchProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex space-x-2">
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button>
            <SearchIcon className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}