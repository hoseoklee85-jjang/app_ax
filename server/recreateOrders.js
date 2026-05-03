require('dotenv').config({ path: __dirname + '/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const currencies = { '003': 'AUD', '020': 'EUR', '021': 'EUR', '066': 'GBP', '068': 'VND' };

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ORD-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function main() {
  console.log('Cleaning up existing orders...');
  const deleteResult = await prisma.order.deleteMany({});
  console.log(`Deleted ${deleteResult.count} old orders!`);

  console.log('Fetching members and real products...');
  const [members, productsRaw] = await Promise.all([
    prisma.member.findMany({ take: 50, include: { addresses: true } }),
    prisma.product.findMany({ take: 50 })
  ]);

  if (members.length === 0) {
    console.log('No members found.');
    return;
  }
  if (productsRaw.length === 0) {
    console.log('No real products found in the database! Cannot create orders.');
    return;
  }

  // Convert BigInt IDs to avoid any issues locally, and format prices
  const realProducts = productsRaw.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price || 0)
  }));

  let totalOrders = 0;

  for (const member of members) {
    const numOrders = randomInt(1, 5); // 1 to 5 orders per member
    const memberAddress = member.addresses.find(a => a.isDefault) || member.addresses[0];
    
    for (let i = 0; i < numOrders; i++) {
      const selectedProducts = [];
      const numItems = randomInt(1, 4);
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const product = randomElement(realProducts);
        const qty = randomInt(1, 3);
        selectedProducts.push({
          productId: product.id,
          productName: product.name,
          quantity: qty,
          price: product.price
        });
        totalAmount += product.price * qty;
      }

      const storeId = member.websiteId || '003';
      const currency = currencies[storeId] || 'USD';
      
      const shippingAddress = memberAddress ? {
        addressType: "SHIPPING",
        recipientName: memberAddress.recipientName,
        addressLine1: memberAddress.addressLine1,
        addressLine2: memberAddress.addressLine2,
        city: memberAddress.city,
        state: memberAddress.state,
        zipCode: memberAddress.zipCode,
        countryCode: memberAddress.countryCode,
        phoneNumber: memberAddress.phoneNumber
      } : {
        addressType: "SHIPPING",
        recipientName: `${member.firstName} ${member.lastName}`,
        addressLine1: "123 Default St",
        city: "Seoul",
        zipCode: "00000",
        countryCode: "KR"
      };

      const billingAddress = { ...shippingAddress, addressType: "BILLING" };

      await prisma.order.create({
        data: {
          storeId: storeId,
          currency: currency,
          memberId: member.id,
          orderNumber: generateOrderNumber(),
          status: randomElement(statuses),
          total: totalAmount,
          addresses: {
            create: [shippingAddress, billingAddress]
          },
          items: {
            create: selectedProducts
          }
        }
      });
      totalOrders++;
    }
  }

  console.log(`Successfully generated ${totalOrders} REAL orders using real product data from DB!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
