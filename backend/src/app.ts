import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { sendInternalError, sendResult, warning } from "./http/api-response.js";

import authRouter from "./modules/auth/auth.routes.js";
import analysisRouter from "./modules/analysis/analysis.routes.js";
import documentsRouter from "./modules/documents/documents.routes.js";


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

  app.use("/auth", authRouter);
  app.use("/analysis", analysisRouter);
  app.use("/documents", documentsRouter);

  app.use((_req, res) => {
    sendResult(res, warning("Not Found", 404));
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    sendInternalError(res, "Unhandled error:", err);
  });

  return app;
}
