const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: 회원 목록 조회
exports.getMembers = async (req, res) => {
  try {
    const { storeId, search, phone, status, group, startDate, endDate, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (storeId && storeId !== 'ALL') {
      let targetWebsiteId = storeId;
      if (storeId.length === 2) {
        const store = await prisma.store.findFirst({
          where: { timezone: { contains: storeId } }
        });
        if (store) {
          targetWebsiteId = store.id;
        }
      }
      filter.websiteId = targetWebsiteId;
    }
    
    if (search) {
      filter.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (phone) filter.phoneNumber = { contains: phone };
    if (status && status !== 'ALL') filter.status = status;
    if (group && group !== 'ALL') filter.customerGroup = group;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [members, totalCount] = await Promise.all([
      prisma.member.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.member.count({ where: filter })
    ]);

    // BigInt 직렬화 처리 및 날짜 포맷
    const mappedMembers = members.map(m => ({
      ...m,
      id: m.id.toString(),
      dateOfBirth: m.dateOfBirth ? m.dateOfBirth.toISOString().split('T')[0] : null
    }));

    res.json({
      data: mappedMembers,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};

// GET: 단일 회원 상세 조회
exports.getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const memberRaw = await prisma.member.findUnique({
      where: { id: BigInt(id) },
      include: {
        store: true,
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!memberRaw) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const member = {
      ...memberRaw,
      id: memberRaw.id.toString(),
      dateOfBirth: memberRaw.dateOfBirth ? memberRaw.dateOfBirth.toISOString().split('T')[0] : null,
      storeCountry: memberRaw.store ? memberRaw.store.name : null,
      addresses: memberRaw.addresses.map(a => ({
        ...a,
        id: a.id.toString(),
        memberId: a.memberId ? a.memberId.toString() : null,
        street: a.addressLine1,
        country: a.countryCode
      })),
      orders: memberRaw.orders.map(o => ({
        ...o,
        id: o.id.toString(),
        memberId: o.memberId ? o.memberId.toString() : null,
        total: o.total ? parseFloat(o.total.toString()) : 0
      }))
    };
    
    // Clean up included objects to avoid nested data overhead if needed, though spreading includes them.
    delete member.store;

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch member details' });
  }
};

// PUT: 고객 상태 및 그룹 수정
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, customerGroup, isActive, addresses } = req.body;
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (customerGroup !== undefined) updateData.customerGroup = customerGroup;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    await prisma.$transaction(async (tx) => {
      // Update Member
      await tx.member.update({
        where: { id: BigInt(id) },
        data: updateData
      });
      
      // Update Addresses
      if (addresses && Array.isArray(addresses)) {
        for (const addr of addresses) {
          if (addr.id) {
            await tx.memberAddress.update({
              where: { id: BigInt(addr.id) },
              data: {
                recipientName: addr.recipientName,
                addressLine1: addr.addressLine1 || addr.street,
                addressLine2: addr.addressLine2,
                addressLine3: addr.addressLine3,
                city: addr.city,
                state: addr.state,
                countryCode: addr.countryCode,
                zipCode: addr.zipCode,
                phoneNumber: addr.phoneNumber,
                email: addr.email
              }
            });
          }
        }
      }
    });
    
    // Fetch updated member with relationships
    const updatedMemberRaw = await prisma.member.findUnique({
      where: { id: BigInt(id) },
      include: {
        store: true,
        addresses: true,
        orders: { orderBy: { createdAt: 'desc' } }
      }
    });

    const updatedMember = {
      ...updatedMemberRaw,
      id: updatedMemberRaw.id.toString(),
      dateOfBirth: updatedMemberRaw.dateOfBirth ? updatedMemberRaw.dateOfBirth.toISOString().split('T')[0] : null,
      storeCountry: updatedMemberRaw.store ? updatedMemberRaw.store.name : null,
      addresses: updatedMemberRaw.addresses.map(a => ({
        ...a,
        id: a.id.toString(),
        memberId: a.memberId ? a.memberId.toString() : null,
        street: a.addressLine1,
        country: a.countryCode
      })),
      orders: updatedMemberRaw.orders.map(o => ({
        ...o,
        id: o.id.toString(),
        memberId: o.memberId ? o.memberId.toString() : null,
        total: o.total ? parseFloat(o.total.toString()) : 0
      }))
    };
    
    delete updatedMember.store;
    
    res.json(updatedMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update member' });
  }
};
