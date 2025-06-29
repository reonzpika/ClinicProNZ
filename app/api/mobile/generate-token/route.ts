import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/client';
import { mobileTokens } from '@/schema';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a unique token
    const token = uuidv4();

    // Token expires in 24 hours (all-day workspace access)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Store the token in database
    console.log('Creating mobile token for userId:', userId);
    console.log('Token:', token);
    console.log('Expires at:', expiresAt);
    
    await db.insert(mobileTokens).values({
      userId,
      token,
      expiresAt,
      isActive: true,
    });

    console.log('Token created successfully');

    // Generate the mobile connection URL with dynamic host detection
    const getBaseUrl = () => {
      // First try environment variable
      if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
      }

      // Extract from request headers for dynamic detection
      const host = req.headers.get('host');
      const protocol = req.headers.get('x-forwarded-proto') || 'https';

      if (host) {
        return `${protocol}://${host}`;
      }

      // Final fallback for local development
      return 'http://localhost:3000';
    };

    const baseUrl = getBaseUrl();
    const mobileUrl = `${baseUrl}/mobile?token=${token}`;

    return NextResponse.json({
      token,
      mobileUrl,
      expiresAt: expiresAt.toISOString(),
      qrData: mobileUrl, // For QR code generation
    });
  } catch (error) {
    console.error('Mobile token generation error:', error);
    return NextResponse.json({ error: 'Failed to generate mobile token' }, { status: 500 });
  }
}
