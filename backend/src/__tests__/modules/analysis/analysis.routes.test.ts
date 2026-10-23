import request from "supertest";
import type { Prisma } from "@prisma/client/wasm";
import { createApp } from "../../../app.ts";
import { prisma } from "../../../db/client.ts";
import { signToken } from "../../../modules/auth/jwt.ts";
import { analysisService } from "../../../modules/analysis/analysis.service.ts";
import {
  deleteTestUser,
  deleteTestUserByEmail,
} from "../../helpers/db.ts";

jest.mock("../../../modules/analysis/analysis.service.ts", () => ({
  analysisService: {
    createAnalysisAndDocument: jest.fn(),
  },
}));

const { createAnalysisAndDocument } = analysisService;

const userEmail = "analysis.routes@test.com";

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

describe("POST /analysis", () => {
  it("returns 400 when the request has no file", async () => {
    const response = await request(createApp())
    .post("/analysis")
    .set("Authorization", `Bearer ${signToken(user.id!)}`);
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "warning",
      message: "PDF document is required",
    });
    expect(createAnalysisAndDocument).not.toHaveBeenCalled();
  });
});

afterAll(async () => {
  await deleteTestUser(user.id);
});