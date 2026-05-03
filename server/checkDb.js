require('dotenv').config({path: __dirname + '/.env'});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const result = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_name = 'order_addresses'");
    console.log("Tables:", result);
    
    // Check if shipping_address is still in orders
    const ordersCols = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_address'");
    console.log("Orders shipping_address column:", ordersCols);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
check();
