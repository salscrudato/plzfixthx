/**
 * Shared Validation Schemas
 * =========================
 * Request/response validation schemas used by both frontend and backend.
 * Enables frontend pre-validation before sending requests.
 */

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                            Request Schemas                                 */
/* -------------------------------------------------------------------------- */

/**
 * Schema for slide generation requests
 */
export const GenerateSlideSpecRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty").max(5000, "Prompt exceeds maximum length"),
  userId: z.string().optional(),
  requestId: z.string().optional(),
});

export type GenerateSlideSpecRequest = z.infer<typeof GenerateSlideSpecRequestSchema>;

/**
 * Schema for PPTX export requests
 */
export const ExportPPTXRequestSchema = z.object({
  spec: z.record(z.string(), z.unknown()),
  filename: z.string().optional(),
});

export type ExportPPTXRequest = z.infer<typeof ExportPPTXRequestSchema>;

/**
 * Schema for PNG export requests
 */
export const ExportPNGRequestSchema = z.object({
  spec: z.record(z.string(), z.unknown()),
  filename: z.string().optional(),
});

export type ExportPNGRequest = z.infer<typeof ExportPNGRequestSchema>;

/**
 * Schema for PDF export requests
 */
export const ExportPDFRequestSchema = z.object({
  spec: z.record(z.string(), z.unknown()),
  filename: z.string().optional(),
});

export type ExportPDFRequest = z.infer<typeof ExportPDFRequestSchema>;

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
      throw new Error(`Invalid ${context}: ${errors[0]?.message}`);
    }
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                            Validation Utilities                            */
/* -------------------------------------------------------------------------- */

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

