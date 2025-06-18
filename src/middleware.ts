import type { NextRequest } from 'next/server';

import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Only protect dashboard routes
  const isDashboardPage = request.nextUrl.pathname.startsWith('/home') || 
                         request.nextUrl.pathname.startsWith('/providers') ||
                         request.nextUrl.pathname.startsWith('/departments') ||
                         request.nextUrl.pathname.startsWith('/sections') ||
                         request.nextUrl.pathname.startsWith('/disciplines') ||
                         request.nextUrl.pathname.startsWith('/requests') ||
                         request.nextUrl.pathname.startsWith('/user');

  // If trying to access dashboard without being logged in, redirect to sign in
  if (isDashboardPage && !token) {
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sign-in (auth pages)
     * - sign-up (auth pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up).*)',
  ],
}; 
