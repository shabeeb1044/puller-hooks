/* eslint-disable no-console */
/**
 * Push AUTH_SECRET / TURSO_* from .env or .dev.vars into Wrangler secrets
 * without printing values.
 *
 * Usage: node scripts/sync-cf-secrets.js
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const root = path.join(__dirname, '..');
const env = {
  ...loadEnvFile(path.join(root, '.env')),
  ...loadEnvFile(path.join(root, '.dev.vars')),
};

const keys = ['AUTH_SECRET', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'];
let failed = false;

for (const key of keys) {
  const value = env[key];
  if (!value) {
    console.warn(`skip ${key} (not found in .env / .dev.vars)`);
    continue;
  }
  console.log(`Updating wrangler secret: ${key}…`);
  const result = spawnSync('npx', ['wrangler', 'secret', 'put', key], {
    input: value,
    encoding: 'utf8',
    shell: true,
    cwd: root,
  });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || `Failed to put ${key}`);
    failed = true;
  } else {
    console.log(`  OK ${key}`);
  }
}

process.exit(failed ? 1 : 0);
