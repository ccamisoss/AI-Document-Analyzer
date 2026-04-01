import { DOMMatrix, ImageData, Path2D, DOMPoint, DOMRect } from "@napi-rs/canvas";
import { prisma } from "../../db/client.js";
import { readFile } from "node:fs/promises";

// `pdf-parse` uses `pdfjs-dist` under the hood. `pdfjs-dist` expects browser globals
// like `DOMMatrix` to exist. In Node, we provide them from `@napi-rs/canvas` before
// importing/initializing `pdf-parse`.
(globalThis as any).DOMMatrix = DOMMatrix;
(globalThis as any).ImageData = ImageData;
(globalThis as any).Path2D = Path2D;
(globalThis as any).DOMPoint = DOMPoint;
(globalThis as any).DOMRect = DOMRect;

let PDFParseCtor:
  | (new (options: { data: Buffer }) => { getText: () => Promise<{ text?: string }> })
  | undefined;

const getPDFParseCtor = async () => {
  if (PDFParseCtor) return PDFParseCtor;
  const mod = await import("pdf-parse");
  PDFParseCtor = mod.PDFParse;
  return PDFParseCtor;
};

const MAX_PDF_SIZE_MB = 10;
const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

type PdfValidationResult = {
  valid: boolean;
  message?: string;
};

const validatePdf = (file: Express.Multer.File): PdfValidationResult => {
  if (!file) {
    return {
      valid: false,
      message: "No file provided",
    };
  }

  if (file.mimetype !== "application/pdf") {
    return {
      valid: false,
      message: "Only PDF documents are allowed",
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      message: "The provided PDF document is empty",
    };
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return {
      valid: false,
      message: `PDF size exceeds the maximum allowed limit of ${MAX_PDF_SIZE_MB}MB`,
    };
  }

  return { valid: true };
};

const extractTextFromPdf = async (
  file: Express.Multer.File
): Promise<string> => {
  try {
    const data = await getPdfFileData(file);
    const PDFParse = await getPDFParseCtor();
    const parser = new PDFParse({ data });
    const result = await parser.getText();
    return result.text || "";
  } catch (error) {
    console.error("PDF parsing failed:", error);
    throw new Error("PDF_TEXT_EXTRACTION_FAILED");
  }
};

const getPdfFileData = async (file: Express.Multer.File): Promise<Buffer> => {
  if (file.buffer?.length) {
    return file.buffer;
  }

  if (file.path) {
    return readFile(file.path);
  }

  throw new Error("PDF_FILE_DATA_UNAVAILABLE");
};

type GetDocumentsInput = {
  userId: string;
};

const getDocuments = async ({ userId }: GetDocumentsInput) => {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      filename: true,
      path: true,
    },
  });
};

type DeleteDocumentInput = {
  userId: string;
  id: number;
};

const deleteDocument = async ({
  userId,
  id,
}: DeleteDocumentInput): Promise<{ deletedCount: number }> => {
  const result = await prisma.document.deleteMany({
    where: { id, userId },
  });

  return { deletedCount: result.count };
};

export const documentsService = {
  getDocuments,
  deleteDocument,
};

export {
  validatePdf,
  extractTextFromPdf,
  getPdfFileData,
};
