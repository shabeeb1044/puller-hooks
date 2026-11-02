const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  console.log('usingTurso', Boolean(url && authToken));

  let prisma;
  if (url && authToken) {
    const libsql = createClient({ url, authToken });
    prisma = new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
  } else {
    prisma = new PrismaClient();
  }

  try {
    const users = await prisma.adminUser.findMany({
      select: { id: true, email: true, role: true, passwordHash: true },
    });
    console.log(
      'users',
      users.map((u) => ({ id: u.id, email: u.email, role: u.role, hashLen: u.passwordHash?.length || 0 }))
    );

    const email = (process.env.ADMIN_SETUP_EMAIL || 'sales@pullertackle.com').toLowerCase();
    const password = process.env.ADMIN_SETUP_PASSWORD;
    const user = users.find((u) => u.email === email);
    if (user && password) {
      const ok = await bcrypt.compare(password, user.passwordHash);
      console.log('passwordMatchesEnv', ok);
    } else if (!password) {
      console.log('ADMIN_SETUP_PASSWORD not set; skip password check');
    } else {
      console.log('admin email not found in DB');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
