import type { NextRequest } from 'next/server';

import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/sign-in') || request.nextUrl.pathname.startsWith('/sign-up');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/home') || 
                         request.nextUrl.pathname.startsWith('/providers') ||
                         request.nextUrl.pathname.startsWith('/departments') ||
                         request.nextUrl.pathname.startsWith('/sections') ||
                         request.nextUrl.pathname.startsWith('/disciplines') ||
                         request.nextUrl.pathname.startsWith('/requests') ||
                         request.nextUrl.pathname.startsWith('/user');

  // If trying to access auth pages while logged in, redirect to dashboard
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return NextResponse.next();
  }

  // If trying to access dashboard without being logged in, redirect to sign in
  if (isDashboardPage) {
    if (!token) {
      const redirectUrl = new URL('/sign-in', request.url);
      redirectUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/providers/:path*',
    '/departments/:path*',
    '/sections/:path*',
    '/disciplines/:path*',
    '/requests/:path*',
    '/user/:path*',
    '/sign-in',
    '/sign-up',
    '/api/:path*',
  ],
}; 
