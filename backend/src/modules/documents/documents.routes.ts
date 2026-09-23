import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import {
  deleteDocument,
  getAnalysesByDocumentId,
  getDocuments,
  getDocument,
} from "./documents.controller.js";
import { createAnalysis } from "../analysis/analysis.controller.js";

const documentsRouter = Router();

documentsRouter.get("/", authenticate, getDocuments);
documentsRouter.get("/:id", authenticate, getDocument);
documentsRouter.delete("/:id", authenticate, deleteDocument);
documentsRouter.get("/:id/analyses", authenticate, getAnalysesByDocumentId);
documentsRouter.post("/:id/analyses", authenticate, createAnalysis);

export default documentsRouter;

