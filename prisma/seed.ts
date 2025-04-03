import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



const products = [
  { name: 'Cold Boost', price: 40 },
  { name: 'Bun Butter jam ', price: 40 },
  { name: 'Palkova bun', price: 30 },
  { name: 'Sarbath', price: 50 },
  { name: 'Watermelon juice ', price: 40 },
  { name: 'Creamy Fudge', price: 40 },
  { name: 'Bread Omelete', price: 40 },
  { name: 'Jigarthanda', price: 40 },
  { name: 'Ice Cookies ', price: 40 },
  { name: 'Chicken Chips ', price: 40 },
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