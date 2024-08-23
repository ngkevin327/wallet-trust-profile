-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('created', 'indexing', 'active', 'failed');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "status" "ProfileStatus" NOT NULL DEFAULT 'created';
