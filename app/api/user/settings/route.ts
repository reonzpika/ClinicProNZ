import { NextResponse } from 'next/server';

import { getAuth } from '@/shared/services/auth/clerk';

import { db } from '../../../../database/client';
import { userSettings } from '../../../../database/schema/user_settings';

// Default settings structure
const DEFAULT_SETTINGS = { templateOrder: [] };

export async function GET() {
  const { userId } = await getAuth();
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'You must be logged in to access user settings' }, { status: 401 });
  }

  // Try to fetch settings
  let settingsRow = await db.query.userSettings.findFirst({ where: (u, { eq }) => eq(u.userId, userId) });
  if (!settingsRow) {
    // Create with defaults if not found
    await db.insert(userSettings).values({ userId, settings: DEFAULT_SETTINGS });
    settingsRow = { userId, settings: DEFAULT_SETTINGS, updatedAt: new Date() };
  }
  return NextResponse.json({ settings: settingsRow.settings });
}

export async function POST(req: Request) {
  const { userId } = await getAuth();
  if (!userId) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'You must be logged in to update user settings' }, { status: 401 });
  }
  const body = await req.json();
  const newSettings = body.settings;
  if (!newSettings || typeof newSettings !== 'object') {
    return NextResponse.json({ code: 'BAD_REQUEST', message: 'Invalid settings' }, { status: 400 });
  }
  // Upsert settings
  await db
    .insert(userSettings)
    .values({ userId, settings: newSettings })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { settings: newSettings, updatedAt: new Date() },
    });
  return NextResponse.json({ status: 'success' });
}
