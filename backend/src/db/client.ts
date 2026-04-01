import { PrismaClient } from "@prisma/client";

 // Prisma Client singleton instance.
 // The pattern uses globalThis to store the instance, ensuring that even if
 // the module is re-imported, the same instance is reused across the application.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

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

