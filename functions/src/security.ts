/**
 * Security middleware and utilities for plzfixthx functions.
 * Includes rate limiting, request validation, and abuse detection.
 */

import * as logger from "firebase-functions/logger";
import { Request, Response } from "express";
import crypto from "crypto";

/* -------------------------------------------------------------------------- */
/*                            Rate Limiting                                   */
/* -------------------------------------------------------------------------- */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limit store (in production, use Redis or Firestore)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client identifier from request (IP + User-Agent fingerprint)
 */
export function getClientId(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const userAgent = req.get("user-agent") || "unknown";
  const fingerprint = crypto
    .createHash("sha256")
    .update(`${ip}:${userAgent}`)
    .digest("hex")
    .slice(0, 16);
  return fingerprint;
}

/**
 * Rate limit middleware: max 100 requests per minute per client
 */
export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: () => void,
  options: { maxRequests?: number; windowMs?: number } = {}
): void {
  const maxRequests = options.maxRequests || 100;
  const windowMs = options.windowMs || 60 * 1000; // 1 minute

  const clientId = getClientId(req);
  const now = Date.now();

  let entry = rateLimitStore.get(clientId);

  if (!entry || entry.resetTime < now) {
    entry = { count: 0, resetTime: now + windowMs };
    rateLimitStore.set(clientId, entry);
  }

  entry.count++;

  // Set rate limit headers
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetTime = Math.ceil(entry.resetTime / 1000);

  res.set("X-RateLimit-Limit", String(maxRequests));
  res.set("X-RateLimit-Remaining", String(remaining));
  res.set("X-RateLimit-Reset", String(resetTime));

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    logger.warn("Rate limit exceeded", { clientId, count: entry.count, maxRequests, retryAfter });

    // Set Retry-After header
    res.set("Retry-After", String(retryAfter));

    res.status(429).json({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
        details: {
          retryAfter,
          limit: maxRequests,
          window: `${windowMs / 1000}s`,
        },
      },
    });
    return;
  }

  next();
}

/* -------------------------------------------------------------------------- */
/*                         Request Validation                                 */
/* -------------------------------------------------------------------------- */

/**
 * Validate request payload size
 */
export function validatePayloadSize(
  req: Request,
  res: Response,
  next: () => void,
  maxSizeBytes: number = 1024 * 100 // 100KB default
): void {
  const contentLength = parseInt(req.get("content-length") || "0", 10);

  if (contentLength > maxSizeBytes) {
    logger.warn("Payload too large", { contentLength, maxSizeBytes });
    res.status(413).json({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request payload exceeds maximum allowed size",
        details: {
          contentLength,
          maxSize: maxSizeBytes,
          maxSizeMB: (maxSizeBytes / 1024 / 1024).toFixed(2),
        },
      },
    });
    return;
  }

  next();
}

/**
 * Sanitize and validate prompt input
 */
export function sanitizePrompt(prompt: string): string {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt must be a non-empty string");
  }

  // Trim whitespace
  let sanitized = prompt.trim();

  // Max length: 2000 characters
  if (sanitized.length > 2000) {
    sanitized = sanitized.slice(0, 2000);
  }

  // Min length: 3 characters
  if (sanitized.length < 3) {
    throw new Error("Prompt must be at least 3 characters");
  }

  return sanitized;
}

/* -------------------------------------------------------------------------- */
/*                         Abuse Detection                                    */
/* -------------------------------------------------------------------------- */

/**
 * Basic heuristics for detecting obvious abuse/misuse
 */
export function detectAbuse(prompt: string): { isAbusive: boolean; reason?: string } {
  // Check for excessive repetition (e.g., "aaaa...aaaa")
  const repetitionPattern = /(.)\1{20,}/;
  if (repetitionPattern.test(prompt)) {
    return { isAbusive: true, reason: "Excessive character repetition detected" };
  }

  // Check for excessive URLs
  const urlCount = (prompt.match(/https?:\/\//g) || []).length;
  if (urlCount > 5) {
    return { isAbusive: true, reason: "Too many URLs in prompt" };
  }

  // Check for common spam patterns
  const spamPatterns = [
    /viagra|cialis|casino|lottery|prize/i,
    /click here|buy now|limited offer/i,
    /free money|guaranteed|no risk/i,
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(prompt)) {
      return { isAbusive: true, reason: "Spam pattern detected" };
    }
  }

  return { isAbusive: false };
}

/* -------------------------------------------------------------------------- */
/*                         Request Tracing                                    */
/* -------------------------------------------------------------------------- */

/**
 * Generate or extract request ID for tracing
 */
export function getRequestId(req: Request): string {
  const existing = req.get("x-request-id");
  if (existing) return existing;

  return crypto.randomUUID();
}

/**
 * Add request ID to response headers
 */
export function setRequestId(req: Request, res: Response): string {
  const requestId = getRequestId(req);
  res.set("X-Request-ID", requestId);
  return requestId;
}

/* -------------------------------------------------------------------------- */
/*                         Error Response Helpers                             */
/* -------------------------------------------------------------------------- */

/**
 * Send a safe error response (no sensitive details)
 */
export function sendSafeError(
  res: Response,
  statusCode: number,
  message: string,
  requestId?: string
): void {
  res.status(statusCode).json({
    error: message,
    ...(requestId && { requestId }),
  });
}

/**
 * Send a structured error response
 */
export function sendStructuredError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
): void {
  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });
}

