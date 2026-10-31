/* eslint-disable no-console */
/**
 * Applies local Prisma migration SQL files to Turso (libSQL).
 * Prisma migrate cannot talk to Turso over HTTP, so we push SQL manually.
 *
 * Usage: npm run db:push:turso
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

function stripSqlComments(sql) {
  return sql
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('--')) return '';
      return line;
    })
    .join('\n');
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env');
  }

  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
  const entries = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  if (!entries.length) {
    throw new Error('No migrations found under prisma/migrations');
  }

  const client = createClient({ url, authToken });

  for (const name of entries) {
    const sqlPath = path.join(migrationsDir, name, 'migration.sql');
    if (!fs.existsSync(sqlPath)) continue;
    const sql = stripSqlComments(fs.readFileSync(sqlPath, 'utf8'));
    console.log(`Applying ${name}…`);

    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await client.execute(statement);
      } catch (err) {
        const msg = String(err?.message || err);
        // Idempotent re-runs
        if (/already exists/i.test(msg)) {
          console.log(`  skip (exists): ${statement.slice(0, 60)}…`);
          continue;
        }
        throw err;
      }
    }
    console.log(`  OK: ${name} (${statements.length} statements)`);
  }

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log(
    'Turso tables:',
    tables.rows.map((r) => r.name).join(', ')
  );
  console.log('Turso schema push complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
