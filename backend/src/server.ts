import { createApp } from "./app.js";
import { env, validateEnv } from "./config/env.js";

validateEnv();

const app = createApp();
const port = env.port;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

app.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}`);
});

