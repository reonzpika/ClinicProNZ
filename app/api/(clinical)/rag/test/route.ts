import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId, sessionClaims } = await auth();

  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user tier from session claims
  const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';

  return NextResponse.json({
    message: 'RAG test endpoint',
    userId,
    userTier,
    timestamp: new Date().toISOString(),
  });
}
