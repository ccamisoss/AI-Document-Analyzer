import { type Request, type Response } from "express";
import { registerUser, loginUser } from "./auth.service.js";
import {
  sendInternalError,
  sendResult,
  warning,
} from "../../http/api-response.js";

const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResult(
        res,
        warning("Missing required fields: email, password"),
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResult(res, warning("Invalid email format"));
    }

    const result = await registerUser({ email, password });
    return sendResult(res, result, 201);
  } catch (error) {
    return sendInternalError(res, "Register error:", error);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResult(
        res,
        warning("Missing required fields: email, password"),
      );
    }

    const result = await loginUser({ email, password });
    return sendResult(res, result);
  } catch (error) {
    return sendInternalError(res, "Login error:", error);
  }
};

export { register, login };
