import { Search as SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';

type SearchProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export function Search({ searchQuery, setSearchQuery }: SearchProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search NZ health resources"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-8"
          disabled
        />
      </div>

      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Search across NZ health resources, including BPAC guidelines, NZ Formulary, and local HealthPathways
          </p>
        </div>
      </div>
    </div>
  );
}
