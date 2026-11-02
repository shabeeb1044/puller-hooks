import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

const COOKIE_NAME = 'puller_admin_session';
const SESSION_DAYS = 7;

async function getSecret() {
  const { getEnv } = await import('@/lib/env');
  const secret = await getEnv('AUTH_SECRET');
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_SECRET must be set to a strong value (16+ chars).');
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user) {
  const secret = await getSecret();
  return new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);
}

export async function verifySessionToken(token) {
  try {
    const secret = await getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Always secure on HTTPS workers; keep loose only for local http://localhost
    secure: process.env.NODE_ENV === 'production' || Boolean(process.env.OPEN_NEXT_DEPLOY),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload?.sub) return null;

  const user = await prisma.adminUser.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}

export async function requireAdmin() {
  const user = await getSession();
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null;
  }
  return user;
}

export async function loginWithCredentials(email, password) {
  const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return { ok: false, error: 'Invalid email or password.' };
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { ok: false, error: 'Invalid email or password.' };
  const token = await createSessionToken(user);
  await setSessionCookie(token);
  return {
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

export { COOKIE_NAME };
