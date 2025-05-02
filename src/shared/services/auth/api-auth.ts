import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import type { ApiError } from '@/features/templates/types';

export const checkApiAuth = () => {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json<ApiError>(
      { code: 'UNAUTHORIZED', message: 'You must be logged in' },
      { status: 401 }
    );
  }
  return userId;
}; 