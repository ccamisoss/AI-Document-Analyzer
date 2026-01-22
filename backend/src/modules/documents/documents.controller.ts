import { type Request, type Response } from "express";
import { createDocumentService } from "./documents.service.js";


const createDocument = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const userId = req.user?.id;

    if (!content) {
      return res.status(400).json({
        error: "Document content is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const document = await createDocumentService(userId, content);

    return res.status(201).json({
      data: document,
    });
  } catch (error) {
    console.error("Create document error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export { createDocument };
