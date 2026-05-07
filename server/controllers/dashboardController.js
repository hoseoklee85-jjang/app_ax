const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardData = async (req, res) => {
  try {
    const { storeId } = req.query;
    const filter = {};
    if (storeId && storeId !== 'ALL') filter.storeId = { contains: storeId };
    const orderFilter = { ...filter, status: 'COMPLETED' };

    // 1. Total Completed Orders
    const totalOrdersCount = await prisma.order.count({
      where: orderFilter
    });

    // 2. Total Revenue (Sum of total of completed orders)
    const completedOrders = await prisma.order.findMany({
      where: orderFilter,
      select: { total: true }
    });
    const totalRevenue = completedOrders.reduce((acc, order) => acc + Number(order.total || 0), 0);

    // 3. Total Products
    const totalProductsCount = await prisma.product.count({ where: filter });

    // 4. Total Admins (admin 스키마)
    const totalAdminsCount = await prisma.adminUser.count();

    // 🌟 [추가된 로직] 거실(public 스키마)에 있는 진짜 스프링부트 고객 수 들여다보기!
    // Prisma의 raw query를 사용해서 다른 방(public)에 있는 진짜 members 테이블을 조회합니다.
    let realCustomerCount = 0;
    try {
      if (storeId && storeId !== 'ALL') {
        const query = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM public.members WHERE website_id LIKE '%${storeId}%'`);
        realCustomerCount = Number(query[0].count);
      } else {
        const query = await prisma.$queryRawUnsafe('SELECT COUNT(*) as count FROM public.members');
        realCustomerCount = Number(query[0].count);
      }
    } catch(e) {}

    // 5. Recent 5 Orders (any status)
    const recentOrdersRaw = await prisma.order.findMany({
      where: filter,
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    const recentOrders = recentOrdersRaw.map(o => ({
      ...o,
      id: o.id.toString(),
      memberId: o.memberId ? o.memberId.toString() : null,
      total: Number(o.total || 0)
    }));

    // 6. Fake Monthly Data for Chart
    const monthlyData = [
      { name: 'Jan', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'Feb', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'Mar', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'Apr', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'May', sales: Math.floor(Math.random() * 500000) + 100000 },
      { name: 'Jun', sales: totalRevenue > 0 ? totalRevenue : Math.floor(Math.random() * 500000) + 100000 },
    ];

    // 7. Low Stock Products
    const lowStockProductsRaw = await prisma.product.findMany({
      where: filter,
      take: 5,
      orderBy: { stock: 'asc' }
    });
    
    const lowStockProducts = lowStockProductsRaw.map(p => ({
      ...p,
      id: p.id.toString(),
      categoryId: p.categoryId ? p.categoryId.toString() : null,
      price: Number(p.price || 0),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null
    }));

    res.json({
      summary: {
        totalRevenue,
        totalOrders: totalOrdersCount,
        totalProducts: totalProductsCount,
        totalAdmins: totalAdminsCount,
        realCustomers: realCustomerCount // 진짜 거실에서 가져온 데이터!
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
