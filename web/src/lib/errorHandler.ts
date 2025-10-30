/**
 * Centralized Error Handler (Frontend)
 * ====================================
 * Re-exports shared error utilities and provides frontend-specific error handling.
 * Core error types and classification logic are in @plzfixthx/errors
 */

import { logger } from "./logger";
import { classifyError as sharedClassifyError, type AppError as SharedAppError } from "@plzfixthx/errors";

// Re-export shared types and functions
export { classifyError } from "@plzfixthx/errors";
export type { AppError } from "@plzfixthx/errors";

/* -------------------------------------------------------------------------- */
/*                            Error Handling                                  */
/* -------------------------------------------------------------------------- */

/**
 * Handle an error with logging and user-friendly messaging
 */
export function handleError(
  error: unknown,
  context?: Record<string, unknown>
): SharedAppError {
  const appError = sharedClassifyError(error);

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
): Promise<{ data: T | null; error: SharedAppError | null }> {
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
 * Note: Shared implementation is in @plzfixthx/utils
 */
export { retryWithBackoff } from "@plzfixthx/utils";

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

