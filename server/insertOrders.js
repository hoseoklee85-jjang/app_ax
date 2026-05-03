require('dotenv').config({ path: __dirname + '/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const memberId = 2n;
  const storeId = '003';

  console.log('Inserting orders for member', memberId);

  // Order 1: Completed
  await prisma.order.create({
    data: {
      storeId: storeId,
      currency: 'KRW',
      memberId: memberId,
      orderNumber: 'ORD-20260503-0001',
      addresses: {
        create: [
          {
            addressType: "SHIPPING",
            recipientName: "Customer Two",
            addressLine1: "Seoul, Gangnam-gu, 123-45",
            city: "Seoul",
            zipCode: "12345",
            countryCode: "KR"
          },
          {
            addressType: "BILLING",
            recipientName: "Customer Two",
            addressLine1: "Seoul, Gangnam-gu, 123-45",
            city: "Seoul",
            zipCode: "12345",
            countryCode: "KR"
          }
        ]
      },
      status: 'DELIVERED',
      total: 155000.00,
      items: {
        create: [
          {
            productId: 1n, // Assuming product 1 exists
            productName: 'LG OLED TV 65"',
            quantity: 1,
            price: 155000.00
          }
        ]
      }
    }
  });

  // Order 2: Pending
  await prisma.order.create({
    data: {
      storeId: storeId,
      currency: 'KRW',
      memberId: memberId,
      orderNumber: 'ORD-20260503-0002',
      addresses: {
        create: [
          {
            addressType: "SHIPPING",
            recipientName: "Customer Two",
            addressLine1: "Busan, Haeundae-gu, 67-89",
            city: "Busan",
            zipCode: "67890",
            countryCode: "KR"
          },
          {
            addressType: "BILLING",
            recipientName: "Customer Two",
            addressLine1: "Busan, Haeundae-gu, 67-89",
            city: "Busan",
            zipCode: "67890",
            countryCode: "KR"
          }
        ]
      },
      status: 'PENDING',
      total: 45000.00,
      items: {
        create: [
          {
            productId: 2n, // Assuming product 2 exists
            productName: 'LG Tone Free',
            quantity: 1,
            price: 45000.00
          }
        ]
      }
    }
  });

  // Order 3: Processing
  await prisma.order.create({
    data: {
      storeId: storeId,
      currency: 'KRW',
      customerId: customerId,
      orderNumber: 'ORD-20260503-0003',
      addresses: {
        create: [
          {
            addressType: "SHIPPING",
            recipientName: "Customer Two",
            addressLine1: "Seoul, Gangnam-gu, 123-45",
            city: "Seoul",
            zipCode: "12345",
            countryCode: "KR"
          },
          {
            addressType: "BILLING",
            recipientName: "Customer Two",
            addressLine1: "Seoul, Gangnam-gu, 123-45",
            city: "Seoul",
            zipCode: "12345",
            countryCode: "KR"
          }
        ]
      },
      status: 'PAID',
      total: 89000.00,
      items: {
        create: [
          {
            productId: 3n, // Assuming product 3 exists
            productName: 'LG PuriCare Mini',
            quantity: 1,
            price: 89000.00
          }
        ]
      }
    }
  });

  console.log('Orders inserted successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
