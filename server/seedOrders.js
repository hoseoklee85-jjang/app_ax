const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dummyNames = ['김철수', '이영희', '홍길동', '박지민', '최동훈'];
  const addresses = [
    '서울시 강남구 테헤란로 123',
    '부산시 해운대구 마린시티 456',
    '경기도 성남시 분당구 판교역로 789',
    '인천시 연수구 송도과학로 101',
    '제주특별자치도 제주시 첨단로 242'
  ];
  const methods = ['CREDIT_CARD', 'KAKAOPAY', 'NAVERPAY', 'BANK_TRANSFER'];

  // Fetch real products from database to link them
  const products = await prisma.product.findMany();
  if (products.length < 2) {
    console.error("Not enough products in DB to create multiple item orders. Please ensure products are seeded.");
    return;
  }

  console.log('Seeding 5 orders with multiple items...');
  for (let i = 0; i < 5; i++) {
    const name = dummyNames[i];
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomChars}`;
    
    // Pick 2-3 random products for this order
    const itemCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 items
    const selectedProducts = [];
    const itemsToCreate = [];
    
    let total = 0;

    for (let j = 0; j < itemCount; j++) {
      let p;
      // Ensure we pick distinct products for the same order if possible
      do {
        p = products[Math.floor(Math.random() * products.length)];
      } while (selectedProducts.includes(p.id) && products.length >= itemCount);
      
      selectedProducts.push(p.id);
      
      const quantity = Math.floor(Math.random() * 2) + 1; // 1 or 2
      total += p.price * quantity;

      itemsToCreate.push({
        productId: p.id,
        productName: p.name,
        price: p.price,
        quantity: quantity
      });
    }

    await prisma.order.create({
      data: {
        storeId: 'KR',
        orderNumber,
        customer: name,
        customerEmail: `customer_${Math.floor(Math.random() * 1000)}@example.com`,
        customerPhone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        shippingAddress: addresses[i],
        paymentMethod: methods[Math.floor(Math.random() * methods.length)],
        total,
        status: 'PAID',
        items: {
          create: itemsToCreate
        }
      }
    });
  }

  console.log('Successfully seeded 5 orders!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
