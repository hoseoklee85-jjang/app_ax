const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const orders = await prisma.order.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
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
    
    const dummyOrders = Array.from({ length: 5 }).map(() => {
      const name = dummyNames[Math.floor(Math.random() * dummyNames.length)];
      // Generate a random order number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `ORD-${dateStr}-${randomChars}`;
      
      return {
        orderNumber,
        customer: name,
        customerEmail: `customer_${Math.floor(Math.random() * 1000)}@example.com`,
        customerPhone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        shippingAddress: addresses[Math.floor(Math.random() * addresses.length)],
        paymentMethod: methods[Math.floor(Math.random() * methods.length)],
        total: Math.floor(Math.random() * 100000) + 10000,
        status: 'COMPLETED'
      };
    });

    await prisma.order.createMany({
      data: dummyOrders
    });
    res.json({ success: true, message: '5 detailed dummy orders created!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to seed dummy orders' });
  }
};
