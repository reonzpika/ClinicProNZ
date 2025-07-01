import { nanoid } from 'nanoid';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '../../../database/client';
import { emailCaptures } from '../../../database/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      email,
      name,
      practiceName,
      practiceSize,
      mcpdNumber,
      phoneNumber,
      tier,
      priceNZD,
    } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 },
      );
    }

    // Check if email already exists for first30 tier
    const existingCapture = await db
      .select()
      .from(emailCaptures)
      .where(eq(emailCaptures.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingCapture.length > 0) {
      return NextResponse.json(
        { error: 'This email has already been registered' },
        { status: 409 },
      );
    }

    // Count existing first30 signups
    const first30Count = await db
      .select()
      .from(emailCaptures)
      .where(eq(emailCaptures.source, 'first_30'));

    if (first30Count.length >= 30) {
      return NextResponse.json(
        { error: 'Sorry, all 30 founding member spots have been taken. You can still join as an early adopter!' },
        { status: 409 },
      );
    }

    // Insert into database
    await db.insert(emailCaptures).values({
      id: nanoid(),
      email: email.toLowerCase().trim(),
      name: name?.trim() || null,
      practiceName: practiceName?.trim() || null,
      practiceSize: practiceSize || null,
      biggestChallenge: `FIRST30: MCPD: ${mcpdNumber || 'N/A'}, Phone: ${phoneNumber || 'N/A'}, Tier: ${tier}, Price: NZ$${priceNZD}`,
      source: 'first_30',
    });

    // TODO: Send notification email to admin about new first30 signup
    // TODO: Send confirmation email to user with payment instructions

    return NextResponse.json({
      success: true,
      message: `Welcome to the first 30! You are spot #${first30Count.length + 1}`,
    });
  } catch (error) {
    console.error('First30 signup error:', error);
    return NextResponse.json(
      { error: 'Failed to save signup' },
      { status: 500 },
    );
  }
}
