import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton instance.
 * 
 * This implementation prevents multiple instances of PrismaClient from being created,
 * which is especially important with hot-reload (nodemon, etc.) where modules
 * can be re-imported multiple times.
 * 
 * The pattern uses globalThis to store the instance, ensuring that even if
 * the module is re-imported, the same instance is reused across the application.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  }).$connect().then(() => {
    console.log("Prisma Client connected");
  }).catch((error: unknown) => {
    console.error("Prisma Client connection error:", error);
  });

globalForPrisma.prisma = prisma;

export async function disconnectPrisma() {
  await prisma.$disconnect();
}

