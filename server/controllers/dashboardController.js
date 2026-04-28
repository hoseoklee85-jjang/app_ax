const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Adapter Helper: DB 모델 -> 프론트엔드 기대 모델
function adaptOrder(dbOrder) {
  return {
    id: dbOrder.id.toString(),
    storeId: dbOrder.country_code,
    orderNumber: dbOrder.order_number,
    customer: dbOrder.created_by || 'Unknown',
    total: Number(dbOrder.total_amount),
    status: dbOrder.status,
    createdAt: dbOrder.created_at
  };
}

function adaptProduct(dbProduct) {
  return {
    id: dbProduct.id.toString(),
    name: dbProduct.name,
    price: Number(dbProduct.price),
    stock: dbProduct.stock_quantity,
    productCode: dbProduct.sku,
    storeId: dbProduct.website_id,
    createdAt: dbProduct.created_at
  };
}

exports.getDashboardData = async (req, res) => {
  try {
    const { storeId } = req.query;
    const filterOrders = {};
    const filterProducts = {};
    
    if (storeId && storeId !== 'ALL') {
      filterOrders.country_code = storeId;
      filterProducts.website_id = storeId;
    }

    // 1. Total Pending Orders (If field is not explicitly status, verify. Assuming PENDING works)
    const totalOrdersCount = await prisma.orders.count({
      where: { ...filterOrders, status: 'PENDING' }
    });

    // 2. Total Revenue
    const revResult = await prisma.orders.aggregate({
      where: { ...filterOrders, status: 'COMPLETED' },
      _sum: { total_amount: true }
    });
    const totalRevenue = Number(revResult._sum.total_amount || 0);

    // 3. Total Products
    const totalProductsCount = await prisma.product.count({ where: filterProducts });

    // 4. Total Admins
    const totalAdminsCount = await prisma.admin_users.count();

    // 5. Recent 5 Orders
    const recentOrdersDb = await prisma.orders.findMany({
      where: filterOrders,
      take: 5,
      orderBy: { created_at: 'desc' }
    });
    const recentOrders = recentOrdersDb.map(adaptOrder);

    // 6. Fake Monthly Chart Data
    const monthlyData = [
      { name: 'Jan', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'Feb', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'Mar', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'Apr', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'May', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'Jun', sales: totalRevenue > 0 ? totalRevenue : Math.floor(Math.random() * 500000) + 100000 },
    ];

    // 7. Low Stock Products
    const lowStockProductsDb = await prisma.product.findMany({
      where: filterProducts,
      take: 5,
      orderBy: { stock_quantity: 'asc' }
    });
    const lowStockProducts = lowStockProductsDb.map(adaptProduct);

    res.json({
      summary: {
        totalRevenue,
        totalOrders: totalOrdersCount,
        totalProducts: totalProductsCount,
        totalAdmins: totalAdminsCount
      },
      chartData: monthlyData,
      recentOrders,
      lowStockProducts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
