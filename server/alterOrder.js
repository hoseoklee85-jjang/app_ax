require('dotenv').config({path: __dirname + '/.env'});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDb() {
  try {
    await prisma.$executeRawUnsafe("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_country_code_fkey;");
    await prisma.$executeRawUnsafe("ALTER TABLE orders RENAME COLUMN country_code TO website_id;");
    await prisma.$executeRawUnsafe("ALTER TABLE orders ALTER COLUMN website_id TYPE VARCHAR(50);");
    await prisma.$executeRawUnsafe("ALTER TABLE orders ADD CONSTRAINT orders_website_id_fkey FOREIGN KEY (website_id) REFERENCES website(website_id);");
    console.log("DB altered successfully.");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
updateDb();
