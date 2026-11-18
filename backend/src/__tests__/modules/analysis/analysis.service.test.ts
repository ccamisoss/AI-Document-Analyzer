import fs from "node:fs";
import path from "node:path";
import { prisma } from "../../../db/client.ts";
import type { Prisma } from "@prisma/client/wasm";
import { analysisService } from "../../../modules/analysis/analysis.service.ts";
import type { ApiResult, ApiSuccess } from "../../../http/api-response.ts";
import {
  deleteTestUser,
  deleteTestUserByEmail,
} from "../../helpers/db.ts";

jest.mock("../../../db/supabase.ts", () => ({
  uploadFile: jest.fn(async () => "uploads/validPdf.pdf"),
  deleteFile: jest.fn(async () => undefined),
}));

jest.mock("../../../modules/ai/llm.provider.ts", () => ({
  generateCompletion: jest.fn(async () =>
    JSON.stringify({
      summary: "A short summary of the document.",
      keyPoints: ["First point"],
      insights: ["First insight"],
    }),
  ),
}));

const { deleteAnalysis, createAnalysis, createAnalysisAndDocument } =
  analysisService;

const userEmail = "analysis.service@test.com";

let user: Prisma.UserCreateInput = {
  name: "Test User",
  email: userEmail,
  password: "test",
};

function assertSuccess<T>(
  result: ApiResult<T>,
): asserts result is ApiSuccess<T> & { data: T } {
  if (result.status !== "success" || result.data === undefined) {
    throw new Error(`expected success, got ${JSON.stringify(result)}`);
  }
}

const validFileBuffer = fs.readFileSync(
  path.join(__dirname, "../..", "fixtures", "validPdf.pdf"),
);
const invalidFileBuffer = fs.readFileSync(
  path.join(__dirname, "../..", "fixtures", "textDocument.txt"),
);
const emptyFileBuffer = fs.readFileSync(
  path.join(__dirname, "../..", "fixtures", "emptyPdf.pdf"),
);

const emptyFile = {
  buffer: emptyFileBuffer,
  mimetype: "application/pdf",
  originalname: "emptyPdf.pdf",
} as Express.Multer.File;

const invalidFile = {
  buffer: invalidFileBuffer,
  mimetype: "text/plain",
  originalname: "textDocument.txt",
} as Express.Multer.File;

const validFile = {
  buffer: validFileBuffer,
  mimetype: "application/pdf",
  originalname: "validPdf.pdf",
} as Express.Multer.File;

beforeAll(async () => {
  await deleteTestUserByEmail(userEmail);
  user = await prisma.user.create({
    data: user,
  });
});

describe("Analysis Service - Create Analysis and Document", () => {
  it("should create a document and an analysis given a valid pdf file and user id", async () => {
    const data = await createAnalysisAndDocument({
      userId: user.id!,
      file: validFile,
      userPrompt: "Test Prompt",
    });

    assertSuccess(data);

    expect(data.status).toBe("success");
    expect(data.data).toMatchObject({
      analysis: { userPrompt: "Test Prompt" },
      document: {
        filename: validFile.originalname,
        path: expect.any(String),
      },
    });

    expect(data.data?.analysis.result).toHaveProperty("summary");
    expect(data.data?.analysis.result).toHaveProperty("insights");
    expect(data.data?.analysis.result).toHaveProperty("keyPoints");
  });

  it("should return a warning message if the file is not a pdf", async () => {
    const data = await createAnalysisAndDocument({
      userId: user.id!,
      file: invalidFile,
    });

    expect(data).toEqual({
      status: "warning",
      message: "Only PDF documents are allowed",
      httpStatus: 400,
    });
  });

  it("should return a warning message if the file has no readable text", async () => {
    const data = await createAnalysisAndDocument({
      userId: user.id!,
      file: emptyFile,
    });

    expect(data).toEqual({
      status: "warning",
      message: "The document contains no readable text",
      httpStatus: 400,
    });
  });
});

describe("Analysis Service - Create Analysis", () => {
  it("should not generate an analysis if the document does not belong to the user", async () => {
    const data = await createAnalysis({
      userId: user.id!,
      documentId: 99,
    });

    expect(data).toEqual({
      status: "warning",
      message: "Document not found",
      httpStatus: 404,
    });
  });
});

describe("Analysis Service - Delete Analysis", () => {
  it("should delete an analysis given a valid analysis id and user id", async () => {
    const document = await prisma.document.create({
      data: {
        userId: user.id!,
        filename: validFile.originalname,
        path: "uploads/validPdf.pdf",
        content: "Test document text",
        hash: "analysis-delete-test",
      },
    });
    const analysis = await prisma.analysis.create({
      data: {
        documentId: document.id,
        userPrompt: "Test Prompt",
        result: { summary: "Test" },
      },
    });

    const data = await deleteAnalysis({
      userId: user.id!,
      analysisId: analysis.id,
    });

    expect(data).toEqual({ deletedCount: 1 });
  });

  it("should return property ´deletedCount´ as 0 if the analysis is not found", async () => {
    const data = await deleteAnalysis({
      userId: user.id!,
      analysisId: 99,
    });

    expect(data.deletedCount).toBe(0);
  });
});

afterAll(async () => {
  await deleteTestUser(user.id);
});
