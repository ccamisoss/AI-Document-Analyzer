import dotenv from "dotenv";

dotenv.config();

//Centralized environment configuration.
export const env = {
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : true,

  databaseUrl: process.env.DATABASE_URL,
  openaiApiKey: process.env.OPENAI_API_KEY,
  jwtSecret: process.env.JWT_SECRET,
} as const;

export function validateEnv() {
  const missing: string[] = [];

  if (!env.databaseUrl) {
    missing.push("DATABASE_URL");
  }

  if (!env.jwtSecret) {
    missing.push("JWT_SECRET");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

