import { prisma } from "../../db/client.js";
import type { Document } from "@prisma/client";

export async function createDocumentService(userId: string, content: string): Promise<Document> {
  return prisma.document.create({
    data: {
      content,
      userId,
    },
  });
}