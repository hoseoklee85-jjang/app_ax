require('dotenv').config({ path: __dirname + '/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
  { id: 1n, name: 'LG OLED evo C4 65"', price: 2500.00 },
  { id: 2n, name: 'LG SIGNATURE Refrigerator', price: 8500.00 },
  { id: 3n, name: 'LG WashTower', price: 2200.00 },
  { id: 4n, name: 'LG gram Pro 16"', price: 1700.00 },
  { id: 5n, name: 'LG UltraGear Gaming Monitor', price: 800.00 },
  { id: 6n, name: 'LG CineBeam Projector', price: 1200.00 },
  { id: 7n, name: 'LG PuriCare Air Purifier', price: 600.00 },
  { id: 8n, name: 'LG CordZero Vacuum', price: 500.00 },
  { id: 9n, name: 'LG Styler', price: 1500.00 },
  { id: 10n, name: 'LG TONE Free Earbuds', price: 200.00 }
];

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
  console.log('Fetching members...');
  const members = await prisma.member.findMany({
    take: 50, // Get up to 50 members
    include: { addresses: true }
  });

  if (members.length === 0) {
    console.log('No members found. Please generate members first.');
    return;
  }

  let totalOrders = 0;

  for (const member of members) {
    const numOrders = randomInt(1, 5); // 1 to 5 orders per member
    const memberAddress = member.addresses.find(a => a.isDefault) || member.addresses[0];
    
    for (let i = 0; i < numOrders; i++) {
      const selectedProducts = [];
      const numItems = randomInt(1, 3);
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const product = randomElement(products);
        const qty = randomInt(1, 2);
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

  console.log(`Successfully generated ${totalOrders} orders for ${members.length} members!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
