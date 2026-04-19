const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: 상품 목록 조회
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// POST: 새 상품 등록
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;
    const newProduct = await prisma.product.create({
      data: { name, price, description, stock }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};
