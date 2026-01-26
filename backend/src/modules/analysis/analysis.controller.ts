import { type Request, type Response } from "express";
import { analysisService } from "./analysis.service.js";

const { createAnalysis : createAnalysisService } = analysisService

const createAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const file = req.file;
    const userPrompt = req.body.prompt;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!file) {
      return res.status(400).json({
        status: "warning",
        message: "PDF document is required",
      });
    }

    const result = await createAnalysisService({
      userId,
      file,
      userPrompt,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Create analysis error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export { createAnalysis };
