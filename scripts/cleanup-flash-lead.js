const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const row = await prisma.subcategory.findFirst({ where: { slug: 'flash-striker' } });
  if (!row?.pageLead) {
    console.log('No pageLead');
    await prisma.$disconnect();
    return;
  }
  let lead = row.pageLead
    .replace(/<p>\s*-{3,}\s*<\/p>/gi, '')
    .replace(/<p>\s*<\/p>/gi, '')
    .trim();
  await prisma.subcategory.update({
    where: { id: row.id },
    data: { pageLead: lead },
  });
  console.log('Cleaned pageLead:\n', lead);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
