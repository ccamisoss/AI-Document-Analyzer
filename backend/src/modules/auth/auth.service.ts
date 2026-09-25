import bcrypt from "bcrypt";
import { prisma } from "../../db/client.js";
import { signToken } from "./jwt.js";
import { fail, ok, warning, type ApiResult } from "../../http/api-response.js";

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export async function registerUser(
  input: RegisterInput,
): Promise<ApiResult<AuthResult>> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return warning("Email already registered", 409);
    }

    if (input.password.length < 8) {
      return warning("Password must be at least 8 characters");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      },
    });

    const token = signToken(user.id);

    return ok({
      user,
      token,
    });
  } catch (error) {
    console.error("Register user error:", error);
    return fail("Internal server error");
  }
}

export async function loginUser(
  input: LoginInput,
): Promise<ApiResult<AuthResult>> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return warning("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      return warning("Invalid email or password", 401);
    }

    const token = signToken(user.id);

    return ok({
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login user error:", error);
    return fail("Internal server error");
  }
}
