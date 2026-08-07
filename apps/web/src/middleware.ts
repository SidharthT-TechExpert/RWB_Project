import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CUSTOMER_PROTECTED_ROUTES = ['/profile', '/orders', '/bookings', '/wallet', '/notifications', '/cart'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const customerToken = request.cookies.get('accessToken')?.value;
  const adminToken = request.cookies.get('adminAccessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const isAuth = !!customerToken || !!adminToken;

  // 1. ADMIN PORTAL HANDLING (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (isAuth && userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Require valid token + admin role
    if (!isAuth || (userRole && userRole !== 'admin')) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
    return NextResponse.next();
  }

  // 2. MANAGER PORTAL HANDLING (/manager/*)
  if (pathname.startsWith('/manager')) {
    if (pathname === '/manager/login') {
      if (isAuth && userRole === 'branch_manager') {
        return NextResponse.redirect(new URL('/manager', request.url));
      }
      return NextResponse.next();
    }

    // If logged in as restaurant_owner trying to access manager portal -> redirect to owner dashboard
    if (isAuth && userRole === 'restaurant_owner') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If logged in as admin trying to access manager portal -> redirect to admin dashboard
    if (isAuth && userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Require valid token + branch_manager role
    if (!customerToken || (userRole && userRole !== 'branch_manager')) {
      const managerLoginUrl = new URL('/manager/login', request.url);
      managerLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(managerLoginUrl);
    }
    return NextResponse.next();
  }

  // 3. OWNER PORTAL HANDLING (/dashboard/*)
  if (pathname.startsWith('/dashboard')) {
    // If logged in as branch_manager trying to access owner portal -> redirect to manager portal
    if (isAuth && userRole === 'branch_manager') {
      return NextResponse.redirect(new URL('/manager', request.url));
    }

    // If logged in as admin trying to access owner portal -> redirect to admin dashboard
    if (isAuth && userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Require valid token + restaurant_owner role
    if (!customerToken || (userRole && userRole !== 'restaurant_owner' && userRole !== 'owner')) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. CUSTOMER AUTH PAGES HANDLING (/auth/login, /auth/register)
  if (isAuth && ['/auth/login', '/auth/register'].some((route) => pathname.startsWith(route))) {
    if (userRole === 'branch_manager') {
      return NextResponse.redirect(new URL('/manager', request.url));
    }
    if (userRole === 'restaurant_owner' || userRole === 'owner') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 5. CUSTOMER PROTECTED ROUTES HANDLING
  const needsCustomerAuth = CUSTOMER_PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (needsCustomerAuth && !customerToken) {
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
