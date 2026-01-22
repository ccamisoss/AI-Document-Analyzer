import { type Request, type Response } from "express";
import { registerUser, loginUser } from "./auth.service.js";

const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing required fields: email, password",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    const result = await registerUser({ email, password });

    res.status(201).json({
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Email already registered") {
        return res.status(409).json({
          error: error.message,
        });
      }
      if (error.message.includes("Password must be")) {
        return res.status(400).json({
          error: error.message,
        });
      }
    }

    console.error("Register error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing required fields: email, password",
      });
    }

    const result = await loginUser({ email, password });

    res.status(200).json({
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "The password is incorrect" || error.message === "This email is not registered") {
        return res.status(401).json({
          error: error.message,
        });
      }
    }

    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export { register, login };