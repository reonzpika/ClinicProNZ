import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  // Allow /api/ably/token to handle its own authentication (mobile + desktop)
  if (req.nextUrl.pathname === '/api/ably/token') {
    return NextResponse.next();
  }

  // Allow Stripe webhook (handles its own verification)
  if (req.nextUrl.pathname === '/api/webhooks/stripe') {
    return NextResponse.next();
  }

  // Allow Clerk webhook (handles its own verification)
  if (req.nextUrl.pathname === '/api/webhooks/clerk-user') {
    return NextResponse.next();
  }

  // Skip rate limiting for static assets, Next.js internals, auth routes, and admin reset
  if (
    req.nextUrl.pathname.startsWith('/_next')
    || req.nextUrl.pathname.startsWith('/favicon')
    || req.nextUrl.pathname.startsWith('/login')
    || req.nextUrl.pathname.startsWith('/register')
    || req.nextUrl.pathname === '/api/admin/rate-limits/reset'
    || req.nextUrl.pathname.includes('.')
  ) {
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

  // Protect all other /api/templates routes (POST, PUT, DELETE) - require signed_up or higher
  if (req.nextUrl.pathname.startsWith('/api/templates')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }

    // Check role - templates require at least signed_up
    const userRole = (resolvedAuth.sessionClaims as any)?.metadata?.role || 'public';
    if (userRole === 'public') {
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

  // Allow anonymous access to /api/mobile routes (supports guest tokens)
  // Authentication is handled within the individual route handlers

  // Allow anonymous access to /api/ably routes (supports guest tokens)
  // Authentication is handled within the individual route handlers

  // Protect /api/uploads routes (clinical images)
  if (req.nextUrl.pathname.startsWith('/api/uploads')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/clinical-images routes (AI analysis)
  if (req.nextUrl.pathname.startsWith('/api/clinical-images')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/rag/admin routes (admin only)
  if (req.nextUrl.pathname.startsWith('/api/rag/admin')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }

    const userRole = (resolvedAuth.sessionClaims as any)?.metadata?.role || 'public';
    if (userRole !== 'admin') {
      return returnUnauthorized();
    }
  }

  // Protect /api/rag/query routes (signed_up or higher)
  if (req.nextUrl.pathname.startsWith('/api/rag/query')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }

    const userRole = (resolvedAuth.sessionClaims as any)?.metadata?.role || 'public';
    if (userRole === 'public') {
      return returnUnauthorized();
    }
  }

  // Protect /templates page - require signed_up or higher
  if (req.nextUrl.pathname.startsWith('/templates')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return redirectToLogin(req.url);
    }

    const userRole = (resolvedAuth.sessionClaims as any)?.metadata?.role || 'public';
    if (userRole === 'public') {
      return redirectToLogin(req.url);
    }
  }

  // /consultation page is now open to everyone (CTAs handle auth prompts)

  // Protect /billing page - require signed_up or higher
  if (req.nextUrl.pathname.startsWith('/billing')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return redirectToLogin(req.url);
    }

    const userRole = (resolvedAuth.sessionClaims as any)?.metadata?.role || 'public';
    if (userRole === 'public') {
      return redirectToLogin(req.url);
    }
  }

  // Protect /dashboard page - require signed_up or higher
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return redirectToLogin(req.url);
    }

    const userRole = (resolvedAuth.sessionClaims as any)?.metadata?.role || 'public';
    if (userRole === 'public') {
      return redirectToLogin(req.url);
    }
  }

  // Protect /settings page - require signed_up or higher
  if (req.nextUrl.pathname.startsWith('/settings')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return redirectToLogin(req.url);
    }

    const userRole = (resolvedAuth.sessionClaims as any)?.metadata?.role || 'public';
    if (userRole === 'public') {
      return redirectToLogin(req.url);
    }
  }

  // Create response and add rate limit headers if available
  const response = NextResponse.next();

  // Add rate limit headers if they were set during processing
  const rateLimitHeaders = req.headers.get('x-rate-limit-headers');
  if (rateLimitHeaders) {
    const headers = JSON.parse(rateLimitHeaders);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });
  }

  return response;
});

export const config = {
  matcher: [
    '/api/templates/:path*',
    '/api/user/:path*',
    '/api/uploads/:path*',
    '/api/patient-sessions/:path*',
    '/api/mobile/:path*',
    '/api/ably/:path*',
    '/api/clinical-images/:path*',
    '/api/rag/:path*',
    '/api/admin/:path*',
    '/api/debug/:path*',
    '/api/test-rate-limit/:path*',
    '/api/create-checkout-session',
    '/api/deepgram/:path*',
    '/api/consultation/:path*',
    '/api/tools/:path*',
    '/templates/:path*',
    '/consultation/:path*',
    '/billing/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
  ],
};
