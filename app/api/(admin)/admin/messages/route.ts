import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { contactMessages } from 'database/schema/contact_messages';
import { featureRequests } from 'database/schema/feature_requests';
import { surveyResponses } from 'database/schema/survey_responses';
import { desc, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { checkTierFromSessionClaims } from '@/src/shared/utils/roles';

export async function GET() {
  try {
    const db = getDb();
    // Check auth and admin status
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const isAdmin = checkTierFromSessionClaims(sessionClaims, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all message types
    const [contacts, feedback, surveys] = await Promise.all([
      // Contact messages
      db.select({
        id: contactMessages.id,
        type: sql<string>`'contact'`.as('type'),
        name: contactMessages.name,
        email: contactMessages.email,
        subject: contactMessages.subject,
        message: contactMessages.message,
        userTier: contactMessages.userTier,
        userId: contactMessages.userId,
        source: contactMessages.source,
        status: contactMessages.status,
        createdAt: contactMessages.createdAt,
      }).from(contactMessages).orderBy(desc(contactMessages.createdAt)),

      // Feature requests (feedback)
      db.select({
        id: sql<string>`${featureRequests.id}::text`.as('id'),
        type: sql<string>`'feedback'`.as('type'),
        name: sql<string>`null`.as('name'),
        email: featureRequests.email,
        subject: featureRequests.idea,
        message: featureRequests.details,
        userTier: sql<string>`null`.as('userTier'),
        userId: sql<string>`null`.as('userId'),
        source: sql<string>`'feedback'`.as('source'),
        status: featureRequests.status,
        createdAt: featureRequests.created_at,
      }).from(featureRequests).orderBy(desc(featureRequests.created_at)),

      // Survey responses (simplified)
      db.select({
        id: surveyResponses.id,
        type: sql<string>`'survey'`.as('type'),
        name: sql<string>`null`.as('name'),
        email: surveyResponses.email,
        subject: sql<string>`'Survey Response'`.as('subject'),
        message: sql<string>`'Survey response data available'`.as('message'),
        userTier: sql<string>`null`.as('userTier'),
        userId: sql<string>`null`.as('userId'),
        source: sql<string>`'survey'`.as('source'),
        status: surveyResponses.status,
        createdAt: surveyResponses.createdAt,
      }).from(surveyResponses).orderBy(desc(surveyResponses.createdAt)),
    ]);

    // Combine and sort all messages by date
    const allMessages = [...contacts, ...feedback, ...surveys]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      messages: allMessages,
      stats: {
        total: allMessages.length,
        contact: contacts.length,
        feedback: feedback.length,
        survey: surveys.length,
        new: allMessages.filter(m => m.status === 'unread').length,
      },
    });
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// Update message status
export async function PATCH(request: Request) {
  try {
    const db = getDb();
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const isAdmin = checkTierFromSessionClaims(sessionClaims, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { messageId, type, status } = body;

    if (!messageId || !type || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Valid status values
    const validStatuses = ['unread', 'read', 'actioned'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Update based on message type
    if (type === 'contact') {
      await db
        .update(contactMessages)
        .set({ status })
        .where(sql`${contactMessages.id} = ${messageId}`);
    } else if (type === 'feedback') {
      await db
        .update(featureRequests)
        .set({ status })
        .where(sql`${featureRequests.id}::text = ${messageId}`);
    } else if (type === 'survey') {
      await db
        .update(surveyResponses)
        .set({ status })
        .where(sql`${surveyResponses.id} = ${messageId}`);
    } else {
      return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating message status:', error);
    return NextResponse.json({ error: 'Failed to update message status' }, { status: 500 });
  }
}
