import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CUSTOMER_PROTECTED_ROUTES = ['/profile', '/bookings', '/orders', '/wallet', '/notifications', '/cart', '/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const customerToken = request.cookies.get('accessToken')?.value;
  const adminToken = request.cookies.get('adminAccessToken')?.value;

  const isCustomerAuth = !!customerToken;
  const isAdminAuth = !!adminToken;

  // 1. ADMIN ROUTES HANDLING
  if (pathname.startsWith('/admin')) {
    // Always allow /admin/login freely
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // All other /admin/* routes require a valid adminAccessToken
    if (!isAdminAuth) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }

    return NextResponse.next();
  }

  // 2. CUSTOMER AUTH PAGES HANDLING (/auth/login, /auth/register)
  if (isCustomerAuth && ['/auth/login', '/auth/register'].some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. CUSTOMER PROTECTED ROUTES HANDLING
  const needsCustomerAuth = CUSTOMER_PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (needsCustomerAuth && !isCustomerAuth) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('auth', 'required');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
