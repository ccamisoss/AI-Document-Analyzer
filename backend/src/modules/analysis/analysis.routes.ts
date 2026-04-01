import { Router } from "express";
import multer from "multer";
import { authenticate } from "../auth/auth.middleware.js";
import { createAnalysis, deleteAnalysis } from "./analysis.controller.js";

const analysisRouter = Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

analysisRouter.post("/", authenticate, upload.single("file"), createAnalysis);
analysisRouter.delete("/:id", authenticate, deleteAnalysis);

export default analysisRouter;
