import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  // Keep defaults; Turso is accessed over HTTP via @libsql/client/web.
});
