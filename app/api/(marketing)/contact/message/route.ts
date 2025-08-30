import { auth } from '@clerk/nextjs/server';
import { db } from 'database/client';
import { contactMessages } from 'database/schema/contact_messages';
import { nanoid } from 'nanoid';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 },
      );
    }

    // Get user info if logged in (optional for contact form)
    let userId = null;
    let userTier = null;
    try {
      const authResult = await auth();
      userId = authResult.userId || null;
      userTier = (authResult.sessionClaims as any)?.metadata?.tier || null;
    } catch (error) {
      // Auth failed - user is anonymous, which is fine for contact form
    }

    // Insert contact message
    await db.insert(contactMessages).values({
      id: nanoid(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      userId: userId || null,
      userTier,
      source: 'contact_page',
      status: 'new',
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 },
    );
  }
}
