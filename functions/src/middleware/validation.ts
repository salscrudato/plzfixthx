/**
 * Validation Middleware (Backend)
 * ===============================
 * Re-exports shared validation schemas and provides backend-specific validation.
 * Core schemas are in @plzfixthx/validation
 */

import * as logger from "firebase-functions/logger";
import { validateRequest as sharedValidateRequest } from "@plzfixthx/validation";

// Re-export shared schemas and functions
export {
  GenerateSlideSpecRequestSchema,
  ExportPPTXRequestSchema,
  isValidHexColor,
  isValidEmail,
  isValidUrl,
  ValidationMessages,
  type GenerateSlideSpecRequest,
  type ExportPPTXRequest,
} from "@plzfixthx/validation";

/**
 * Validate and parse request body (with logging)
 */
export function validateRequest<T>(
  data: unknown,
  schema: any,
  context: string
): T {
  try {
    return sharedValidateRequest(data, schema, context);
  } catch (error) {
    logger.warn(`Validation failed for ${context}`, { error: String(error) });
    throw error;
  }
}

/**
 * Note: sanitizeString and sanitizeFilename are in httpHelpers.ts
 */
import { sanitizeString as sanitizeStringImpl } from "../httpHelpers";
export { sanitizeFilename, sanitizeString } from "../httpHelpers";

// Use the imported function locally
const sanitizeString = sanitizeStringImpl;

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

