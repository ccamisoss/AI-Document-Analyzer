import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import {
  deleteDocument,
  getAnalysesByDocumentId,
  getDocuments,
} from "./documents.controller.js";

const documentsRouter = Router();

documentsRouter.get("/", authenticate, getDocuments);
documentsRouter.delete("/:id", authenticate, deleteDocument);
documentsRouter.get("/:id/analyses", authenticate, getAnalysesByDocumentId);

export default documentsRouter;

