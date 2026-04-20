import { type Request, type Response } from "express";
import { analysisService } from "./analysis.service.js";

const {
  createAnalysisAndDocument,
  createAnalysis: createAnalysisService,
  deleteAnalysis: deleteAnalysisService,
} = analysisService;

const createAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const file = req.file;
    const userPrompt = req.body.prompt;
    const documentId = req.params?.id;
    let result = null;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (documentId) {
      result = await createAnalysisService({
        userId,
        documentId: Number(documentId),
        userPrompt,
      });
    } else {
      if (!file) {
        return res.status(400).json({
          status: "warning",
          message: "PDF document is required",
        });
      }

      result = await createAnalysisAndDocument({
        userId,
        file,
        userPrompt,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Create analysis error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const deleteAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const idParam = req.params.id;
    const analysisId = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!analysisId) {
      return res.status(400).json({
        status: "warning",
        message: "Analysis id is required",
      });
    }

    const analysisIdNum = Number(analysisId);
    if (!Number.isInteger(analysisIdNum) || analysisIdNum < 1) {
      return res.status(400).json({
        status: "warning",
        message: "Analysis id must be a positive integer",
      });
    }

    const { deletedCount } = await deleteAnalysisService({
      userId,
      analysisId: analysisIdNum,
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        status: "warning",
        message: "Analysis not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Analysis deleted successfully",
      data: { deletedCount },
    });
  } catch (error) {
    console.error("Delete analysis error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export { createAnalysis, deleteAnalysis };
