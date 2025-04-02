import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



const products = [
  { name: 'Sarbath', price: 40 },
  { name: 'Bread Butter Jam', price: 40 },
  { name: 'Ice Biscuits', price: 30 },
  { name: 'Bread Omelete', price: 50 }
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