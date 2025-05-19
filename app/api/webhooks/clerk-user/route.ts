import { NextResponse } from 'next/server';

import { db } from '../../../../database/client';
import { users } from '../../../../database/schema/users';

export async function POST(req: Request) {
  try {
    // TODO: Verify Clerk webhook signature for security
    const body = await req.json();
    const { id, email_addresses } = body.data;
    const email = email_addresses?.[0]?.email_address;
    if (!id || !email) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing user id or email' }, { status: 400 });
    }
    // Insert user if not exists
    await db.insert(users)
      .values({ id, email })
      .onConflictDoNothing();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling Clerk user webhook:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to sync user' }, { status: 500 });
  }
}
