import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  // Allow GET requests to /api/templates and /api/templates/[id] for everyone
  if (
    req.method === 'GET'
    && (
      req.nextUrl.pathname === '/api/templates'
      || /^\/api\/templates\/[^/]+$/.test(req.nextUrl.pathname)
    )
  ) {
    return NextResponse.next();
  }

  // Allow POST requests to /api/recording/validate-token for token validation
  if (
    req.method === 'POST'
    && req.nextUrl.pathname === '/api/recording/validate-token'
  ) {
    return NextResponse.next();
  }

  // Allow POST requests to /api/recording/generate-token for QR generation
  if (
    req.method === 'POST'
    && req.nextUrl.pathname === '/api/recording/generate-token'
  ) {
    return NextResponse.next();
  }

  // Allow POST requests to /api/recording/mobile-upload for mobile recording
  if (
    req.method === 'POST'
    && req.nextUrl.pathname === '/api/recording/mobile-upload'
  ) {
    return NextResponse.next();
  }

  // Protect all other /api/templates routes (POST, PUT, DELETE)
  if (req.nextUrl.pathname.startsWith('/api/templates')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return resolvedAuth.redirectToSignIn();
    }
  }

  // Protect /api/recording routes except validate-token
  if (req.nextUrl.pathname.startsWith('/api/recording')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return resolvedAuth.redirectToSignIn();
    }
  }

  // Protect /templates page - redirect to sign in if not authenticated
  if (req.nextUrl.pathname.startsWith('/templates')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return resolvedAuth.redirectToSignIn();
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/api/templates/:path*',
    '/api/user/:path*',
    '/api/recording/:path*',
    '/templates/:path*',
  ],
};
