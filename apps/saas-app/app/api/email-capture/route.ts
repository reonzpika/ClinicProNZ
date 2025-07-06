import { nanoid } from 'nanoid';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '../../../database/client';
import { emailCaptures } from '../../../database/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, name, practiceName, practiceSize, biggestChallenge } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      );
    }

    // Insert into database
    await db.insert(emailCaptures).values({
      id: nanoid(),
      email: email.toLowerCase().trim(),
      name: name?.trim() || null,
      practiceName: practiceName?.trim() || null,
      practiceSize: practiceSize || null,
      biggestChallenge: biggestChallenge?.trim() || null,
      source: 'landing_page',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email capture error:', error);
    return NextResponse.json(
      { error: 'Failed to save email' },
      { status: 500 },
    );
  }
}
