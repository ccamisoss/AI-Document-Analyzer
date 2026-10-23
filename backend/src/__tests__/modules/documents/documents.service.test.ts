import { prisma } from "../../../db/client.ts";
import { documentsService } from "../../../modules/documents/documents.service.ts";
import {
  deleteTestUser,
  deleteTestUserByEmail,
} from "../../helpers/db.ts";
const { getDocuments, deleteDocument } = documentsService;

const userEmail = "documents.service@test.com";

let userId: string;
let document: { id: number; filename: string; path: string };

beforeAll(async () => {
  await deleteTestUserByEmail(userEmail);

  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: userEmail,
      password: "test",
    },
  });
  userId = user.id;

  document = await prisma.document.create({
    data: {
      userId,
      filename: "Test Document",
      path: "https://test.com/document.pdf",
      hash: "documents-service-test",
      content: "Test Content",
    },
  });
});

describe("Documents Service - Get Documents", () => {
  it("should return document data when a valid user id is provided", async () => {
    const data = await getDocuments({ userId });
    const first = data[0];
    expect(data.length).toBeGreaterThan(0);
    expect(first).toMatchObject({
      filename: document.filename,
      path: document.path,
    });
  });

  it("should return empty array when invalid ID is provided", async () => {
    const data = await getDocuments({ userId: "invalid" });
    expect(data.length).toBe(0);
  });
});

describe("Documents Service - Delete Document", () => {
  it("should return true when document is deleted", async () => {
    const data = await deleteDocument({
      userId,
      id: document.id,
    });
    expect(data.success).toBe(true);
  });

  it("should return false when document is not found", async () => {
    const data = await deleteDocument({
      userId,
      id: 999999,
    });
    expect(data.success).toBe(false);
  });
});

afterAll(async () => {
  await deleteTestUser(userId);
});
