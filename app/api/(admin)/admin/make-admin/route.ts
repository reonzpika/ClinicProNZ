import { auth, createClerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Endpoint to make current user admin
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Create Clerk client
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Update user to admin
    const updatedUser = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'admin',
      },
    });

    return NextResponse.json({
      message: 'User updated to admin role',
      userId,
      metadata: updatedUser.publicMetadata,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update user role',
    }, { status: 500 });
  }
}
