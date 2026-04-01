import { type Request, type Response } from "express";
import { documentsService } from "./documents.service.js";
import { analysisService } from "../analysis/analysis.service.js";

const { getDocuments: getDocumentsService, deleteDocument: deleteDocumentService } = documentsService;
const { getAnalysesByDocumentId: getAnalysesByDocumentIdService } = analysisService;

const getDocuments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const documents = await getDocumentsService({ userId });

    return res.status(200).json({
      status: "success",
      data: documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const deleteDocument = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!id) {
      return res.status(400).json({
        status: "warning",
        message: "Document id is required",
      });
    }

    const documentIdNum = Number(id);
    if (!Number.isInteger(documentIdNum) || documentIdNum < 1) {
      return res.status(400).json({
        status: "warning",
        message: "Document id must be a positive integer",
      });
    }

    const { success } = await deleteDocumentService({
      userId,
      id: documentIdNum,
    });

    if (!success) {
      return res.status(404).json({
        status: "warning",
        message: "Document not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export { getDocuments, deleteDocument };

const getAnalysesByDocumentId = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const idParam = req.params.id;
    const documentId = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!documentId) {
      return res.status(400).json({
        status: "warning",
        message: "Document id is required",
      });
    }

    const documentIdNum = Number(documentId);
    if (!Number.isInteger(documentIdNum) || documentIdNum < 1) {
      return res.status(400).json({
        status: "warning",
        message: "Document id must be a positive integer",
      });
    }

    const analyses = await getAnalysesByDocumentIdService({
      userId,
      documentId: documentIdNum,
    });

    if (!analyses) {
      return res.status(404).json({
        status: "warning",
        message: "Document not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: analyses,
    });
  } catch (error) {
    console.error("Get analyses error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export { getAnalysesByDocumentId };

