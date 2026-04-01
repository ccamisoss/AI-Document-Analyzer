/*
  Warnings:

  - The primary key for the `documents` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `documents` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `documentId` on the `analyses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "analyses" DROP CONSTRAINT "analyses_documentId_fkey";

-- AlterTable
ALTER TABLE "analyses" DROP COLUMN "documentId",
ADD COLUMN     "documentId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "documents" DROP CONSTRAINT "documents_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
