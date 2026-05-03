const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: 상품 목록 조회
exports.getProducts = async (req, res) => {
  try {
    const { storeId, search, status, inStock, minPrice, maxPrice, isDiscounted, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (storeId && storeId !== 'ALL') {
      filter.storeId = { contains: storeId }; // 'KR' matches 'KR_SITE'
    }
    
    if (search) {
      filter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { productCode: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    
    if (inStock === 'true') {
      filter.stock = { gt: 0 };
    } else if (inStock === 'false') {
      filter.stock = { equals: 0 };
    }
    
    if (isDiscounted === 'true') {
      filter.isDiscounted = true;
    } else if (isDiscounted === 'false') {
      filter.isDiscounted = false;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.gte = parseFloat(minPrice);
      if (maxPrice) filter.price.lte = parseFloat(maxPrice);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [productsRaw, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: filter,
        include: { translations: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.product.count({ where: filter })
    ]);

    const products = productsRaw.map(p => ({
      ...p,
      id: p.id.toString(),
      categoryId: p.categoryId.toString(),
      price: Number(p.price || 0),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      translations: p.translations.map(t => ({
        ...t,
        id: t.id.toString(),
        productId: t.productId.toString()
      }))
    }));

    res.json({
      data: products,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// POST: 새 상품 등록
exports.createProduct = async (req, res) => {
  try {
    const { name, productCode, price, description, stock, storeId = 'KR', translations = [] } = req.body;
    const newProductRaw = await prisma.product.create({
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
      },
      include: { translations: true }
    });

    const newProduct = {
      ...newProductRaw,
      id: newProductRaw.id.toString(),
      categoryId: newProductRaw.categoryId.toString(),
      price: Number(newProductRaw.price || 0),
      originalPrice: newProductRaw.originalPrice ? Number(newProductRaw.originalPrice) : null,
      translations: newProductRaw.translations.map(t => ({
        ...t,
        id: t.id.toString(),
        productId: t.productId.toString()
      }))
    };

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// GET: 개별 상품 상세 조회
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await prisma.product.findUnique({
      where: { id: BigInt(id) },
      include: { translations: true }
    });
    
    if (!p) return res.status(404).json({ error: 'Product not found' });
    
    const product = {
      ...p,
      id: p.id.toString(),
      categoryId: p.categoryId.toString(),
      price: Number(p.price || 0),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      translations: p.translations.map(t => ({
        ...t,
        id: t.id.toString(),
        productId: t.productId.toString()
      }))
    };
    
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// PUT: 상품 재고/상태 등 수정
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, status } = req.body;
    
    const updateData = {};
    if (stock !== undefined) updateData.stock = Number(stock);
    if (status !== undefined) updateData.status = status;
    
    const p = await prisma.product.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { translations: true }
    });
    
    const updatedProduct = {
      ...p,
      id: p.id.toString(),
      categoryId: p.categoryId.toString(),
      price: Number(p.price || 0),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      translations: p.translations.map(t => ({
        ...t,
        id: t.id.toString(),
        productId: t.productId.toString()
      }))
    };
    
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};
