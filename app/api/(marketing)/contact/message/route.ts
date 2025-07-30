import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { contactMessages, emailCaptures } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, subscribeToUpdates } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 },
      );
    }

    // Get user info if logged in
    const { userId, sessionClaims } = await auth();
    const userTier = (sessionClaims as any)?.metadata?.tier || null;

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

    // Handle newsletter subscription if requested
    if (subscribeToUpdates) {
      try {
        // Check if email already exists in email_captures
        const existing = await db.query.emailCaptures.findFirst({
          where: (emailCaptures, { eq }) => eq(emailCaptures.email, email.toLowerCase().trim()),
        });

        if (!existing) {
          await db.insert(emailCaptures).values({
            id: nanoid(),
            email: email.toLowerCase().trim(),
            name: name.trim(),
            source: 'contact_page_newsletter',
          });
        }
      } catch (newsletterError) {
        // Don't fail the main contact submission if newsletter signup fails
        console.warn('Newsletter signup failed:', newsletterError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Contact message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 },
    );
  }
}
