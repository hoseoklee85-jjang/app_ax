require('dotenv').config({path: __dirname + '/.env'});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDb() {
  try {
    // 1. Create order_addresses table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS order_addresses (
        id BIGSERIAL PRIMARY KEY,
        order_id BIGINT NOT NULL,
        address_type VARCHAR(20) NOT NULL,
        recipient_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone_number VARCHAR(50),
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        address_line3 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        zip_code VARCHAR(20) NOT NULL,
        country_code VARCHAR(2) NOT NULL,
        created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(6),
        CONSTRAINT order_addresses_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    
    // 2. Drop shipping_address from orders
    await prisma.$executeRawUnsafe(`ALTER TABLE orders DROP COLUMN IF EXISTS shipping_address`);
    
    console.log("Order address schema updated successfully.");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
updateDb();
