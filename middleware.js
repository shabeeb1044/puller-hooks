import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'puller_admin_session';
const PORTAL_PATH = '/management-portal';
/** Internal App Router path — never exposed in the browser. */
const INTERNAL_ADMIN = '/admin';

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

  // Public /admin URLs are hidden — show the site 404 page (do not reveal the portal).
  if (pathname === INTERNAL_ADMIN || pathname.startsWith(`${INTERNAL_ADMIN}/`)) {
    const notFoundUrl = request.nextUrl.clone();
    notFoundUrl.pathname = '/x-admin-blocked';
    return NextResponse.rewrite(notFoundUrl);
  }

  if (pathname === PORTAL_PATH || pathname.startsWith(`${PORTAL_PATH}/`)) {
    const authed = await isAuthed(request);

    // Login page only (exact portal path, logged out).
    if (!authed) {
      if (pathname === PORTAL_PATH) {
        return NextResponse.next();
      }
      // Sub-routes require auth — send to login (no ?next= leak).
      return NextResponse.redirect(new URL(PORTAL_PATH, request.url));
    }

    // Logged in: keep URL as /management-portal…, serve internal /admin…
    const suffix = pathname === PORTAL_PATH ? '' : pathname.slice(PORTAL_PATH.length);
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `${INTERNAL_ADMIN}${suffix}`;
    return NextResponse.rewrite(rewriteUrl);
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
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*', '/management-portal', '/management-portal/:path*'],
};
