const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.store.findFirst({where: {id: '003'}}).then(console.log).finally(() => process.exit(0));
