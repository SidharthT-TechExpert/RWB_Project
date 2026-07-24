import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/profile', '/bookings', '/orders', '/wallet', '/notifications', '/cart'];
const DASHBOARD_ROUTES = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!accessToken;

  // Always allow /admin/login
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Redirect authenticated users away from customer auth pages
  if (isAuthenticated && ['/auth/login', '/auth/register'].some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect routes that require authentication
  if (!isAuthenticated) {
    // If accessing any /admin route (except /admin/login), redirect to /admin/login
    if (pathname.startsWith('/admin')) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }

    const needsAuth = [
      ...PROTECTED_ROUTES,
      ...DASHBOARD_ROUTES,
    ].some((route) => pathname.startsWith(route));

    if (needsAuth) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
