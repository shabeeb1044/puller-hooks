import { jsonOk } from '@/lib/api';
import { getEnv } from '@/lib/env';

/**
 * Temporary diagnostics — returns only whether secrets are visible (not values).
 */
export async function GET() {
  const keys = ['AUTH_SECRET', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'DATABASE_URL'];
  const visibility = {};
  for (const key of keys) {
    const value = await getEnv(key);
    visibility[key] = Boolean(value && value.length > 0);
  }

  let cfEnvKeys = [];
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    try {
      const { env } = getCloudflareContext();
      cfEnvKeys = env ? Object.keys(env) : [];
    } catch {
      try {
        const { env } = await getCloudflareContext({ async: true });
        cfEnvKeys = env ? Object.keys(env) : [];
      } catch {
        cfEnvKeys = ['<context unavailable>'];
      }
    }
  } catch {
    cfEnvKeys = ['<opennext import failed>'];
  }

  return jsonOk({
    visibility,
    cfEnvKeys,
    processHasTurso: Boolean(process.env.TURSO_DATABASE_URL),
    processHasAuth: Boolean(process.env.AUTH_SECRET),
  });
}
