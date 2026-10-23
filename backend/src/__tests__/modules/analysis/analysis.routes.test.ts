import request from "supertest";
import type { Prisma } from "@prisma/client/wasm";
import { createApp } from "../../../app.ts";
import { prisma } from "../../../db/client.ts";
import { signToken } from "../../../modules/auth/jwt.ts";
import { analysisService } from "../../../modules/analysis/analysis.service.ts";

jest.mock("../../../modules/analysis/analysis.service.ts", () => ({
  analysisService: {
    createAnalysisAndDocument: jest.fn(),
  },
}));

const { createAnalysisAndDocument } = analysisService;

let user: Prisma.UserCreateInput = {
  name: "Test User",
  email: "analysis.routes@test.com",
  password: "test",
};

beforeAll(async () => {
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
  await prisma.user.deleteMany({ where: { id: user.id! } });
});