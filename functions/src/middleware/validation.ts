/**
 * Validation Middleware
 * ====================
 * Request/response validation, schema enforcement, and data sanitization.
 */

import * as logger from "firebase-functions/logger";
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                            Request Validation                              */
/* -------------------------------------------------------------------------- */

export const GenerateSlideSpecRequestSchema = z.object({
  prompt: z.string().min(1).max(5000),
  userId: z.string().optional(),
  requestId: z.string().optional(),
});

export type GenerateSlideSpecRequest = z.infer<typeof GenerateSlideSpecRequestSchema>;

export const ExportPPTXRequestSchema = z.object({
  spec: z.record(z.string(), z.unknown()),
  filename: z.string().optional(),
});

export type ExportPPTXRequest = z.infer<typeof ExportPPTXRequestSchema>;

/* -------------------------------------------------------------------------- */
/*                            Validation Functions                            */
/* -------------------------------------------------------------------------- */

/**
 * Validate and parse request body
 */
export function validateRequest<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      logger.warn(`Validation failed for ${context}`, { errors });
      throw new Error(`Invalid ${context}: ${errors[0]?.message}`);
    }
    throw error;
  }
}

/**
 * Note: sanitizeString and sanitizeFilename have been moved to httpHelpers.ts
 * to avoid duplication. Import from there instead.
 */
import { sanitizeString as sanitizeStringImpl } from "../httpHelpers";
export { sanitizeFilename, sanitizeString } from "../httpHelpers";

// Use the imported function locally
const sanitizeString = sanitizeStringImpl;

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}([0-9A-F]{2})?$/i.test(color);
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*                            Data Sanitization                               */
/* -------------------------------------------------------------------------- */

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "object" && item !== null ? sanitizeObject(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/* -------------------------------------------------------------------------- */
/*                            Response Validation                             */
/* -------------------------------------------------------------------------- */

/**
 * Validate response structure
 */
export function validateResponse(data: unknown, expectedType: string): boolean {
  if (!data || typeof data !== "object") {
    logger.warn("Invalid response structure", { expectedType, received: typeof data });
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (expectedType === "spec") {
    return (
      typeof obj.type === "string" &&
      typeof obj.header === "string" &&
      (obj.subtitle === undefined || typeof obj.subtitle === "string") &&
      (obj.color === undefined || typeof obj.color === "string")
    );
  }

  if (expectedType === "pptx") {
    return obj instanceof Blob || (typeof obj === "object" && "size" in obj);
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/*                            Error Messages                                  */
/* -------------------------------------------------------------------------- */

export const ValidationMessages = {
  PROMPT_EMPTY: "Prompt cannot be empty",
  PROMPT_TOO_LONG: "Prompt exceeds maximum length (5000 characters)",
  INVALID_SPEC: "Invalid slide specification",
  INVALID_COLOR: "Invalid color format",
  INVALID_EMAIL: "Invalid email address",
  INVALID_URL: "Invalid URL",
  INVALID_FILENAME: "Invalid filename",
  MISSING_REQUIRED_FIELD: (field: string) => `Missing required field: ${field}`,
  INVALID_FIELD_TYPE: (field: string, expected: string) =>
    `Field '${field}' must be ${expected}`,
} as const;

