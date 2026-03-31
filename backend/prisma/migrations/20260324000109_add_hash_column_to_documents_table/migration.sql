/*
  Warnings:

  - A unique constraint covering the columns `[userId,hash]` on the table `documents` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "documents_userId_hash_key" ON "documents"("userId", "hash");
