import type { Prisma } from "@prisma/client/wasm";
import { prisma } from "../../db/client.ts";
import { documentsService } from "../../modules/documents/documents.service.ts";
const { getDocuments, deleteDocument } = documentsService;

let user: Prisma.UserCreateInput = {
  name: "Test User",
  email: "test123@test.com",
  password: "test",
};

let document: Prisma.DocumentCreateInput & { id: number } = {
  id: 0,
  filename: "Test Document",
  path: "https://test.com/document.pdf",
  hash: "test",
  content: "Test Content",
};

beforeAll(async () => {
  user = await prisma.user.create({
    data: user,
  });

  document = await prisma.document.create({
    data: {
      userId: user.id!,
      ...document,
    },
  });
});

describe("Documents Service - Get Documents", () => {
  it("should return document data when a valid user id is provided", async () => {
    const data = await getDocuments({ userId: user.id! });
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].filename).toBe(document.filename);
    expect(data[0].path).toBe(document.path);
  });

  it("should return empty array when invalid ID is provided", async () => {
    const data = await getDocuments({ userId: "invalid" });
    expect(data.length).toBe(0);
  });
});

describe("Documents Service - Delete Document", () => {
  it("should return true when document is deleted", async () => {
    const data = await deleteDocument({
      userId: user.id!,
      id: document.id!,
    });
    expect(data.success).toBe(true);
  });

  it("should return false when document is not found", async () => {
    const data = await deleteDocument({
      userId: user.id!,
      id: 999999,
    });
    expect(data.success).toBe(false);
  });
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.document.deleteMany();
});
