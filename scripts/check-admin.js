const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  console.log('usingMySQL', Boolean(process.env.DATABASE_URL?.startsWith('mysql')));

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
