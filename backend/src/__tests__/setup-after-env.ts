import { disconnectPrisma } from "../db/client.ts";

afterAll(async () => {
  await disconnectPrisma();
});
