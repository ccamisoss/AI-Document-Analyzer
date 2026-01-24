/*
  Warnings:

  - You are about to drop the column `promptVersion` on the `analyses` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `analyses` table. All the data in the column will be lost.
  - You are about to drop the column `userQuery` on the `analyses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "analyses" DROP COLUMN "promptVersion",
DROP COLUMN "type",
DROP COLUMN "userQuery",
ADD COLUMN     "userPrompt" TEXT;
