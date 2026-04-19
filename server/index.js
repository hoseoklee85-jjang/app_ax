const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// === Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/orders', orderRoutes);

// === Initial Seeder ===
async function seedAdmin() {
  try {
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
  await seedAdmin();
  console.log(`Server is running on http://localhost:${PORT}`);
});
