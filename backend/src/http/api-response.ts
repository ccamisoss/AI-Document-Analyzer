import { type Response } from "express";

export type ApiSuccess<T = unknown> = {
  status: "success";
  message?: string;
  data?: T;
};

export type ApiFailure = {
  status: "warning" | "error";
  message: string;
  httpStatus: number;
};

export type ApiResult<T = unknown> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data?: T, message?: string): ApiSuccess<T> {
  const result: ApiSuccess<T> = { status: "success" };

  if (message !== undefined) {
    result.message = message;
  }

  if (data !== undefined) {
    result.data = data;
  }

  return result;
}

export function warning(message: string, httpStatus = 400): ApiFailure {
  return { status: "warning", message, httpStatus };
}

export function fail(message: string, httpStatus = 500): ApiFailure {
  return { status: "error", message, httpStatus };
}

export function sendResult(
  res: Response,
  result: ApiResult,
  successStatus = 200,
) {
  if (result.status === "success") {
    const body: { status: "success"; message?: string; data?: unknown } = {
      status: "success",
    };

    if (result.message !== undefined) {
      body.message = result.message;
    }

    if (result.data !== undefined) {
      body.data = result.data;
    }

    return res.status(successStatus).json(body);
  }

  return res.status(result.httpStatus).json({
    status: result.status,
    message: result.message,
  });
}

export function sendUnauthorized(res: Response, message = "Unauthorized") {
  return sendResult(res, warning(message, 401));
}

export function sendInternalError(
  res: Response,
  logLabel: string,
  error: unknown,
) {
  console.error(logLabel, error);
  return sendResult(res, fail("Internal server error"));
}

export function parseRouteId(
  value: string | string[] | undefined,
  resource: string,
): { id: number } | { error: ApiFailure } {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return { error: warning(`${resource} id is required`) };
  }

  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    return { error: warning(`${resource} id must be a positive integer`) };
  }

  return { id };
}
