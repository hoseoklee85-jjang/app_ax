const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUser = await prisma.adminUser.findUnique({
      where: { username }
    });

    if (adminUser && adminUser.password === password) {
      res.json({ 
        success: true, 
        token: `fake-jwt-token-for-${adminUser.id}`,
        role: adminUser.role,
        storeId: adminUser.storeId
      });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login server error' });
  }
};
