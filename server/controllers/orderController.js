const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Adapter Helper: DB 모델 -> 프론트엔드 기대 모델
function adaptOrder(dbOrder) {
  return {
    id: dbOrder.id.toString(),
    storeId: dbOrder.country_code,
    orderNumber: dbOrder.order_number,
    customer: dbOrder.created_by || 'Unknown',
    customerEmail: "",
    customerPhone: "",
    shippingAddress: dbOrder.shipping_address,
    paymentMethod: 'CREDIT_CARD',
    total: Number(dbOrder.total_amount),
    status: dbOrder.status,
    notes: "",
    createdAt: dbOrder.created_at,
    items: (dbOrder.order_items || []).map(item => ({
      id: item.id.toString(),
      orderId: item.order_id.toString(),
      productId: item.product_id.toString(),
      productName: item.product_name,
      quantity: item.quantity,
      price: Number(item.unit_price),
      status: 'PAID'
    })),
    statusHistory: []
  };
}

exports.getOrders = async (req, res) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 10, storeId } = req.query;
    
    const filter = {};
    if (storeId && storeId !== 'ALL') filter.country_code = storeId;
    if (status) {
      if (status === 'IN_TRANSIT') {
        filter.status = { in: ['PREP_SHIPPING', 'PICKING', 'SHIPPING'] };
      } else {
        filter.status = status;
      }
    }
    if (search) {
      filter.OR = [
        { order_number: { contains: search } }
      ];
    }
    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) filter.created_at.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.created_at.lte = end;
      }
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [orders, totalCount] = await Promise.all([
      prisma.orders.findMany({
        where: filter,
        orderBy: { created_at: 'desc' },
        include: { order_items: true },
        skip,
        take
      }),
      prisma.orders.count({ where: filter })
    ]);

    res.json({
      data: orders.map(adaptOrder),
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.orders.findUnique({
      where: { id: BigInt(id) },
      include: { order_items: true }
    });
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(adaptOrder(order));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

exports.createOrder = async (req, res) => {
    // Simplified Create for new schema
    res.status(501).json({ error: 'Not implemented for remote schema yet' });
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await prisma.orders.findUnique({ 
      where: { id: BigInt(id) }
    });
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const updatedOrder = await prisma.orders.update({
      where: { id: BigInt(id) },
      data: { status }
    });

    res.json(adaptOrder(updatedOrder));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

exports.updateOrderItemStatus = async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
};

exports.seedDummyOrders = async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
};
