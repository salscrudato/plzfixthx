/**
 * HTTP Response Helpers
 * Utilities for setting proper headers, MIME types, and content disposition
 */

import type { Response as ExpressResponse } from "express";

/**
 * MIME types for export formats
 */
export const MIME_TYPES = {
  PPTX: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  PDF: "application/pdf",
  PNG: "image/png",
  JSON: "application/json",
  TEXT: "text/plain",
} as const;

/**
 * Sanitize string input by removing control characters
 */
export function sanitizeString(input: string, maxLength: number = 5000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ""); // Remove control characters
}

/**
 * Sanitize filename for Content-Disposition header
 * Removes/replaces characters that could cause issues in HTTP headers
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^\w\s.-]/g, "") // Remove special chars except word chars, spaces, dots, hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/\.+/g, ".") // Collapse multiple dots
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .slice(0, 200); // Limit length
}

/**
 * Generate Content-Disposition header value
 * Uses RFC 6266 format with proper filename encoding
 */
export function getContentDisposition(
  filename: string,
  disposition: "attachment" | "inline" = "attachment"
): string {
  const sanitized = sanitizeFilename(filename);
  // Use simple ASCII-safe format (RFC 2183)
  return `${disposition}; filename="${sanitized}"`;
}

/**
 * Generate timestamped filename
 */
export function generateTimestampedFilename(
  prefix: string,
  extension: string,
  timestamp?: number
): string {
  const ts = timestamp ?? Date.now();
  return `${prefix}-${ts}.${extension}`;
}

/**
 * Set PPTX response headers
 */
export function setPptxHeaders(res: ExpressResponse, filename?: string): void {
  const fname = filename ?? generateTimestampedFilename("plzfixthx-presentation", "pptx");
  res.setHeader("Content-Type", MIME_TYPES.PPTX);
  res.setHeader("Content-Disposition", getContentDisposition(fname));
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

/**
 * Set JSON response headers
 */
export function setJsonHeaders(res: ExpressResponse): void {
  res.setHeader("Content-Type", MIME_TYPES.JSON);
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
}

/**
 * Set SSE (Server-Sent Events) headers
 */
export function setSSEHeaders(res: ExpressResponse, origin?: string): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", origin ?? "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("X-Accel-Buffering", "no"); // Disable buffering for real-time streaming
}

/**
 * Set CORS headers (for preflight and actual requests)
 */
export function setCorsHeaders(res: ExpressResponse, origin?: string): void {
  res.setHeader("Access-Control-Allow-Origin", origin ?? "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId?: string;
  };
}

/**
 * Send standardized error response
 */
export function sendError(
  res: ExpressResponse,
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string
): void {
  setJsonHeaders(res);
  const errorResponse: ErrorResponse = {
    error: {
      code,
      message,
      ...(details && { details }),
      ...(requestId && { requestId }),
    },
  };
  res.status(statusCode).json(errorResponse);
}

/**
 * Send success response with optional data
 */
export function sendSuccess<T = unknown>(
  res: ExpressResponse,
  data?: T,
  statusCode: number = 200
): void {
  setJsonHeaders(res);
  res.status(statusCode).json(data ?? { success: true });
}

