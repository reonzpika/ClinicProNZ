import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import type { ApiError } from '@/src/features/templates/types';

export const checkApiAuth = async () => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json<ApiError>(
      { code: 'UNAUTHORIZED', message: 'You must be logged in' },
      { status: 401 },
    );
  }
  return userId;
};
