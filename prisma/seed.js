import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



const products = [
  { name: 'Chicn chip', price: 110 },
  { name: 'Eggy brot ', price: 45 },
  { name: 'jam Bun-wich', price: 40 },
  { name: 'palk-o-bun', price: 45 },
  { name: ' Melon bites', price: 20 },
  { name: 'Creamy Fudge', price: 110 },
  { name: 'Sarbath', price: 40 },
  { name: 'Rosebath', price: 50 },
  { name: 'Melon burst ', price: 40 },
  { name: 'Jigarshake ', price: 45 },
  {name : 'Strawberry ice-cookies',price:30},
  {name : 'Black-current ice-cookies',price:30} ,
  {name : 'Choco ice-cookies',price:30},
  {name : 'Trium ice-cookies ',price:75}

];

async function main() {
 

  for (const product of products) {
    await prisma.products.create({
      data: product,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });