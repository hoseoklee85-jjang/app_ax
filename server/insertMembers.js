require('dotenv').config({path: __dirname + '/.env'});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const websiteIds = ["003", "020", "021", "066", "068"]; // Australia, France, Germany, UK, Vietnam
const groups = ["GENERAL", "VIP", "WHOLESALE", "B2B"];
const statuses = ["ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE"]; // 75% active

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log("Generating 100 test members...");
  
  let successCount = 0;
  for (let i = 1; i <= 100; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + Math.floor(Math.random() * 10000) + '@example.com';
    const websiteId = randomElement(websiteIds);
    const group = randomElement(groups);
    const status = randomElement(statuses);
    const phone = '+' + (Math.floor(Math.random() * 90) + 10) + ' ' + (Math.floor(Math.random() * 900000000) + 100000000);
    const dob = randomDate(new Date(1960, 0, 1), new Date(2005, 0, 1));
    
    try {
      await prisma.member.create({
        data: {
          websiteId,
          email,
          passwordHash: "$2a$10$abcdefghijklmnopqrstuvwx", // dummy hash
          firstName,
          lastName,
          phoneNumber: phone,
          dateOfBirth: dob,
          customerGroup: group,
          status,
          addresses: {
            create: [
              {
                addressType: "SHIPPING",
                recipientName: firstName + " " + lastName,
                addressLine1: Math.floor(Math.random() * 9999) + ' Main St',
                city: "Metropolis",
                state: "NY",
                zipCode: '' + (Math.floor(Math.random() * 90000) + 10000),
                countryCode: "US",
                isDefault: true
              }
            ]
          }
        }
      });
      successCount++;
    } catch (e) {
      console.log('Failed to create user ' + email);
      if (successCount === 0) console.log(e); // Only print the first error
    }
  }
  
  console.log('Successfully inserted ' + successCount + ' members!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
