const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });

async function main() {
  const members = await prisma.member.findMany();
  console.log('Total members:', members.length);
  console.log(members);
}

main().catch(console.error).finally(() => prisma.$disconnect());
