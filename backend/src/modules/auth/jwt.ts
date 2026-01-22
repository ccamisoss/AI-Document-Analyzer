import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export function signToken(userId: string): string {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): { userId: string } {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    throw error;
  }
}
