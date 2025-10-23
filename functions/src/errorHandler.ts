/**
 * Enhanced Error Handler
 * Provides comprehensive error handling, logging, and recovery strategies
 */

import { logger } from "firebase-functions/v2";

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super("VALIDATION_ERROR", message, 400, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, details?: Record<string, any>) {
    super("NOT_FOUND", `${resource} not found`, 404, details);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", details?: Record<string, any>) {
    super("UNAUTHORIZED", message, 401, details);
    this.name = "UnauthorizedError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded", details?: Record<string, any>) {
    super("RATE_LIMIT", message, 429, details);
    this.name = "RateLimitError";
  }
}

export class TimeoutError extends AppError {
  constructor(operation: string, details?: Record<string, any>) {
    super("TIMEOUT", `${operation} timed out`, 504, details);
    this.name = "TimeoutError";
  }
}

/**
 * Error logger with context
 */
export function logError(
  error: Error | AppError,
  context: Record<string, any> = {}
): void {
  const errorInfo: Record<string, any> = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context
  };

  if (error instanceof AppError) {
    errorInfo.code = error.code;
    errorInfo.statusCode = error.statusCode;
    if (error.details) {
      errorInfo.details = error.details;
    }
  }

  logger.error("Error occurred", errorInfo);
}

/**
 * Safe error response for API
 */
export function getSafeErrorResponse(error: Error | AppError): {
  error: string;
  code?: string;
  statusCode: number;
} {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }

  // Don't expose internal error details
  return {
    error: "An unexpected error occurred",
    statusCode: 500
  };
}

/**
 * Wrap async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: Record<string, any> = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logError(error as Error, context);
    throw error;
  }
}

/**
 * Wrap sync function with error handling
 */
export function withErrorHandlingSync<T>(
  fn: () => T,
  context: Record<string, any> = {}
): T {
  try {
    return fn();
  } catch (error) {
    logError(error as Error, context);
    throw error;
  }
}

/**
 * Validate required fields
 */
export function validateRequired(
  obj: Record<string, any>,
  fields: string[]
): void {
  const missing = fields.filter(field => !obj[field]);
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(", ")}`, {
      missing
    });
  }
}

/**
 * Validate field types
 */
export function validateTypes(
  obj: Record<string, any>,
  schema: Record<string, string>
): void {
  const errors: Record<string, string> = {};

  for (const [field, expectedType] of Object.entries(schema)) {
    const value = obj[field];
    const actualType = typeof value;

    if (actualType !== expectedType) {
      errors[field] = `Expected ${expectedType}, got ${actualType}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Type validation failed", errors);
  }
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string = "value"
): void {
  if (value.length < minLength || value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be between ${minLength} and ${maxLength} characters`,
      { fieldName, minLength, maxLength, actualLength: value.length }
    );
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format", { email });
  }
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new ValidationError("Invalid URL format", { url });
  }
}

/**
 * Validate JSON
 */
export function validateJSON(jsonString: string): Record<string, any> {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new ValidationError("Invalid JSON format", {
      error: (error as Error).message
    });
  }
}

/**
 * Create timeout promise
 */
export function createTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string = "Operation"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError(operationName)),
        timeoutMs
      )
    )
  ]);
}

/**
 * Retry with exponential backoff and error handling
 */
export async function retryWithErrorHandling<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 100,
  context: Record<string, any> = {}
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, {
          ...context,
          delay,
          error: (error as Error).message
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  logError(lastError || new Error("Max retries exceeded"), context);
  throw lastError || new Error("Max retries exceeded");
}

