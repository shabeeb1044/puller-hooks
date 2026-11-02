import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'puller_admin_session';
const LOGIN_PATH = '/management-portal';

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function isAuthed(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Old login URL — send home so the new path is not revealed
  if (pathname.startsWith('/admin/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`)) {
    if (await isAuthed(request)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!(await isAuthed(request))) {
      const login = new URL(LOGIN_PATH, request.url);
      login.searchParams.set('next', pathname);
      return NextResponse.redirect(login);
    }
  }

  if (
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin/login') &&
    !pathname.startsWith('/api/admin/env-check')
  ) {
    if (!(await isAuthed(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/management-portal', '/management-portal/:path*'],
};
