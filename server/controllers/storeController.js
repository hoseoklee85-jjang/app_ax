const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: 스토어(웹사이트) 목록 조회
exports.getStores = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [stores, totalCount] = await Promise.all([
      prisma.store.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.store.count()
    ]);

    res.json({
      data: stores,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

// POST: 새 스토어(웹사이트) 등록
exports.createStore = async (req, res) => {
  try {
    const { id, name, currency, timezone } = req.body;
    
    // id validation
    if (!id || !name) {
      return res.status(400).json({ error: 'Store ID and Name are required' });
    }

    const newStore = await prisma.store.create({
      data: {
        id, // e.g. 'JP_SITE'
        name, // e.g. 'Japan'
        currency: currency || 'JPY',
        timezone: timezone || 'ja-JP'
      }
    });
    
    res.status(201).json(newStore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create store' });
  }
};
