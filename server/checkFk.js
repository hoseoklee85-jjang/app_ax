require('dotenv').config({path: __dirname + '/.env'});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const stores = await prisma.store.findMany({ select: { id: true, name: true } });
  console.log('Stores:', stores);
  process.exit(0);
}
check();
