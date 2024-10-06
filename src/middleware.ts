import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const publicRoutes = [
  '/',
  '/about',
  '/sign-in',
  '/sign-up',
  '/consultation-app',
];

export default clerkMiddleware((auth, request) => {
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route);
  const isManagementRoute = request.nextUrl.pathname.includes('/prompt-management') || request.nextUrl.pathname.includes('/template-management');

  if (!isPublicRoute && isManagementRoute) {
    auth().protect();
  }
  return NextResponse.next();
});
