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

// Create or reuse PrismaClient instance
const prismaClient: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

// Connect to database (Prisma connects lazily, but we can connect eagerly)
if (!globalForPrisma.prisma) {
  prismaClient
    .$connect()
    .then(() => {
      console.log("Prisma Client connected");
    })
    .catch((error: unknown) => {
      console.error("Prisma Client connection error:", error);
    });
  
  globalForPrisma.prisma = prismaClient;
}

export const prisma = prismaClient;

export async function disconnectPrisma() {
  await prisma.$disconnect();
}

