import {
  validatePdf,
  extractTextFromPdf,
  getPdfFileData,
} from "../documents/documents.service.js";
import { buildPrompt } from "../ai/prompt.builder.js";
import { generateCompletion } from "../ai/llm.provider.js";
import { prisma } from "../../db/client.js";
import crypto from "crypto";
import { unlink } from "node:fs/promises";

const generateDocumentHash = (buffer: Buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

type CreateAnalysisAndDocumentInput = {
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

const createAnalysisAndDocument = async ({
  userId,
  file,
  userPrompt,
}: CreateAnalysisAndDocumentInput) => {
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
    data: {
      analysis: analysis.result,
      document: document,
    },
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

const deleteAnalysis = async ({
  userId,
  analysisId,
}: DeleteAnalysisInput): Promise<{ deletedCount: number }> => {
  const result = await prisma.analysis.deleteMany({
    where: {
      id: analysisId,
      document: {
        userId,
      },
    },
  });

  return { deletedCount: result.count };
};

type CreateAnalysisInput = {
  userId: string;
  documentId: number;
  userPrompt?: string;
};

const createAnalysis = async ({
  userId,
  documentId,
  userPrompt,
}: CreateAnalysisInput) => {

  let document = await prisma.document.findFirst({
    where: {
      userId,
      id: documentId,
    },
  });

  if (!document) {
    return {
      status: "error",
      message: "Document not found",
    };
  }

  const promptResult = buildPrompt(
    userPrompt !== undefined
      ? { documentText: document.content, userPrompt }
      : { documentText: document.content },
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
    data: {
      analysis: analysis.result,
      document,
    },
  };
};

export const analysisService = {
  createAnalysisAndDocument,
  createAnalysis,
  getAnalysesByDocumentId,
  deleteAnalysis,
};
