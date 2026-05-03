require('dotenv').config({ path: __dirname + '/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const order = await prisma.order.findFirst();
  console.log('Order:', order);
  const stores = await prisma.store.findMany({ where: { id: 'KR' } });
  console.log('Stores with ID KR:', stores);
  process.exit(0);
}
check();
