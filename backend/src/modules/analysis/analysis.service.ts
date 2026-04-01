import {
  validatePdf,
  extractTextFromPdf,
  getPdfFileData,
  documentsService,
} from "../documents/documents.service.js";
import { buildPrompt } from "../ai/prompt.builder.js";
import { generateCompletion } from "../ai/llm.provider.js";
import { prisma } from "../../db/client.js";
import crypto from "crypto";
import { unlink } from "node:fs/promises";

const generateDocumentHash = (buffer: Buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

type CreateAnalysisInput = {
  userId: string;
  file: Express.Multer.File;
  userPrompt?: string;
};

const cleanupUploadedFile = async (file: Express.Multer.File) => {
  // For diskStorage uploads, remove temporary files we don't need to keep.
  if (!file.path || file.buffer?.length) {
    return;
  }

  try {
    await unlink(file.path);
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      console.warn("Failed to remove uploaded file:", error);
    }
  }
};

const createAnalysis = async ({
  userId,
  file,
  userPrompt,
}: CreateAnalysisInput) => {
  const validation = validatePdf(file);

  if (!validation.valid) {
    return {
      status: "warning",
      message: validation.message,
    };
  }

  let documentText: string;

  try {
    documentText = await extractTextFromPdf(file);
  } catch (error) {
    await cleanupUploadedFile(file);
    console.error("PDF extraction error:", error);
    return {
      status: "error",
      message: "Failed to extract text from the PDF document",
    };
  }

  const cleanedText = documentText
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")
    .trim();

  if (!cleanedText) {
    await cleanupUploadedFile(file);
    return {
      status: "warning",
      message: "The document contains no readable text",
    };
  }

  const fileData = await getPdfFileData(file);
  const fileHash = generateDocumentHash(fileData);

  let document = await prisma.document.findFirst({
    where: {
      userId,
      hash: fileHash,
    },
  });

  if (!document) {
    document = await prisma.document.create({
      data: {
        userId,
        content: documentText,
        hash: fileHash,
        filename: file.originalname,
        path: file.path,
      },
    });
  } else {
    await cleanupUploadedFile(file);
  }

  const promptResult = buildPrompt(
    userPrompt !== undefined ? { documentText, userPrompt } : { documentText },
  );

  const {
    system: systemPrompt,
    user: finalUserPrompt,
    version: promptVersion,
  } = promptResult;

  let rawResponse: string;

  try {
    rawResponse = await generateCompletion({
      systemPrompt,
      userPrompt: finalUserPrompt,
    });
  } catch (error) {
    console.error("LLM call error:", error);
    return {
      status: "error",
      message: "AI service failed to generate a response",
    };
  }

  let aiResult: any;

  try {
    aiResult = JSON.parse(rawResponse);
  } catch {
    return {
      status: "error",
      message: "AI returned malformed JSON",
    };
  }

  if (
    typeof aiResult.summary !== "string" ||
    !Array.isArray(aiResult.keyPoints) ||
    !Array.isArray(aiResult.insights)
  ) {
    return {
      status: "error",
      message: "Invalid AI response structure",
    };
  }

  const analysis = await prisma.analysis.create({
    data: {
      documentId: document.id,
      ...(userPrompt && { userPrompt }),
      promptVersion,
      result: aiResult,
    },
  });

  return {
    status: "success",
    data: analysis.result,
  };
};

type GetAnalysesByDocumentIdInput = {
  userId: string;
  documentId: number;
};

const getAnalysesByDocumentId = async ({
  userId,
  documentId,
}: GetAnalysesByDocumentIdInput) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
    select: { id: true },
  });

  if (!document) {
    return null;
  }

  return prisma.analysis.findMany({
    where: { documentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      documentId: true,
      userPrompt: true,
      promptVersion: true,
      result: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

type DeleteAnalysisInput = {
  userId: string;
  analysisId: number;
};

type DeleteAnalysisResult = {
  success: boolean;
  deletedDocument: boolean;
  error?: string;
};

const deleteAnalysis = async ({
  userId,
  analysisId,
}: DeleteAnalysisInput): Promise<DeleteAnalysisResult> => {
  let response: DeleteAnalysisResult = { success: true, deletedDocument: false };

  const analysis = await prisma.analysis.findFirst({
    where: {
      id: analysisId,
      document: {
        userId,
      },
    },
  });

  if (!analysis) {
    response.success = false;
    response.error = "Analysis not found";
    return response;
  }

  await prisma.analysis.delete({
    where: {
      id: analysisId,
    },
  });

  const remainingAnalyses = await prisma.analysis.count({
    where: {
      documentId: analysis.documentId,
    },
  });

  if (remainingAnalyses === 0) {
    const document = await prisma.document.findUnique({
      where: {
        id: analysis.documentId,
      },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    await documentsService.deleteDocument({
      userId,
      id: document.id,
    });

    response.deletedDocument = true;
  }

  return response;
};

export const analysisService = {
  createAnalysis,
  getAnalysesByDocumentId,
  deleteAnalysis,
};
