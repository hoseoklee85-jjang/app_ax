require('dotenv').config({path: __dirname + '/.env'});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.order.deleteMany({where: {orderNumber: {startsWith: 'ORD-20260503-'}}});
  console.log("Deleted old orders:", result);
  process.exit(0);
}
main();
