/**
 * Centralized Error Handler
 * ========================
 * Unified error handling, logging, and user-friendly message mapping.
 */

import { logger } from "./logger";

/* -------------------------------------------------------------------------- */
/*                            Error Types                                     */
/* -------------------------------------------------------------------------- */

export const ErrorCode = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  details?: Record<string, unknown>;
  originalError?: Error;
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

    if (message.includes("timeout") || message.includes("abort")) {
      return {
        code: ErrorCode.TIMEOUT_ERROR,
        message: error.message,
        userMessage: "Request timed out. Please try again.",
        originalError: error,
      };
    }

    if (message.includes("network") || message.includes("fetch")) {
      return {
        code: ErrorCode.NETWORK_ERROR,
        message: error.message,
        userMessage: "Network error. Please check your connection.",
        originalError: error,
      };
    }

    if (message.includes("401") || message.includes("unauthorized")) {
      return {
        code: ErrorCode.AUTH_ERROR,
        message: error.message,
        userMessage: "Authentication failed. Please refresh and try again.",
        originalError: error,
      };
    }

    if (message.includes("429") || message.includes("rate limit")) {
      return {
        code: ErrorCode.RATE_LIMIT_ERROR,
        message: error.message,
        userMessage: "Too many requests. Please wait a moment and try again.",
        originalError: error,
      };
    }

    if (message.includes("validation") || message.includes("invalid")) {
      return {
        code: ErrorCode.VALIDATION_ERROR,
        message: error.message,
        userMessage: "Invalid input. Please check your data and try again.",
        originalError: error,
      };
    }

    if (message.includes("500") || message.includes("server")) {
      return {
        code: ErrorCode.SERVER_ERROR,
        message: error.message,
        userMessage: "Server error. Please try again later.",
        originalError: error,
      };
    }

    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message,
      userMessage: "An unexpected error occurred. Please try again.",
      originalError: error,
    };
  }

  return {
    code: ErrorCode.UNKNOWN_ERROR,
    message: String(error),
    userMessage: "An unexpected error occurred. Please try again.",
  };
}

/* -------------------------------------------------------------------------- */
/*                            Error Handling                                  */
/* -------------------------------------------------------------------------- */

/**
 * Handle an error with logging and user-friendly messaging
 */
export function handleError(
  error: unknown,
  context?: Record<string, unknown>
): AppError {
  const appError = classifyError(error);

  // Log the error with context
  logger.error(`[${appError.code}] ${appError.message}`, appError.originalError, {
    ...context,
    code: appError.code,
  });

  return appError;
}

/**
 * Wrap an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const appError = handleError(error, context);
    return { data: null, error: appError };
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        const jitter = Math.floor(Math.random() * 200);
        const delay = Math.min(10000, baseDelayMs * Math.pow(2, attempt)) + jitter;
        logger.warn(`Attempt ${attempt + 1} failed; retrying in ${delay}ms`, {
          error: lastError.message,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/* -------------------------------------------------------------------------- */
/*                            HTTP Error Handling                             */
/* -------------------------------------------------------------------------- */

/**
 * Parse HTTP error response
 */
export async function parseHttpError(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const json = await response.json();
      return json.error || json.message || `HTTP ${response.status}`;
    }
    const text = await response.text();
    return text || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`;
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  return (
    error.code === ErrorCode.NETWORK_ERROR ||
    error.code === ErrorCode.TIMEOUT_ERROR ||
    error.code === ErrorCode.RATE_LIMIT_ERROR ||
    error.code === ErrorCode.SERVER_ERROR
  );
}

