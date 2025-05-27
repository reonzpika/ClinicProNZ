import React from 'react';

import { RoadmapBoard } from '@/features/roadmap/components/RoadmapBoard';
import { Header } from '@/shared/components/Header';

export default function RoadmapPage() {
  return (
    <>
      <Header />
      <RoadmapBoard />
    </>
  );
}
