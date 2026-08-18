-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FOOD', 'DRINK');

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "category" "Category" NOT NULL DEFAULT 'FOOD';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;
