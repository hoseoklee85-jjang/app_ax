const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: { role: 'SUPER_ADMIN', storeId: null },
    create: { username: 'admin', password: 'admin123', role: 'SUPER_ADMIN' }
  });

  await prisma.adminUser.upsert({
    where: { username: 'kr_admin' },
    update: { role: 'SUB_ADMIN', storeId: 'KR_SITE' },
    create: { username: 'kr_admin', password: 'admin123', role: 'SUB_ADMIN', storeId: 'KR_SITE' }
  });

  await prisma.adminUser.upsert({
    where: { username: 'us_admin' },
    update: { role: 'SUB_ADMIN', storeId: 'US_SITE' },
    create: { username: 'us_admin', password: 'admin123', role: 'SUB_ADMIN', storeId: 'US_SITE' }
  });

  console.log('Seeded SUPER_ADMIN (admin) and SUB_ADMINs (kr_admin, us_admin)');
}

main().catch(console.error).finally(() => prisma.$disconnect());
