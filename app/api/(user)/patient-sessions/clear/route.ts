import { NextResponse } from 'next/server';

// Deprecated: use DELETE /api/patient-sessions (soft-delete via deletedAt)
export async function POST() {
  return NextResponse.json({ error: 'Deprecated: use DELETE /api/patient-sessions' }, { status: 410 });
}
