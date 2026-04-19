const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const orders = await prisma.order.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true }
    });
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { customer, customerEmail, customerPhone, shippingAddress, paymentMethod, notes, items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: '장바구니가 비어 있습니다.' });
    }

    const productIds = items.map(i => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    let total = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const product = dbProducts.find(p => p.id === item.productId);
      if (!product) return res.status(400).json({ error: `상품을 찾을 수 없습니다: ID ${item.productId}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `재고 부족: ${product.name} (남은 수량: ${product.stock})` });
      }
      
      total += product.price * item.quantity;
      orderItemsToCreate.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomChars}`;

    const newOrder = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      return await tx.order.create({
        data: {
          orderNumber,
          customer,
          customerEmail,
          customerPhone,
          shippingAddress,
          paymentMethod: paymentMethod || 'CREDIT_CARD',
          total,
          status: 'PAID', // 결제 완료 상태로 생성
          notes,
          items: {
            create: orderItemsToCreate
          }
        },
        include: { items: true }
      });
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    if (status === 'CANCELLED' && order.status !== 'PAID') {
      return res.status(400).json({ error: '취소는 결제완료(PAID) 상태에서만 가능합니다.' });
    }
    if (status === 'RETURNED' && order.status !== 'DELIVERED') {
      return res.status(400).json({ error: '반품은 배송완료(DELIVERED) 상태에서만 가능합니다.' });
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

exports.seedDummyOrders = async (req, res) => {
  try {
    const dummyNames = ['김철수', '이영희', '홍길동', '박지민', '최동훈', '정유진', '강다니엘'];
    const addresses = [
      '서울시 강남구 테헤란로 123',
      '부산시 해운대구 마린시티 456',
      '경기도 성남시 분당구 판교역로 789',
      '인천시 연수구 송도과학로 101',
      '제주특별자치도 제주시 첨단로 242'
    ];
    const methods = ['CREDIT_CARD', 'KAKAOPAY', 'NAVERPAY', 'BANK_TRANSFER'];
    
    // Fetch real products from database
    let products = await prisma.product.findMany();
    
    // If no products exist, create some first so orders can link to them
    if (products.length === 0) {
      const dummyProducts = [
        { name: "프리미엄 런닝화", price: 120000, stock: 50 },
        { name: "베이직 무지 티셔츠", price: 15000, stock: 200 },
        { name: "스마트 노이즈캔슬링 이어폰", price: 250000, stock: 5 },
        { name: "고급 가죽 지갑", price: 85000, stock: 15 },
        { name: "초경량 등산 배낭", price: 150000, stock: 8 }
      ];
      await prisma.product.createMany({ data: dummyProducts });
      products = await prisma.product.findMany();
    }
    
    for (let i = 0; i < 5; i++) {
      const name = dummyNames[Math.floor(Math.random() * dummyNames.length)];
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `ORD-${dateStr}-${randomChars}`;
      
      const p1 = products[Math.floor(Math.random() * products.length)];
      const qty1 = Math.floor(Math.random() * 2) + 1;
      
      const items = [
        {
          productId: p1.id,
          productName: p1.name,
          price: p1.price,
          quantity: qty1
        }
      ];
      
      // 50% chance to have a second item
      if (Math.random() > 0.5) {
        const p2 = products[Math.floor(Math.random() * products.length)];
        // avoid duplicate same product if possible, but fine for dummy
        items.push({
          productId: p2.id,
          productName: p2.name,
          price: p2.price,
          quantity: 1
        });
      }
      
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      await prisma.order.create({
        data: {
          orderNumber,
          customer: name,
          customerEmail: `customer_${Math.floor(Math.random() * 1000)}@example.com`,
          customerPhone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          shippingAddress: addresses[Math.floor(Math.random() * addresses.length)],
          paymentMethod: methods[Math.floor(Math.random() * methods.length)],
          total,
          status: 'PAID',
          items: {
            create: items
          }
        }
      });
    }

    res.json({ success: true, message: '5 detailed dummy orders created!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to seed dummy orders' });
  }
};
