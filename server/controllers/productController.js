const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: 상품 목록 조회
exports.getProducts = async (req, res) => {
  try {
    const { storeId } = req.query;
    const filter = {};
    if (storeId && storeId !== 'ALL') {
      filter.storeId = storeId;
    }
    
    const products = await prisma.product.findMany({
      where: filter,
      include: { translations: true },
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
    const { name, productCode, price, description, stock, storeId = 'KR', translations = [] } = req.body;
    const newProduct = await prisma.product.create({
      data: { 
        name, 
        productCode: productCode ? String(productCode) : null,
        price: Number(price), 
        description, 
        stock: Number(stock),
        storeId,
        translations: {
          create: translations
        }
      }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};
