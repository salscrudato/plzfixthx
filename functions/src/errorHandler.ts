/**
 * Error Handler Module
 * - Normalize errors to consistent format
 * - Map errors to appropriate HTTP status codes
 * - Provide user-friendly error messages
 * - Track error metrics
 */

import { Response } from "express";
import * as logger from "firebase-functions/logger";

export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = "BAD_REQUEST",
  INVALID_PAYLOAD = "INVALID_PAYLOAD",
  PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
  RATE_LIMITED = "RATE_LIMITED",
  MODERATION_REJECTED = "MODERATION_REJECTED",
  ABUSE_DETECTED = "ABUSE_DETECTED",

  // Server errors (5xx)
  AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
  AI_TIMEOUT = "AI_TIMEOUT",
  AI_VALIDATION_ERROR = "AI_VALIDATION_ERROR",
  PPTX_GENERATION_ERROR = "PPTX_GENERATION_ERROR",
  IMAGE_FETCH_ERROR = "IMAGE_FETCH_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId?: string;
  retryAfter?: number;
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Map error code to HTTP status code
 */
export function getStatusCode(code: ErrorCode): number {
  const statusMap: Record<ErrorCode, number> = {
    [ErrorCode.BAD_REQUEST]: 400,
    [ErrorCode.INVALID_PAYLOAD]: 400,
    [ErrorCode.PAYLOAD_TOO_LARGE]: 413,
    [ErrorCode.RATE_LIMITED]: 429,
    [ErrorCode.MODERATION_REJECTED]: 400,
    [ErrorCode.ABUSE_DETECTED]: 400,
    [ErrorCode.AI_SERVICE_ERROR]: 502,
    [ErrorCode.AI_TIMEOUT]: 504,
    [ErrorCode.AI_VALIDATION_ERROR]: 400,
    [ErrorCode.PPTX_GENERATION_ERROR]: 500,
    [ErrorCode.IMAGE_FETCH_ERROR]: 500,
    [ErrorCode.INTERNAL_ERROR]: 500,
  };
  return statusMap[code] || 500;
}

/**
 * Get user-friendly error message
 */
export function getUserMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.BAD_REQUEST]: "Invalid request",
    [ErrorCode.INVALID_PAYLOAD]: "Request payload is invalid",
    [ErrorCode.PAYLOAD_TOO_LARGE]: "Request is too large",
    [ErrorCode.RATE_LIMITED]: "Too many requests, please try again later",
    [ErrorCode.MODERATION_REJECTED]: "Content does not meet safety guidelines",
    [ErrorCode.ABUSE_DETECTED]: "Request flagged as abusive",
    [ErrorCode.AI_SERVICE_ERROR]: "AI service temporarily unavailable",
    [ErrorCode.AI_TIMEOUT]: "Request took too long, please try again",
    [ErrorCode.AI_VALIDATION_ERROR]: "Generated content failed validation",
    [ErrorCode.PPTX_GENERATION_ERROR]: "Failed to generate PowerPoint",
    [ErrorCode.IMAGE_FETCH_ERROR]: "Failed to fetch image",
    [ErrorCode.INTERNAL_ERROR]: "Internal server error",
  };
  return messages[code] || "An error occurred";
}

/**
 * Normalize any error to AppError
 */
export function normalizeError(error: unknown, _requestId?: string): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Timeout errors
    if (error.message.includes("timeout") || error.message.includes("TIMEOUT")) {
      return new AppError(
        ErrorCode.AI_TIMEOUT,
        "Request timeout",
        504,
        { originalMessage: error.message }
      );
    }

    // Validation errors
    if (error.message.includes("validation") || error.message.includes("Validation")) {
      return new AppError(
        ErrorCode.AI_VALIDATION_ERROR,
        "Validation failed",
        400,
        { originalMessage: error.message }
      );
    }

    // Network/service errors
    if (
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ENOTFOUND") ||
      error.message.includes("service")
    ) {
      return new AppError(
        ErrorCode.AI_SERVICE_ERROR,
        "Service unavailable",
        502,
        { originalMessage: error.message }
      );
    }

    // Generic error
    return new AppError(
      ErrorCode.INTERNAL_ERROR,
      error.message || "Unknown error",
      500,
      { originalMessage: error.message }
    );
  }

  return new AppError(
    ErrorCode.INTERNAL_ERROR,
    "Unknown error occurred",
    500,
    { originalError: String(error) }
  );
}

/**
 * Send normalized error response
 */
export function sendErrorResponse(
  res: Response,
  error: unknown,
  requestId?: string,
  retryAfter?: number
): void {
  const appError = normalizeError(error, requestId);
  const statusCode = getStatusCode(appError.code);

  logger.error("Error response", {
    requestId,
    code: appError.code,
    message: appError.message,
    statusCode,
    details: appError.details,
  });

  const response: ErrorResponse = {
    error: {
      code: appError.code,
      message: getUserMessage(appError.code),
      details: appError.details,
    },
    requestId,
  };

  if (retryAfter) {
    response.retryAfter = retryAfter;
    res.set("Retry-After", String(retryAfter));
  }

  res.status(statusCode).json(response);
}

/**
 * Track error metrics
 */
export function trackError(code: ErrorCode, context?: Record<string, unknown>): void {
  logger.warn("Error tracked", {
    code,
    ...context,
  });
}

