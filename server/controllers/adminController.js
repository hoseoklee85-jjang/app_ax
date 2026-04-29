const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAdmins = async (req, res) => {
  try {
    const admins = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const safeAdmins = admins.map(admin => {
      const { password, ...rest } = admin;
      return rest;
    });
    res.json(safeAdmins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const existing = await prisma.adminUser.findUnique({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const newAdmin = await prisma.adminUser.create({
      data: { username, password, role: role || 'SUB_ADMIN' }
    });

    const { password: pwd, ...safeAdmin } = newAdmin;
    res.status(201).json(safeAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.adminUser.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
};
