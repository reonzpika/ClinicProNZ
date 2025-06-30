import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  // Allow /api/ably/token to handle its own authentication (mobile + desktop)
  if (req.nextUrl.pathname === '/api/ably/token') {
    return NextResponse.next();
  }

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

  // Helper function to redirect to login with return URL for pages
  const redirectToLogin = (returnUrl: string) => {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect_url', returnUrl);
    return NextResponse.redirect(loginUrl);
  };

  // Helper function to return 401 for API routes
  const returnUnauthorized = () => {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  };

  // Protect all other /api/templates routes (POST, PUT, DELETE)
  if (req.nextUrl.pathname.startsWith('/api/templates')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/patient-sessions routes
  if (req.nextUrl.pathname.startsWith('/api/patient-sessions')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/mobile routes
  if (req.nextUrl.pathname.startsWith('/api/mobile')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/ably routes
  if (req.nextUrl.pathname.startsWith('/api/ably')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /templates page - redirect to login if not authenticated
  if (req.nextUrl.pathname.startsWith('/templates')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return redirectToLogin(req.url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/api/templates/:path*',
    '/api/user/:path*',

    '/api/patient-sessions/:path*',
    '/api/mobile/:path*',
    '/api/ably/:path*',
    '/templates/:path*',
  ],
};
