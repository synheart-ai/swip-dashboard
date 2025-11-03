/**
 * Middleware for authentication protection
 * Prevents flash of protected content by checking auth before rendering
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/leaderboard',
  '/sessions',
  '/analytics',
  '/developer',
  '/profile',
  '/app',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js)$/)
  ) {
    return NextResponse.next();
  }
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // If it's a protected route, check for authentication
  if (isProtectedRoute) {
    // Check for better-auth session cookie
    // better-auth typically uses cookies like: better-auth.session_token
    const sessionCookie = request.cookies.get('better-auth.session_token') || 
                          request.cookies.get('better-auth.session') ||
                          request.cookies.get('session');
    
    // If no session cookie found, redirect immediately before any rendering
    if (!sessionCookie?.value) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      // Add a return URL for redirect after login
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|logos|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
};
