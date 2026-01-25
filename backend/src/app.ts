import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { env } from "./config/env.js";

import authRouter from "./modules/auth/auth.routes.js";
import analysisRouter from "./modules/analysis/analysis.routes.js";

export function createApp() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: "2mb" }));

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/auth", authRouter)
  app.use("/analysis", analysisRouter)

  app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}

