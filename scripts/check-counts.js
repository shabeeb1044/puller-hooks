const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const libsql = createClient({ url, authToken });
  const prisma = new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
  try {
    const [admins, cats, products, contacts] = await Promise.all([
      prisma.adminUser.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.contactEnquiry.count(),
    ]);
    console.log({ admins, cats, products, contacts });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
