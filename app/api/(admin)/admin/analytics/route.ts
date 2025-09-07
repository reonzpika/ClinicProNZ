import { auth } from '@clerk/nextjs/server';
import { db } from 'database/client';
import { patientSessions } from 'database/schema/patient_sessions';
import { templates } from 'database/schema/templates';
import { users } from 'database/schema/users';
import { and, count, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { checkTierFromSessionClaims } from '@/src/shared/utils/roles';

export async function GET(request: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const isAdmin = checkTierFromSessionClaims(sessionClaims, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'total'; // 7, 30, 90, total
    const filterUserId = searchParams.get('userId'); // optional user filter
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '50');

    // Calculate date threshold
    let dateThreshold: Date | null = null;
    if (dateRange !== 'total') {
      const daysAgo = Number.parseInt(dateRange);
      dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - daysAgo);
    }

    // Build base conditions
    const sessionConditions = [];
    const templateConditions = [];

    if (dateThreshold) {
      sessionConditions.push(gte(patientSessions.createdAt, dateThreshold));
      templateConditions.push(gte(templates.createdAt, dateThreshold));
    }

    if (filterUserId) {
      sessionConditions.push(eq(patientSessions.userId, filterUserId));
      templateConditions.push(eq(templates.ownerId, filterUserId));
    }

    // Analytics
    const [
      totalUsers,
      totalSessions,
      sessionsByStatus,
      sessionsByUser,
    ] = await Promise.all([
      // Total users count
      db
        .select({ count: count() })
        .from(users)
        .then((result: Array<{ count: number }>) => result[0]?.count || 0),
      // Total sessions count
      db
        .select({ count: count() })
        .from(patientSessions)
        .where(sessionConditions.length > 0 ? and(...sessionConditions) : undefined)
        .then((result: Array<{ count: number }>) => result[0]?.count || 0),

      // Sessions by status
      db
        .select({
          status: patientSessions.status,
          count: count(),
        })
        .from(patientSessions)
        .where(sessionConditions.length > 0 ? and(...sessionConditions) : undefined)
        .groupBy(patientSessions.status),

      // Sessions by user (top 10)
      db
        .select({
          userId: patientSessions.userId,
          count: count(),
        })
        .from(patientSessions)
        .where(sessionConditions.length > 0 ? and(...sessionConditions) : undefined)
        .groupBy(patientSessions.userId)
        .orderBy(desc(count()))
        .limit(10),
    ]);

    // Templates Analytics
    const [
      totalTemplates,
      templatesByType,
      templatesByUser,
    ] = await Promise.all([
      // Total templates count
      db
        .select({ count: count() })
        .from(templates)
        .where(templateConditions.length > 0 ? and(...templateConditions) : undefined)
        .then((result: Array<{ count: number }>) => result[0]?.count || 0),

      // Templates by type
      db
        .select({
          type: templates.type,
          count: count(),
        })
        .from(templates)
        .where(templateConditions.length > 0 ? and(...templateConditions) : undefined)
        .groupBy(templates.type),

      // Templates by user (custom only, top 10)
      db
        .select({
          ownerId: templates.ownerId,
          count: count(),
        })
        .from(templates)
        .where(
          templateConditions.length > 0
            ? and(eq(templates.type, 'custom'), ...templateConditions)
            : eq(templates.type, 'custom'),
        )
        .groupBy(templates.ownerId)
        .orderBy(desc(count()))
        .limit(10),
    ]);

    // Get all users for filter dropdown
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .orderBy(users.email);

    // Get recent activities (sessions + templates combined)
    const offset = (page - 1) * limit;

    // Get recent sessions
    const recentSessions = await db
      .select({
        id: patientSessions.id,
        type: sql<'session'>`'session'`,
        createdAt: patientSessions.createdAt,
        userId: patientSessions.userId,
        patientName: patientSessions.patientName,
        status: patientSessions.status,
        name: sql<string>`null`,
        templateType: sql<string>`null`,
      })
      .from(patientSessions)
      .where(filterUserId ? eq(patientSessions.userId, filterUserId) : undefined)
      .orderBy(desc(patientSessions.createdAt))
      .limit(limit * 2); // Get extra to ensure we have enough after combining

    // Get recent templates
    const recentTemplates = await db
      .select({
        id: templates.id,
        type: sql<'template'>`'template'`,
        createdAt: templates.createdAt,
        userId: templates.ownerId,
        patientName: sql<string>`null`,
        status: sql<string>`null`,
        name: templates.name,
        templateType: templates.type,
      })
      .from(templates)
      .where(filterUserId ? eq(templates.ownerId, filterUserId) : undefined)
      .orderBy(desc(templates.createdAt))
      .limit(limit * 2); // Get extra to ensure we have enough after combining

    // Combine and sort activities
    const combinedActivities = [
      ...recentSessions.map((session: any) => ({
        id: session.id,
        type: session.type,
        createdAt: session.createdAt?.toISOString() || new Date().toISOString(),
        userId: session.userId,
        details: {
          patientName: session.patientName,
          status: session.status,
        },
      })),
      ...recentTemplates.map((template: any) => ({
        id: template.id,
        type: template.type,
        createdAt: template.createdAt?.toISOString() || new Date().toISOString(),
        userId: template.userId,
        details: {
          name: template.name,
          type: template.templateType,
        },
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);

    const recentActivities = combinedActivities;

    // Date range comparisons (for percentage changes)
    let previousPeriodData = null;
    if (dateRange !== 'total') {
      const previousThreshold = new Date(dateThreshold!);
      const currentDays = Number.parseInt(dateRange);
      previousThreshold.setDate(previousThreshold.getDate() - currentDays);

      const [prevSessions, prevTemplates] = await Promise.all([
        db
          .select({ count: count() })
          .from(patientSessions)
          .where(
            and(
              gte(patientSessions.createdAt, previousThreshold),
              lt(patientSessions.createdAt, dateThreshold!),
              filterUserId ? eq(patientSessions.userId, filterUserId) : sql`true`,
            ),
          )
          .then((result: Array<{ count: number }>) => result[0]?.count || 0),

        db
          .select({ count: count() })
          .from(templates)
          .where(
            and(
              gte(templates.createdAt, previousThreshold),
              lt(templates.createdAt, dateThreshold!),
              filterUserId ? eq(templates.ownerId, filterUserId) : sql`true`,
            ),
          )
          .then((result: Array<{ count: number }>) => result[0]?.count || 0),
      ]);

      previousPeriodData = {
        sessions: prevSessions,
        templates: prevTemplates,
      };
    }

    return NextResponse.json({
      users: {
        total: totalUsers,
      },
      sessions: {
        total: totalSessions,
        byStatus: sessionsByStatus,
        byUser: sessionsByUser,
        previousPeriod: previousPeriodData?.sessions,
      },
      templates: {
        total: totalTemplates,
        byType: templatesByType,
        byUser: templatesByUser,
        previousPeriod: previousPeriodData?.templates,
      },
      recentActivities,
      allUsers,
      dateRange,
      filterUserId,
      pagination: {
        page,
        limit,
        hasMore: recentActivities.length === limit,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 },
    );
  }
}
