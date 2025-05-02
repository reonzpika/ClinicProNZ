import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('Missing CLERK_SECRET_KEY');
}

// Helper functions for authentication
export const getAuth = () => auth();
export const getUser = () => currentUser();

// Type definitions for Clerk user
export type ClerkUser = Awaited<ReturnType<typeof currentUser>>;

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { userId } = await getAuth();
  return !!userId;
};

// Helper function to get user ID
export const getUserId = async () => {
  const { userId } = await getAuth();
  return userId;
};

// Session management
export const handleSessionExpiry = async () => {
  const { userId } = await getAuth();
  if (!userId) {
    redirect('/sign-in');
  }
};

// Session recovery
export const recoverSession = async () => {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return null;
    }

    // Attempt to recover any saved state
    const savedState = localStorage.getItem('consultationState');
    if (savedState) {
      return JSON.parse(savedState);
    }

    return null;
  } catch (error) {
    console.error('Session recovery failed:', error);
    return null;
  }
};

// Session cleanup
export const cleanupSession = async () => {
  try {
    // Clear any saved state
    localStorage.removeItem('consultationState');

    // Additional cleanup if needed
    const { userId } = await getAuth();
    if (userId) {
      // Clear any user-specific data
      localStorage.removeItem(`user_${userId}_preferences`);
    }
  } catch (error) {
    console.error('Session cleanup failed:', error);
  }
};
