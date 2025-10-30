/**
 * Shared Error Handling Module
 * ============================
 * Unified error types, classification, and utilities for frontend and backend.
 * Eliminates duplication between web/src/lib/errorHandler.ts and functions/src/errorHandler.ts
 */

/* -------------------------------------------------------------------------- */
/*                            Error Codes                                     */
/* -------------------------------------------------------------------------- */

export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = "BAD_REQUEST",
  INVALID_PAYLOAD = "INVALID_PAYLOAD",
  PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
  RATE_LIMITED = "RATE_LIMITED",
  MODERATION_REJECTED = "MODERATION_REJECTED",
  ABUSE_DETECTED = "ABUSE_DETECTED",
  AUTH_ERROR = "AUTH_ERROR",

  // Server errors (5xx)
  AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
  AI_TIMEOUT = "AI_TIMEOUT",
  AI_VALIDATION_ERROR = "AI_VALIDATION_ERROR",
  PPTX_GENERATION_ERROR = "PPTX_GENERATION_ERROR",
  IMAGE_FETCH_ERROR = "IMAGE_FETCH_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/* -------------------------------------------------------------------------- */
/*                            Error Interfaces                                */
/* -------------------------------------------------------------------------- */

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  originalError?: Error;
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

/* -------------------------------------------------------------------------- */
/*                            Error Class                                     */
/* -------------------------------------------------------------------------- */

export class AppErrorClass extends Error {
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

/* -------------------------------------------------------------------------- */
/*                            Error Mapping                                   */
/* -------------------------------------------------------------------------- */

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
    [ErrorCode.AUTH_ERROR]: 401,
    [ErrorCode.AI_SERVICE_ERROR]: 502,
    [ErrorCode.AI_TIMEOUT]: 504,
    [ErrorCode.AI_VALIDATION_ERROR]: 400,
    [ErrorCode.PPTX_GENERATION_ERROR]: 500,
    [ErrorCode.IMAGE_FETCH_ERROR]: 500,
    [ErrorCode.NETWORK_ERROR]: 503,
    [ErrorCode.TIMEOUT_ERROR]: 504,
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.SERVER_ERROR]: 500,
    [ErrorCode.INTERNAL_ERROR]: 500,
    [ErrorCode.UNKNOWN_ERROR]: 500,
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
    [ErrorCode.AUTH_ERROR]: "Authentication failed. Please refresh and try again.",
    [ErrorCode.AI_SERVICE_ERROR]: "AI service temporarily unavailable",
    [ErrorCode.AI_TIMEOUT]: "Request took too long, please try again",
    [ErrorCode.AI_VALIDATION_ERROR]: "Generated content failed validation",
    [ErrorCode.PPTX_GENERATION_ERROR]: "Failed to generate PowerPoint",
    [ErrorCode.IMAGE_FETCH_ERROR]: "Failed to fetch image",
    [ErrorCode.NETWORK_ERROR]: "Network error. Please check your connection.",
    [ErrorCode.TIMEOUT_ERROR]: "Request timed out. Please try again.",
    [ErrorCode.VALIDATION_ERROR]: "Invalid input. Please check your data and try again.",
    [ErrorCode.SERVER_ERROR]: "Server error. Please try again later.",
    [ErrorCode.INTERNAL_ERROR]: "Internal server error",
    [ErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again.",
  };
  return messages[code] || "An error occurred";
}

/* -------------------------------------------------------------------------- */
/*                            Error Classification                            */
/* -------------------------------------------------------------------------- */

/**
 * Classify an error and extract relevant information
 */
export function classifyError(error: unknown): AppError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Timeout errors
    if (message.includes("timeout") || message.includes("abort")) {
      return {
        code: ErrorCode.TIMEOUT_ERROR,
        message: error.message,
        userMessage: getUserMessage(ErrorCode.TIMEOUT_ERROR),
        statusCode: 504,
        originalError: error,
      };
    }

    // Network errors
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("econnrefused") ||
      message.includes("enotfound")
    ) {
      return {
        code: ErrorCode.NETWORK_ERROR,
        message: error.message,
        userMessage: getUserMessage(ErrorCode.NETWORK_ERROR),
        statusCode: 503,
        originalError: error,
      };
    }

    // Auth errors
    if (message.includes("401") || message.includes("unauthorized")) {
      return {
        code: ErrorCode.AUTH_ERROR,
        message: error.message,
        userMessage: getUserMessage(ErrorCode.AUTH_ERROR),
        statusCode: 401,
        originalError: error,
      };
    }

    // Rate limit errors
    if (message.includes("429") || message.includes("rate limit")) {
      return {
        code: ErrorCode.RATE_LIMITED,
        message: error.message,
        userMessage: getUserMessage(ErrorCode.RATE_LIMITED),
        statusCode: 429,
        originalError: error,
      };
    }

    // Validation errors
    if (message.includes("validation") || message.includes("invalid")) {
      return {
        code: ErrorCode.VALIDATION_ERROR,
        message: error.message,
        userMessage: getUserMessage(ErrorCode.VALIDATION_ERROR),
        statusCode: 400,
        originalError: error,
      };
    }

    // Server errors
    if (message.includes("500") || message.includes("server")) {
      return {
        code: ErrorCode.SERVER_ERROR,
        message: error.message,
        userMessage: getUserMessage(ErrorCode.SERVER_ERROR),
        statusCode: 500,
        originalError: error,
      };
    }

    // Generic error
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message,
      userMessage: getUserMessage(ErrorCode.UNKNOWN_ERROR),
      statusCode: 500,
      originalError: error,
    };
  }

  return {
    code: ErrorCode.UNKNOWN_ERROR,
    message: String(error),
    userMessage: getUserMessage(ErrorCode.UNKNOWN_ERROR),
    statusCode: 500,
  };
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  return (
    error.code === ErrorCode.NETWORK_ERROR ||
    error.code === ErrorCode.TIMEOUT_ERROR ||
    error.code === ErrorCode.RATE_LIMITED ||
    error.code === ErrorCode.SERVER_ERROR ||
    error.code === ErrorCode.AI_SERVICE_ERROR ||
    error.code === ErrorCode.AI_TIMEOUT
  );
}

