import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { userSettings } from '@/db/schema/user_settings';

// Default settings structure
const DEFAULT_SETTINGS = { templateOrder: [] };

export async function GET(req: Request) {
  console.log('🚀 [user-settings GET] Request received');
  
  try {
    // Log headers received
    const headers = {
      'x-user-id': req.headers.get('x-user-id'),
      'x-user-tier': req.headers.get('x-user-tier'),
      'x-guest-token': req.headers.get('x-guest-token'),
    };
    console.log('📋 [user-settings GET] Headers:', headers);

    // Get userId from request headers (sent by client)
    const userId = req.headers.get('x-user-id');
    console.log('👤 [user-settings GET] UserId from headers:', userId);

    if (!userId) {
      console.log('❌ [user-settings GET] No userId in headers');
      return NextResponse.json({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access user settings',
      }, { status: 401 });
    }

    // Try to fetch settings
    console.log('💾 [user-settings GET] Querying database for user settings...');
    let settingsRow = await db.query.userSettings.findFirst({
      where: (u, { eq }) => eq(u.userId, userId),
    });
    console.log('💾 [user-settings GET] Settings query result:', settingsRow ? 'found' : 'not found');

    if (!settingsRow) {
      console.log('💾 [user-settings GET] Creating default settings...');
      // Create with defaults if not found
      await db.insert(userSettings).values({ userId, settings: DEFAULT_SETTINGS });
      settingsRow = { userId, settings: DEFAULT_SETTINGS, updatedAt: new Date() };
      console.log('✅ [user-settings GET] Default settings created');
    }

    console.log('✅ [user-settings GET] Returning settings successfully');
    return NextResponse.json({ settings: settingsRow.settings });
  } catch (error) {
    console.error('❌ [user-settings GET] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch user settings',
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  console.log('🚀 [user-settings POST] Request received');
  
  try {
    // Log headers received
    const headers = {
      'x-user-id': req.headers.get('x-user-id'),
      'x-user-tier': req.headers.get('x-user-tier'),
      'x-guest-token': req.headers.get('x-guest-token'),
    };
    console.log('📋 [user-settings POST] Headers:', headers);

    // Get userId from request headers (sent by client)
    const userId = req.headers.get('x-user-id');
    console.log('👤 [user-settings POST] UserId from headers:', userId);

    if (!userId) {
      console.log('❌ [user-settings POST] No userId in headers');
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
