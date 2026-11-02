import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client/web';
import { requireEnv } from '@/lib/env';

async function createPrismaClient() {
  const url = (await requireEnv('TURSO_DATABASE_URL')).trim();
  const authToken = (await requireEnv('TURSO_AUTH_TOKEN')).trim();

  // Web/HTTP Turso client — Node native libsql does not work on Workers.
  const libsql = createClient({ url, authToken });
  const adapter = new PrismaLibSQL(libsql);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export async function getPrisma() {
  return createPrismaClient();
}

function createAsyncModelProxy(modelName) {
  return new Proxy(
    {},
    {
      get(_t, methodName) {
        if (methodName === 'then' || methodName === 'catch' || methodName === 'finally') {
          return undefined;
        }
        return async (...args) => {
          const client = await createPrismaClient();
          const model = client[modelName];
          const fn = model?.[methodName];
          if (typeof fn !== 'function') {
            throw new Error(`Prisma model/method not found: ${String(modelName)}.${String(methodName)}`);
          }
          return fn.apply(model, args);
        };
      },
    }
  );
}

/** Back-compat: `await prisma.model.method(...)` */
export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') return undefined;
      if (prop === '$transaction') {
        return async (arg) => {
          const client = await createPrismaClient();
          if (typeof arg === 'function') {
            return client.$transaction(async (tx) => arg(tx));
          }
          if (Array.isArray(arg)) {
            const results = [];
            for (const p of arg) results.push(await p);
            return results;
          }
          return client.$transaction(arg);
        };
      }
      if (typeof prop === 'string' && prop.startsWith('$')) {
        return async (...args) => {
          const client = await createPrismaClient();
          return client[prop](...args);
        };
      }
      return createAsyncModelProxy(prop);
    },
  }
);
