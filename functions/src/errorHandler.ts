/**
 * Error Handler Module (Backend)
 * ==============================
 * Re-exports shared error utilities and provides backend-specific error handling.
 * Core error types and classification logic are in @plzfixthx/errors
 */

import * as logger from "firebase-functions/logger";
import {
  ErrorCode,
  AppErrorClass,
  classifyError,
} from "@plzfixthx/errors";

// Re-export shared types and functions
export { ErrorCode, AppErrorClass, classifyError } from "@plzfixthx/errors";
export { getStatusCode, getUserMessage } from "@plzfixthx/errors";

// Alias for backward compatibility
export const AppError = AppErrorClass;

/**
 * Normalize any error to AppError
 */
export function normalizeError(error: unknown, _requestId?: string): AppErrorClass {
  if (error instanceof AppErrorClass) {
    return error;
  }

  const classified = classifyError(error);
  return new AppErrorClass(
    classified.code,
    classified.message,
    classified.statusCode || 500,
    classified.details
  );
}

/**
 * Note: Use sendError from httpHelpers.ts for standardized error responses.
 * This module provides error classification and normalization only.
 */

/**
 * Track error metrics
 */
export function trackError(code: ErrorCode, context?: Record<string, unknown>): void {
  logger.warn("Error tracked", {
    code,
    ...context,
  });
}

