import { Suspense } from 'react';
import { NzMedSearchClient } from '@/src/features/nz-med-search/components/NzMedSearchClient';

export default function Page() {
  return (
    <Suspense>
      <NzMedSearchClient />
    </Suspense>
  );
}