import { PDFParse } from "pdf-parse";

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
    const parser = new PDFParse({ data: file.buffer });
    const result = await parser.getText();
    return result.text || "";
  } catch (error) {
    console.error("PDF parsing failed:", error);
    throw new Error("PDF_TEXT_EXTRACTION_FAILED");
  }
};

export {
  validatePdf,
  extractTextFromPdf,
};
