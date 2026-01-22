import bcrypt from "bcrypt";
import { prisma } from "../../db/client.js";
import { signToken, verifyToken } from "./jwt.js";

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

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
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

  return {
    user,
    token,
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      password: true,
    },
  });

  if (!user) {
    throw new Error("This email is not registered");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new Error("The password is incorrect");
  }

  const token = signToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    token,
  };
}
