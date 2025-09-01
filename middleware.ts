import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  // Allow Stripe webhook (handles its own verification)
  if (req.nextUrl.pathname === '/api/webhooks/stripe') {
    return NextResponse.next();
  }

  // Allow Clerk webhook (handles its own verification)
  if (req.nextUrl.pathname === '/api/webhooks/clerk-user') {
    return NextResponse.next();
  }

  // Skip rate limiting for static assets, Next.js internals, auth routes, marketing pages, and admin reset
  if (
    req.nextUrl.pathname.startsWith('/_next')
    || req.nextUrl.pathname.startsWith('/favicon')
    || req.nextUrl.pathname.startsWith('/auth/login')
    || req.nextUrl.pathname.startsWith('/auth/register')
    || req.nextUrl.pathname.startsWith('/about')
    || req.nextUrl.pathname.startsWith('/ai-scribing')
    || req.nextUrl.pathname.startsWith('/clinicpro')
    || req.nextUrl.pathname.startsWith('/contact')
    || req.nextUrl.pathname.startsWith('/early')
    || req.nextUrl.pathname.startsWith('/landing-page')
    || req.nextUrl.pathname.startsWith('/roadmap')
    || req.nextUrl.pathname.startsWith('/thank-you')
    || req.nextUrl.pathname === '/api/admin/rate-limits/reset'
    || req.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // All /api/templates routes require authentication (GET requires basic+; CRUD requires standard+)

  // Helper function to redirect to login with return URL for pages
  const redirectToLogin = (returnUrl: string) => {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect_url', returnUrl);
    return NextResponse.redirect(loginUrl);
  };

  // Helper function to return 401 for API routes
  const returnUnauthorized = () => {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  };

  // Protect /api/templates routes - require sign-in only
  if (req.nextUrl.pathname.startsWith('/api/templates')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/patient-sessions routes - require sign-in only
  if (req.nextUrl.pathname.startsWith('/api/patient-sessions')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/consultation routes - require sign-in only
  if (req.nextUrl.pathname.startsWith('/api/consultation')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/deepgram routes - require sign-in only
  if (req.nextUrl.pathname.startsWith('/api/deepgram')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/tools routes - require sign-in only
  if (req.nextUrl.pathname.startsWith('/api/tools')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/search routes - require sign-in only
  if (req.nextUrl.pathname.startsWith('/api/search')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Allow access to /api/mobile routes - authentication is handled within the individual route handlers

  // Protect /api/user routes - require sign-in only
  if (req.nextUrl.pathname.startsWith('/api/user')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/current-session route - require sign-in only
  if (req.nextUrl.pathname === '/api/current-session') {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/create-checkout-session - require sign-in only
  if (req.nextUrl.pathname === '/api/create-checkout-session') {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Allow access to /api/ably routes - authentication is handled within the individual route handlers

  // Protect /api/uploads routes - require sign-in only
  if (req.nextUrl.pathname.startsWith('/api/uploads')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /api/clinical-images routes - require sign-in only
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

    const userTier = (resolvedAuth.sessionClaims as any)?.metadata?.tier || 'basic';
    if (userTier !== 'admin') {
      return returnUnauthorized();
    }
  }

  // Protect /api/rag/query routes - require sign-in only
  if (req.nextUrl.pathname.startsWith('/api/rag/query')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return returnUnauthorized();
    }
  }

  // Protect /templates page - require sign-in only
  if (req.nextUrl.pathname.startsWith('/templates')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return redirectToLogin(req.url);
    }
  }

  // Protect /consultation page - require sign-in only
  if (req.nextUrl.pathname.startsWith('/consultation')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return redirectToLogin(req.url);
    }
  }

  // Protect /billing page - require sign-in only
  if (req.nextUrl.pathname.startsWith('/billing')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return redirectToLogin(req.url);
    }
  }

  // Protect /dashboard page - require sign-in only
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return redirectToLogin(req.url);
    }
  }

  // Protect /settings page - require sign-in only
  if (req.nextUrl.pathname.startsWith('/settings')) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return redirectToLogin(req.url);
    }
  }

  // Protect /mobile page on smartphones - require sign-in only
  if (req.nextUrl.pathname.startsWith('/mobile')) {
    const userAgent = req.headers.get('user-agent') || '';
    const isSmartphone = /iPhone|iPod|Android.*Mobile|Windows Phone|IEMobile|BlackBerry|Opera Mini/i.test(userAgent);
    if (isSmartphone) {
      const resolvedAuth = await auth();
      if (!resolvedAuth.userId) {
        return redirectToLogin(req.url);
      }
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
    '/api/current-session', // Add missing current-session route
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
    '/api/search/:path*',
    '/templates/:path*',
    '/consultation/:path*',
    '/billing/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/mobile/:path*',
    '/search/:path*',
  ],
};
