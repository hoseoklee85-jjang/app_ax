const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const agentRoutes = require('./routes/agentRoutes');
const memberRoutes = require('./routes/memberRoutes');
const storeRoutes = require('./routes/storeRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

const app = express();

app.use(cors());
app.use(express.json());

// === Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/stores', storeRoutes); // 🌟 신규 스토어 관리 API 등록

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// === Initial Seeder ===
async function seedData() {
  try {
    const storeCount = await prisma.store.count();
    if (storeCount === 0) {
      await prisma.store.createMany({
        data: [
          { id: 'KR', name: 'Korea', currency: 'KRW', timezone: 'Asia/Seoul' },
          { id: 'US', name: 'USA', currency: 'USD', timezone: 'America/New_York' }
        ]
      });
      console.log('Seeded default stores (KR, US)');
    }

    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      await prisma.adminUser.create({
        data: {
          username: 'admin',
          password: 'admin123',
          role: 'SUPER_ADMIN'
        }
      });
      console.log('Seeded default admin user (admin / admin123)');
    }
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await seedData();
  console.log(`Server is running on http://localhost:${PORT}`);
});
