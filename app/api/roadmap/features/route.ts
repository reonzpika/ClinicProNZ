import { db } from 'database/client';
import { features } from 'database/schema/features';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  // Fetch all features
  const allFeatures = await db.select().from(features);

  // Group by status
  const grouped = {
    planned: [] as any[],
    in_progress: [] as any[],
    completed: [] as any[],
  };
  for (const feature of allFeatures) {
    if (feature.status === 'planned') {
      grouped.planned.push(feature);
    } else if (feature.status === 'in_progress') {
      grouped.in_progress.push(feature);
    } else if (feature.status === 'completed') {
      grouped.completed.push(feature);
    }
  }

  return NextResponse.json(grouped);
}
