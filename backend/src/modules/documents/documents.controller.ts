import { type Request, type Response } from "express";
import { documentsService } from "./documents.service.js";
import { analysisService } from "../analysis/analysis.service.js";
import {
  ok,
  parseRouteId,
  sendInternalError,
  sendResult,
  sendUnauthorized,
  warning,
} from "../../http/api-response.js";

const {
  getDocuments: getDocumentsService,
  deleteDocument: deleteDocumentService,
  getDocument: getDocumentService,
} = documentsService;
const { getAnalysesByDocumentId: getAnalysesByDocumentIdService } =
  analysisService;

const getDocuments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendUnauthorized(res);
    }

    const documents = await getDocumentsService({ userId });
    return sendResult(res, ok(documents));
  } catch (error) {
    return sendInternalError(res, "Get documents error:", error);
  }
};

const deleteDocument = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const parsedDocumentId = parseRouteId(req.params.id, "Document");

    if (!userId) {
      return sendUnauthorized(res);
    }

    if ("error" in parsedDocumentId) {
      return sendResult(res, parsedDocumentId.error);
    }

    const { success } = await deleteDocumentService({
      userId,
      id: parsedDocumentId.id,
    });

    if (!success) {
      return sendResult(res, warning("Document not found", 404));
    }

    return sendResult(res, {
      status: "success",
      message: "Document deleted successfully",
    });
  } catch (error) {
    return sendInternalError(res, "Delete document error:", error);
  }
};

const getAnalysesByDocumentId = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const parsedDocumentId = parseRouteId(req.params.id, "Document");

    if (!userId) {
      return sendUnauthorized(res);
    }

    if ("error" in parsedDocumentId) {
      return sendResult(res, parsedDocumentId.error);
    }

    const analyses = await getAnalysesByDocumentIdService({
      userId,
      documentId: parsedDocumentId.id,
    });

    if (!analyses) {
      return sendResult(res, warning("Document not found", 404));
    }

    return sendResult(res, ok(analyses));
  } catch (error) {
    return sendInternalError(res, "Get analyses error:", error);
  }
};

const getDocument = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const parsedDocumentId = parseRouteId(req.params.id, "Document");

    if (!userId) {
      return sendUnauthorized(res);
    }

    if ("error" in parsedDocumentId) {
      return sendResult(res, parsedDocumentId.error);
    }

    const document = await getDocumentService({
      userId,
      id: parsedDocumentId.id,
    });

    if (!document) {
      return sendResult(res, warning("Document not found", 404));
    }

    return sendResult(res, ok(document));
  } catch (error) {
    return sendInternalError(res, "Get document by id error:", error);
  }
};

export { getDocuments, deleteDocument, getAnalysesByDocumentId, getDocument };
