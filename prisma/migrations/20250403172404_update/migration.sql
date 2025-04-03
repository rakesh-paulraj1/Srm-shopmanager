/*
  Warnings:

  - You are about to drop the `_CustomerToProducts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `purchased` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CustomerToProducts" DROP CONSTRAINT "_CustomerToProducts_A_fkey";

-- DropForeignKey
ALTER TABLE "_CustomerToProducts" DROP CONSTRAINT "_CustomerToProducts_B_fkey";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "purchased" JSONB NOT NULL;

-- DropTable
DROP TABLE "_CustomerToProducts";
