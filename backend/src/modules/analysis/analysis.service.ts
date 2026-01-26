import { validatePdf, extractTextFromPdf } from "../documents/documents.service.js";
import { buildPrompt } from "../ai/prompt.builder.js";
import { generateCompletion } from "../ai/llm.provider.js";
import { prisma } from "../../db/client.js";

type CreateAnalysisInput = {
  userId: string;
  file: Express.Multer.File;
  userPrompt?: string;
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
    return {
      status: "warning",
      message: "The document contains no readable text",
    };
  }

  const document = await prisma.document.create({
    data: {
      userId,
      content: documentText,
    },
  });

  await prisma.analysis.updateMany({
    where: {
      documentId: document.id,
      status: "final",
    },
    data: {
      status: "discarded",
    },
  });

  const { system : systemPrompt, user: finalUserPrompt } = buildPrompt(
    userPrompt !== undefined
      ? { documentText, userPrompt }
      : { documentText }
  );

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
      status: "final",
      result: aiResult,
    },
  });

  return {
    status: "success",
    data: analysis.result,
  };
};

export const analysisService = {
  createAnalysis,
};