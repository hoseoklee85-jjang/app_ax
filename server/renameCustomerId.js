require('dotenv').config({path: __dirname + '/.env'});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function renameColumn() {
  try {
    // Drop existing FK if it exists (Prisma might have generated one, or not)
    await prisma.$executeRawUnsafe("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;");
    
    // Rename column
    await prisma.$executeRawUnsafe("ALTER TABLE orders RENAME COLUMN customer_id TO member_id;");
    
    // Add new FK constraint
    await prisma.$executeRawUnsafe("ALTER TABLE orders ADD CONSTRAINT orders_member_id_fkey FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT;");
    
    console.log("Renamed customer_id to member_id successfully.");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
renameColumn();
