const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: 스토어 목록 조회
exports.getStores = async (req, res) => {
  try {
    const stores = await prisma.website.findMany({
      orderBy: { created_at: 'desc' },
      take: 200 // 안전을 위해 제한
    });
    res.json(stores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

// POST: 새 스토어 등록
exports.createStore = async (req, res) => {
  try {
    const { website_id, country, subsidiary_code, locale_code } = req.body;
    
    // Check if ID already exists
    const existing = await prisma.website.findUnique({ where: { website_id } });
    if (existing) {
      return res.status(400).json({ error: 'Website ID already exists' });
    }

    const newStore = await prisma.website.create({
      data: {
        website_id,
        country,
        subsidiary_code,
        locale_code,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    res.status(201).json(newStore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create store' });
  }
};

// PUT: 스토어 정보 수정
exports.updateStore = async (req, res) => {
  try {
    const { id } = req.params; // website_id
    const { country, subsidiary_code, locale_code } = req.body;

    const updatedStore = await prisma.website.update({
      where: { website_id: id },
      data: {
        country,
        subsidiary_code,
        locale_code,
        updated_at: new Date()
      }
    });

    res.json(updatedStore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update store' });
  }
};

// DELETE: 스토어 삭제
exports.deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.website.delete({
      where: { website_id: id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
};
