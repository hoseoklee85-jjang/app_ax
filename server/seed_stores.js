const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stores = [
    { id: '001', name: 'Korea', currency: 'KRW', timezone: 'ko-KR' },
    { id: '002', name: 'USA', currency: 'USD', timezone: 'en-US' },
    { id: '003', name: 'Australia', currency: 'AUD', timezone: 'en-AU' },
    { id: '004', name: 'United Kingdom', currency: 'GBP', timezone: 'en-GB' },
    { id: '005', name: 'Germany', currency: 'EUR', timezone: 'de-DE' },
    { id: '006', name: 'Japan', currency: 'JPY', timezone: 'ja-JP' },
    { id: '007', name: 'France', currency: 'EUR', timezone: 'fr-FR' },
    { id: '008', name: 'Italy', currency: 'EUR', timezone: 'it-IT' },
    { id: '009', name: 'Spain', currency: 'EUR', timezone: 'es-ES' },
    { id: '010', name: 'Canada', currency: 'CAD', timezone: 'en-CA' },
  ];

  for (const store of stores) {
    try {
      const existing = await prisma.store.findUnique({ where: { id: store.id } });
      if (!existing) {
        await prisma.store.create({ data: store });
      }
    } catch (e) {
      console.log('Skipped', store.id);
    }
  }
  console.log('Stores seeded');
}

main().finally(() => prisma.$disconnect());
