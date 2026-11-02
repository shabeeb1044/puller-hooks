/* Deploy OpenNext Worker without starting local workerd/miniflare (Windows-safe). */
const { spawnSync } = require('child_process');

const env = { ...process.env, OPEN_NEXT_DEPLOY: 'true' };
const result = spawnSync(
  'npx',
  ['wrangler', 'deploy', '--config', 'wrangler.jsonc'],
  { stdio: 'inherit', env, shell: true }
);

process.exit(result.status ?? 1);
