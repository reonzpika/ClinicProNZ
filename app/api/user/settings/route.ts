import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '../../../../database/client';
import { userSettings } from '../../../../database/schema/user_settings';

// Default settings structure
const DEFAULT_SETTINGS = { templateOrder: [] };

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Try to fetch settings
    let settingsRow = await db.query.userSettings.findFirst({ where: (u, { eq }) => eq(u.userId, userId) });
    if (!settingsRow) {
      // Create with defaults if not found
      await db.insert(userSettings).values({ userId, settings: DEFAULT_SETTINGS });
      settingsRow = { userId, settings: DEFAULT_SETTINGS, updatedAt: new Date() };
    }
    return NextResponse.json({ settings: settingsRow.settings });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const newSettings = body.settings;
    if (!newSettings || typeof newSettings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
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
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
