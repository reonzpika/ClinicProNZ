import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public routes (including default template API)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/consultation(.*)',
  '/api/templates', // allow GET for default templates
  '/api/templates/(.*)', // allow GET for default templates and specific template fetch
]);

// Protected routes (template management, custom templates, etc.)
const isProtectedRoute = createRouteMatcher([
  '/templates(.*)', // Template management UI
]);

export default clerkMiddleware(async (auth, req) => {
  console.log('MIDDLEWARE HIT', req.nextUrl.pathname);
  
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all non-public routes
  if (isProtectedRoute(req)) {
    const resolvedAuth = await auth();
    if (!resolvedAuth.userId) {
      return resolvedAuth.redirectToSignIn();
    }
  }

  return NextResponse.next();
});

// See https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ],
};
