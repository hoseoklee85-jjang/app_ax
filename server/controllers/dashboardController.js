const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardData = async (req, res) => {
  try {
    // 1. Total Completed Orders
    const totalOrdersCount = await prisma.order.count({
      where: { status: 'COMPLETED' }
    });

    // 2. Total Revenue (Sum of total of completed orders)
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      select: { total: true }
    });
    const totalRevenue = completedOrders.reduce((acc, order) => acc + order.total, 0);

    // 3. Total Products
    const totalProductsCount = await prisma.product.count();

    // 4. Total Admins
    const totalAdminsCount = await prisma.adminUser.count();

    // 5. Recent 5 Orders (any status)
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // 6. Fake Monthly Data for Chart (since we don't have enough history, we'll generate 6 months of fake data)
    const monthlyData = [
      { name: 'Jan', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'Feb', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'Mar', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'Apr', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'May', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'Jun', sales: totalRevenue > 0 ? totalRevenue : Math.floor(Math.random() * 500000) + 100000 },
    ];

    res.json({
      summary: {
        totalRevenue,
        totalOrders: totalOrdersCount,
        totalProducts: totalProductsCount,
        totalAdmins: totalAdminsCount
      },
      chartData: monthlyData,
      recentOrders
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
