-- CreateEnum
CREATE TYPE "orientation" AS ENUM ('horizontal', 'vertical');

-- AlterTable
ALTER TABLE "ContentMap" ADD COLUMN     "headerOrientation" "orientation" NOT NULL DEFAULT 'horizontal';
