import request from "supertest";
import type { Prisma } from "@prisma/client/wasm";
import { createApp } from "../../../app.ts";
import { registerUser, loginUser } from "../../../modules/auth/auth.service.ts";
import { randomUUID } from "crypto";
import type { ApiSuccess } from "../../../http/api-response.ts";

let userRequest: Prisma.UserCreateInput = {
  email: "auth.routes@test.com",
  password: "test1234",
};

let successResponse: ApiSuccess<{
  user: { id: string; email: string };
  token: string;
}> = {
  status: "success",
  data: {
    user: {
      id: randomUUID(),
      email: userRequest.email,
    },
    token: randomUUID(),
  },
};

jest.mock("../../../modules/auth/auth.service.ts", () => ({
  registerUser: jest.fn(async () => successResponse),
  loginUser: jest.fn(async () => successResponse),
}));

describe("POST /auth/register", () => {
  it("returns error message when fields are missing", async () => {
    const response = await request(createApp()).post("/auth/register").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "warning",
      message: "Missing required fields: email, password",
    });
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("returns error message when email is invalid", async () => {
    const response = await request(createApp())
      .post("/auth/register")
      .send({ email: "invalid", password: "test" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "warning",
      message: "Invalid email format",
    });
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("successfully registers user when fields are valid", async () => {
    const response = await request(createApp())
      .post("/auth/register")
      .send(userRequest);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(successResponse);
    expect(registerUser).toHaveBeenCalledWith(userRequest);
  });
});

describe("POST /auth/login", () => {
  it("returns error message when fields are missing", async () => {
    const response = await request(createApp()).post("/auth/login").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "warning",
      message: "Missing required fields: email, password",
    });
    expect(loginUser).not.toHaveBeenCalled();
  });

  it("successfully logs in user when fields are valid", async () => {
    const response = await request(createApp())
      .post("/auth/login")
      .send(userRequest);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(successResponse);
    expect(loginUser).toHaveBeenCalledWith(userRequest);
  });
});
