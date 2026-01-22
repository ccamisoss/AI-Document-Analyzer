/*
  Warnings:

  - Added the required column `promptVersion` to the `analyses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `analyses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `analyses` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `result` on the `analyses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "analyses" ADD COLUMN     "promptVersion" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "result",
ADD COLUMN     "result" JSONB NOT NULL;
