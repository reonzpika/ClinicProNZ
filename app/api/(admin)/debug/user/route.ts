import { auth, createClerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Debug endpoint to check current user metadata
export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Create Clerk client
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Get full user data from Clerk
    const user = await clerkClient.users.getUser(userId);

    return NextResponse.json({
      userId,
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
      unsafeMetadata: user.unsafeMetadata,
      sessionClaims,
      currentRole: (sessionClaims as any)?.metadata?.role || 'no role set',
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({
      error: 'Failed to fetch user data',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
