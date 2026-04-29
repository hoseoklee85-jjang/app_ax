const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockProducts = [
  { productCode: "UHXM120BA1.AWGBLAP", name: "Multi Room Split Air Conditioner - Outdoor Unit", price: 1679, description: "Premium LG Product", stock: 50 },
  { productCode: "B62AWY-9L6.ANWBLAP", name: "Ducted System - High Static 18kW (Cooling)", price: 989, description: "Premium LG Product", stock: 120 },
  { productCode: "BP350.BAUSLLK", name: "Wireless Network Blu-Ray Player", price: 160, description: "Premium LG Product", stock: 30 },
  { productCode: "MJ3966ABS.BBK7LAP", name: "NeoChef, 39L Smart Inverter Convection Oven", price: 584, description: "Premium LG Product", stock: 15 },
  { productCode: "27HJ712C-W.AAU", name: "27\" Ultra HD Clinical Review Monitor", price: 879, description: "Premium LG Product", stock: 80 },
  { productCode: "OLED65G2PUA", name: "LG 65-Inch Class OLED G2 Series", price: 2999, description: "Premium OLED TV", stock: 25 },
  { productCode: "LFXS26596S", name: "LG InstaView™ Door-in-Door® Refrigerator", price: 2299, description: "Smart Refrigerator", stock: 10 },
  { productCode: "WM4000HBA", name: "LG Front Load Washer with AI DD™", price: 949, description: "Smart Washer", stock: 45 },
  { productCode: "SP9YA", name: "LG 5.1.2 Channel Sound Bar with Dolby Atmos", price: 899, description: "High-Res Audio Sound Bar", stock: 60 }
];

const mockOrders = [
  {
    orderNumber: "ORDER_81000000001", customer: "John Doe", customerEmail: "john@example.com", 
    total: 1679, status: "PAID",
    items: [ { productName: "Multi Room Split Air Conditioner", price: 1679, quantity: 1 } ]
  },
  {
    orderNumber: "ORDER_81000000002", customer: "Jane Smith", customerEmail: "jane@example.com", 
    total: 2999, status: "SHIPPED",
    items: [ { productName: "LG 65-Inch Class OLED G2 Series", price: 2999, quantity: 1 } ]
  },
  {
    orderNumber: "ORDER_81000000003", customer: "Alice Johnson", customerEmail: "alice@example.com", 
    total: 899, status: "PENDING",
    items: [ { productName: "LG 5.1.2 Channel Sound Bar with Dolby Atmos", price: 899, quantity: 1 } ]
  },
  {
    orderNumber: "ORDER_81000000004", customer: "Bob Brown", customerEmail: "bob@example.com", 
    total: 3248, status: "DELIVERED",
    items: [ 
      { productName: "LG InstaView™ Door-in-Door® Refrigerator", price: 2299, quantity: 1 },
      { productName: "LG Front Load Washer with AI DD™", price: 949, quantity: 1 }
    ]
  }
];

async function seed() {
  console.log("Starting seeding...");
  
  // Seed Products
  for (const p of mockProducts) {
    await prisma.product.upsert({
      where: { productCode: p.productCode },
      update: {},
      create: {
        storeId: 'US',
        productCode: p.productCode,
        name: p.name,
        price: p.price,
        description: p.description,
        stock: p.stock,
        translations: {
          create: [
            { language: 'en', name: p.name, description: p.description },
            { language: 'ko', name: p.name + " (한국어)", description: "프리미엄 LG 제품" }
          ]
        }
      }
    });
  }
  console.log(`Seeded ${mockProducts.length} mock products.`);

  // Seed Orders
  for (const o of mockOrders) {
    await prisma.order.upsert({
      where: { orderNumber: o.orderNumber },
      update: {},
      create: {
        storeId: 'US',
        orderNumber: o.orderNumber,
        customer: o.customer,
        customerEmail: o.customerEmail,
        total: o.total,
        status: o.status,
        items: {
          create: o.items.map(i => ({
            productName: i.productName,
            price: i.price,
            quantity: i.quantity,
            status: o.status
          }))
        }
      }
    });
  }
  console.log(`Seeded ${mockOrders.length} mock orders.`);
}

seed().catch(console.error).finally(() => prisma.$disconnect());
