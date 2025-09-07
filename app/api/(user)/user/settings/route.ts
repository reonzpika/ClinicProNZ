import { NextResponse } from 'next/server';

import { getDb } from 'database/client';
import { userSettings } from '@/db/schema/user_settings';

// Default settings structure
const DEFAULT_SETTINGS = { templateOrder: [], favouriteTemplateId: null };

export async function GET(req: Request) {
  try {
    const db = getDb();
    // Get userId from request headers (sent by client)
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access user settings',
      }, { status: 401 });
    }

    // Try to fetch settings
    const rows = await db
      .select()
      .from(userSettings)
      .where((userSettings.userId as any).equals(userId as any));
    let settingsRow = rows[0] || null;

    if (!settingsRow) {
      // Create with defaults if not found
      await db.insert(userSettings).values({ userId, settings: DEFAULT_SETTINGS });
      settingsRow = { userId, settings: DEFAULT_SETTINGS, updatedAt: new Date() };
    }

    return NextResponse.json({ settings: settingsRow.settings });
  } catch (error) {
    console.error('Error in user settings GET:', error);
    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch user settings',
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    // Get userId from request headers (sent by client)
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to update user settings',
      }, { status: 401 });
    }

    const body = await req.json();
    const newSettings = body.settings;

    if (!newSettings || typeof newSettings !== 'object') {
      return NextResponse.json({
        code: 'BAD_REQUEST',
        message: 'Invalid settings',
      }, { status: 400 });
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
    console.error('Error in user settings POST:', error);
    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to update user settings',
    }, { status: 500 });
  }
}
