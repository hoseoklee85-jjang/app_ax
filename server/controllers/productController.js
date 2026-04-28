const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: 상품 목록 조회
exports.getProducts = async (req, res) => {
  try {
    const { storeId } = req.query;
    const filter = {};
    if (storeId && storeId !== 'ALL') {
      const website = await prisma.website.findFirst({
        where: { locale_code: storeId }
      });
      filter.website_id = website ? website.website_id : storeId;
    }
    
    const dbProducts = await prisma.product.findMany({
      where: filter,
      orderBy: { created_at: 'desc' },
      take: 50
    });

    // Adapter: DB 형태를 기존 프론트엔드가 기대하는 형태로 변환
    const products = dbProducts.map(p => ({
      id: p.id.toString(),
      name: p.name,
      price: Number(p.price),
      stock: p.stock_quantity,
      productCode: p.sku,
      storeId: p.website_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      description: "" 
    }));

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// POST: 새 상품 등록
exports.createProduct = async (req, res) => {
  try {
    const { name, productCode, price, description, stock, storeId = 'KR' } = req.body;
    
    // Resolve website_id from storeId
    const website = await prisma.website.findFirst({
      where: { locale_code: storeId }
    });
    const resolvedWebsiteId = website ? website.website_id : storeId;

    // Require category for the new remote schema
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: 'Default', website_id: resolvedWebsiteId, depth: 1, slug: 'def-' + Date.now() }
      });
    }

    const newDbProduct = await prisma.product.create({
      data: { 
        name, 
        sku: productCode ? String(productCode) : `SKU-${Date.now()}`,
        price: Number(price), 
        stock_quantity: Number(stock),
        website_id: resolvedWebsiteId,
        category_id: category.category_id,
        is_discounted: false
      }
    });

    const product = {
      id: newDbProduct.id.toString(),
      name: newDbProduct.name,
      price: Number(newDbProduct.price),
      stock: newDbProduct.stock_quantity,
      productCode: newDbProduct.sku,
      storeId: newDbProduct.website_id,
      createdAt: newDbProduct.created_at
    };

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};
