import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

/** Reuse one client in Next.js / Node so we don't open a pool per request. */
export function getPrisma() {
  if (!globalForPrisma.__pullerPrisma) {
    globalForPrisma.__pullerPrisma = createPrismaClient();
  }
  return globalForPrisma.__pullerPrisma;
}

/** Back-compat: `await prisma.model.method(...)` */
export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') return undefined;
      const client = getPrisma();
      const value = client[prop];
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    },
  }
);
