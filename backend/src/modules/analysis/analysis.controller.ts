import { type Request, type Response } from "express";
import { analysisService } from "./analysis.service.js";
import {
  ok,
  parseRouteId,
  sendInternalError,
  sendResult,
  sendUnauthorized,
  warning,
} from "../../http/api-response.js";

const {
  createAnalysisAndDocument,
  createAnalysis: createAnalysisService,
  deleteAnalysis: deleteAnalysisService,
} = analysisService;

const createAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const file = req.file;
    const userPrompt = req.body?.prompt;
    const documentIdParam = req.params?.id;

    if (!userId) {
      return sendUnauthorized(res);
    }

    if (documentIdParam) {
      const parsedDocumentId = parseRouteId(documentIdParam, "Document");
      if ("error" in parsedDocumentId) {
        return sendResult(res, parsedDocumentId.error);
      }

      const result = await createAnalysisService({
        userId,
        documentId: parsedDocumentId.id,
        userPrompt,
      });

      return sendResult(res, result);
    }

    if (!file) {
      return sendResult(res, warning("PDF document is required"));
    }

    const result = await createAnalysisAndDocument({
      userId,
      file,
      userPrompt,
    });

    return sendResult(res, result);
  } catch (error) {
    return sendInternalError(res, "Create analysis error:", error);
  }
};

const deleteAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const parsedAnalysisId = parseRouteId(req.params.id, "Analysis");

    if (!userId) {
      return sendUnauthorized(res);
    }

    if ("error" in parsedAnalysisId) {
      return sendResult(res, parsedAnalysisId.error);
    }

    const { deletedCount } = await deleteAnalysisService({
      userId,
      analysisId: parsedAnalysisId.id,
    });

    if (deletedCount === 0) {
      return sendResult(res, warning("Analysis not found", 404));
    }

    return sendResult(
      res,
      ok({ deletedCount }, "Analysis deleted successfully"),
    );
  } catch (error) {
    return sendInternalError(res, "Delete analysis error:", error);
  }
};

export { createAnalysis, deleteAnalysis };
