import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(_req: Request) {
  const startTime = Date.now();

  try {
    // Get auth information
    const { userId, sessionClaims } = await auth();

    // Test various operations that could cause timeouts
    const results = {
      timestamp: new Date().toISOString(),
      region: process.env.VERCEL_REGION || 'unknown',

      // Authentication and tier info
      authInfo: {
        userId,
        isAuthenticated: !!userId,
        sessionClaimsTier: (sessionClaims as any)?.metadata?.tier || 'not set',
        sessionClaims: sessionClaims ? Object.keys(sessionClaims) : [],
      },

      // Test database connection speed
      dbTest: await testDatabaseSpeed(),

      // Test external API latency
      apiTest: await testExternalAPISpeed(),

      // Environment info
      environment: {
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
      },

      // Timing info
      totalExecutionTime: Date.now() - startTime,
    };

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      executionTime: Date.now() - startTime,
    }, { status: 500 });
  }
}

async function testDatabaseSpeed() {
  const start = Date.now();
  try {
    // Simple query to test DB speed
    // Note: You'll need to import your DB client
    // const result = await db.select().from(yourTable).limit(1);
    return {
      success: true,
      latency: Date.now() - start,
      note: 'DB test skipped - add your DB import',
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testExternalAPISpeed() {
  const start = Date.now();
  try {
    // Test a simple HTTP request
    const response = await fetch('https://httpbin.org/get', {
      signal: AbortSignal.timeout(5000),
    });

    return {
      success: response.ok,
      latency: Date.now() - start,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
