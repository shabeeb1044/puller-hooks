/**
 * Read env from Cloudflare Workers bindings first, then process.env.
 * OpenNext exposes wrangler secrets/vars on getCloudflareContext().env
 */
export async function getEnv(name) {
  // Sync context (API routes / server components in request)
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    try {
      const { env } = getCloudflareContext();
      if (env && env[name] != null && String(env[name]).length > 0) {
        return String(env[name]);
      }
    } catch {
      // fall through to async
    }
    try {
      const { env } = await getCloudflareContext({ async: true });
      if (env && env[name] != null && String(env[name]).length > 0) {
        return String(env[name]);
      }
    } catch {
      // not on Workers
    }
  } catch {
    // package missing in some contexts
  }

  const fromProcess = process.env[name];
  if (fromProcess != null && String(fromProcess).length > 0) {
    return String(fromProcess);
  }
  return undefined;
}

export async function requireEnv(name) {
  const value = await getEnv(name);
  if (!value) {
    throw new Error(`${name} is not set on the Worker. Run: npx wrangler secret put ${name}`);
  }
  return value;
}
