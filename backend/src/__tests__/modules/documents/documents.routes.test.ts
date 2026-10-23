import request from "supertest";
import { createApp } from "../../../app.ts";
import { prisma } from "../../../db/client.ts";
import { deleteTestUser, deleteTestUserByEmail } from "../../helpers/db.ts";
import type { Prisma } from "@prisma/client/wasm";
import { signToken } from "../../../modules/auth/jwt.ts";
import { documentsService } from "../../../modules/documents/documents.service.ts";

jest.mock("../../../modules/documents/documents.service.ts", () => {
  const actual = jest.requireActual(
    "../../../modules/documents/documents.service.ts",
  );
  return {
    ...actual,
    documentsService: {
      ...actual.documentsService,
      getDocument: jest.fn(),
      deleteDocument: jest.fn().mockResolvedValue({ success: false }),
    },
  };
});

const { getDocument, deleteDocument } = documentsService;

const userEmail = "documents.routes@test.com";

let user: Prisma.UserCreateInput = {
  name: "Test User",
  email: userEmail,
  password: "test",
};

beforeAll(async () => {
  await deleteTestUserByEmail(userEmail);
  user = await prisma.user.create({
    data: user,
  });
});

describe("GET /documents/:id", () => {
  it("returns error message when the document id is malformed", async () => {
    const response = await request(createApp())
      .get("/documents/invalid-id")
      .set("Authorization", `Bearer ${signToken(user.id!)}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "warning",
      message: "Document id must be a positive integer",
    });
    expect(getDocument).not.toHaveBeenCalled();
  });

  it("returns error message when the document does not exist", async () => {
    const response = await request(createApp())
      .get("/documents/9999999")
      .set("Authorization", `Bearer ${signToken(user.id!)}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: "warning",
      message: "Document not found",
    });
    expect(getDocument).toHaveBeenCalledWith({
      userId: user.id!,
      id: 9999999,
    });
  });
});

describe("DELETE /documents/:id", () => {
  it("returns error message when the document service returns document not found", async () => {
    const response = await request(createApp())
      .delete("/documents/9999999")
      .set("Authorization", `Bearer ${signToken(user.id!)}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: "warning",
      message: "Document not found",
    });
    expect(deleteDocument).toHaveBeenCalledWith({
      userId: user.id!,
      id: 9999999,
    });
  });
});

afterAll(async () => {
  await deleteTestUser(user.id);
});
