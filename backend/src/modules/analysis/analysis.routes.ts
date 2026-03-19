import { Router } from "express";
import multer from "multer";
import { authenticate } from "../auth/auth.middleware.js";
import { createAnalysis } from "./analysis.controller.js";

const analysisRouter = Router();

const upload = multer({
  storage: multer.memoryStorage()
});

analysisRouter.post("/", authenticate, upload.single("file"), createAnalysis);

export default analysisRouter;