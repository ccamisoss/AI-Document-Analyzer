import { type Request, type Response, type NextFunction } from "express";
import { verifyToken } from "./jwt.js";
import { prisma } from "../../db/client.js";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Authorization header is required",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        error: "Invalid authorization format. Expected: Bearer <token>",
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        error: "Token is required",
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid token") {
          return res.status(401).json({
            error: error.message,
          });
        }
        if (error.message === "Token expired") {
          return res.status(401).json({
            error: error.message,
          });
        }
      }
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      error: "Internal server error during authentication",
    });
  }
}
