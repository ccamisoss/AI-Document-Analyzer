import { createApp } from "./app.js";
import { env, validateEnv } from "./config/env.js";
import { disconnectPrisma } from "./db/client.js";

validateEnv();

const app = createApp();
const port = env.port;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await disconnectPrisma();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await disconnectPrisma();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}`);
});

