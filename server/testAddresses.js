const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'hsleelee@example.com';
  console.log(`Searching for member with email: ${email}`);
  
  const member = await prisma.member.findUnique({
    where: { email }
  });

  if (!member) {
    console.log(`Member with email ${email} not found.`);
    return;
  }

  console.log(`Found member ID: ${member.id}`);

  // Insert some dummy addresses
  const dummyAddresses = [
    {
      memberId: member.id,
      addressType: 'SHIPPING',
      isDefault: true,
      recipientName: member.firstName ? `${member.firstName} ${member.lastName || ''}` : 'Hs Lee',
      phoneNumber: member.phoneNumber || '010-1234-5678',
      addressLine1: '서울시 강남구 테헤란로 123',
      addressLine2: '스타타워 45층',
      city: 'Seoul',
      state: 'Seoul',
      zipCode: '06234',
      countryCode: 'KR'
    },
    {
      memberId: member.id,
      addressType: 'BILLING',
      isDefault: false,
      recipientName: 'Hs Lee (Billing)',
      phoneNumber: '010-9876-5432',
      addressLine1: '경기도 성남시 분당구 판교역로 152',
      addressLine2: '알파돔타워 11층',
      city: 'Seongnam',
      state: 'Gyeonggi-do',
      zipCode: '13529',
      countryCode: 'KR'
    },
    {
      memberId: member.id,
      addressType: 'SHIPPING',
      isDefault: false,
      recipientName: 'Hs Lee (US Office)',
      phoneNumber: '1-800-123-4567',
      addressLine1: '1600 Amphitheatre Parkway',
      addressLine2: '',
      city: 'Mountain View',
      state: 'CA',
      zipCode: '94043',
      countryCode: 'US'
    }
  ];

  for (const addr of dummyAddresses) {
    await prisma.memberAddress.create({
      data: addr
    });
  }

  console.log(`Successfully added ${dummyAddresses.length} addresses to ${email}.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
