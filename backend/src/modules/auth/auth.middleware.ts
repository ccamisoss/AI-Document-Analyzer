import { type Request, type Response, type NextFunction } from "express";
import { verifyToken } from "./jwt.js";
import { prisma } from "../../db/client.js";
import {
  sendInternalError,
  sendResult,
  sendUnauthorized,
  warning,
} from "../../http/api-response.js";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return sendResult(res, warning("Authorization header is required", 401));
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return sendResult(
        res,
        warning("Invalid authorization format. Expected: Bearer <token>", 401),
      );
    }

    const token = parts[1];

    if (!token) {
      return sendResult(res, warning("Token is required", 401));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "JWT_SECRET is not configured"
      ) {
        throw error;
      }

      return sendResult(res, warning("Invalid or expired token", 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return sendUnauthorized(res);
    }

    req.user = user;

    next();
  } catch (error) {
    return sendInternalError(res, "Authentication error:", error);
  }
}
