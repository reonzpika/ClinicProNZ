import Link from 'next/link';
import { Card } from '@/src/shared/components/ui/card';

export type SearchResult = {
  title: string;
  url: string;
  site?: string;
  snippet?: string;
};

export function SearchResultItem({ item }: { item: SearchResult }) {
  const displayHost = item.site ?? new URL(item.url).host;
  return (
    <Card className="p-4 space-y-1">
      <Link href={item.url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
        {item.title || item.url}
      </Link>
      <div className="text-xs text-muted-foreground">{displayHost}</div>
      {item.snippet ? (
        <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.snippet }} />
      ) : null}
    </Card>
  );
}