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

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  if (isProtectedRoute(req)) {
    auth().protect();
  }
  // By default, protect everything else
  auth().protect();
  return NextResponse.next();
});

// See https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ['/((?!.*\..*|_next).*)', '/', '/(api|trpc)(.*)'],
  runtime: 'edge',
};
