import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { createDocument } from "./documents.controller.js";

const documentsRouter = Router();

documentsRouter.post("/", authenticate, createDocument);

export default documentsRouter;