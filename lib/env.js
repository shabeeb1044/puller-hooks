/**
 * Read env from process.env first, then Cloudflare Workers bindings.
 * Preferring process.env avoids spinning up workerd/miniflare during local
 * `next dev` (that path can stack-overflow on some Windows setups).
 * OpenNext exposes wrangler secrets/vars on getCloudflareContext().env
 */
export async function getEnv(name) {
  const fromProcess = process.env[name];
  if (fromProcess != null && String(fromProcess).length > 0) {
    return String(fromProcess);
  }

  // Only hit Cloudflare context when local env is missing (Worker / OpenNext).
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

  return undefined;
}

export async function requireEnv(name) {
  const value = await getEnv(name);
  if (!value) {
    throw new Error(`${name} is not set on the Worker. Run: npx wrangler secret put ${name}`);
  }
  return value;
}
