const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = [
    { name: 'OLED TV 65인치', price: 2500000, description: 'LG 시그니처 OLED TV', stock: 50, storeId: 'KR' },
    { name: 'OLED TV 77인치', price: 4500000, description: '초대형 프리미엄 OLED TV', stock: 15, storeId: 'KR' },
    { name: '오브제컬렉션 냉장고', price: 1800000, description: '맞춤형 디자인 냉장고', stock: 30, storeId: 'KR' },
    { name: '트롬 세탁기', price: 1200000, description: 'AI DD모터 탑재 세탁기', stock: 40, storeId: 'KR' },
    { name: '휘센 에어컨', price: 2200000, description: '듀얼 인버터 에어컨', stock: 25, storeId: 'KR' },
    { name: '그램 16 노트북', price: 1700000, description: '초경량 16인치 노트북', stock: 60, storeId: 'KR' },
    { name: '스탠바이미', price: 950000, description: '무선 이동식 프라이빗 스크린', stock: 100, storeId: 'KR' },
    { name: '코드제로 청소기', price: 850000, description: '올인원타워 무선청소기', stock: 80, storeId: 'KR' },
    { name: '스타일러', price: 1500000, description: '의류관리기', stock: 20, storeId: 'KR' },
    { name: '퓨리케어 공기청정기', price: 600000, description: '360도 공기청정', stock: 90, storeId: 'KR' }
  ];

  console.log('Seeding products...');
  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }
  console.log('Successfully seeded 10 products!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
