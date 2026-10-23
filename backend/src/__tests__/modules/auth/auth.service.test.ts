import type { Prisma } from "@prisma/client/wasm";
import { prisma } from "../../../db/client.ts";
import bcrypt from "bcrypt";
import { registerUser, loginUser } from "../../../modules/auth/auth.service.ts";

let userId: string;
let user: Prisma.UserCreateInput = {
  name: "Test User",
  email: "test1234@test.com",
  password: "test1234",
};

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const data = await prisma.user.create({
    data: {
      ...user,
      password: hashedPassword,
    },
  });
  userId = data.id;
});

describe("Auth Service - Register", () => {
  it("should return an error if the email is already registered", async () => {
    const result = await registerUser({
      email: user.email,
      password: user.password,
    });

    expect(result).toMatchObject({
      status: "warning",
      message: "Email already registered",
      httpStatus: 409,
    });
  });

  it("should return an error if the password is less than 8 characters", async () => {
    const result = await registerUser({
      email: "random@test.com",
      password: "test",
    });

    expect(result).toMatchObject({
      status: "warning",
      message: "Password must be at least 8 characters",
      httpStatus: 400,
    });
  });
});

describe("Auth Service - Login", () => {
  it("should return an error if the password is incorrect", async () => {
    const result = await loginUser({
      email: user.email,
      password: "incorrect",
    });

    expect(result).toMatchObject({
      status: "warning",
      message: "Invalid email or password",
      httpStatus: 401,
    });
  });

  it("should return an error if the email is incorrect", async () => {
    const result = await loginUser({
      email: "invalid@test.com",
      password: user.password,
    });

    expect(result).toMatchObject({
      status: "warning",
      message: "Invalid email or password",
      httpStatus: 401,
    });
  });

  it("should log in successfully", async () => {
    const result = await loginUser({
      email: user.email,
      password: user.password,
    });

    expect(result).toMatchObject({
      status: "success",
      data: {
        user: { id: userId, email: user.email },
        token: expect.any(String),
      },
    });
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: userId } });
});
