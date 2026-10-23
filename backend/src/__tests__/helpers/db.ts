import { prisma } from "../../db/client.ts";

export async function deleteTestUser(userId?: string) {
  if (!userId) return;

  await prisma.document.deleteMany({ where: { userId } });
  await prisma.user.deleteMany({ where: { id: userId } });
}

export async function deleteTestUserByEmail(email: string) {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  await deleteTestUser(existing?.id);
}
