/**
 * AI Orchestrator Middleware
 * ==========================
 * Centralized AI request orchestration with validation, enhancement, and error handling.
 * Handles prompt processing, response validation, and structured output generation.
 */

import * as logger from "firebase-functions/logger";
import { callAIWithRetry, enhanceSlideSpec, sanitizePrompt, moderateContent, ValidationError } from "../aiHelpers";
import { SlideSpecZ } from "@plzfixthx/slide-spec";
import type { SlideSpecV1 } from "@plzfixthx/slide-spec";

/* -------------------------------------------------------------------------- */
/*                            Request Pipeline                                */
/* -------------------------------------------------------------------------- */

export interface AIRequest {
  prompt: string;
  requestId: string;
  userId?: string;
  context?: Record<string, unknown>;
}

export interface AIResponse {
  spec: SlideSpecV1;
  requestId: string;
  processingTime: number;
  model: string;
  tokensUsed?: number;
}

/* -------------------------------------------------------------------------- */
/*                            Validation Pipeline                             */
/* -------------------------------------------------------------------------- */

/**
 * Validate and sanitize incoming AI request
 */
export async function validateAIRequest(request: AIRequest): Promise<void> {
  // Check request ID
  if (!request.requestId || typeof request.requestId !== "string") {
    throw new ValidationError("Invalid or missing request ID", request.requestId || "unknown");
  }

  // Check prompt existence and length
  if (!request.prompt || request.prompt.trim().length === 0) {
    throw new ValidationError("Prompt cannot be empty", request.requestId);
  }

  if (request.prompt.length > 5000) {
    throw new ValidationError("Prompt exceeds maximum length (5000 characters)", request.requestId);
  }

  // Check for content policy violations
  const moderation = await moderateContent(request.prompt);
  if (!moderation.safe) {
    throw new ValidationError(
      `Content policy violation: ${moderation.reason}`,
      request.requestId,
      { categories: moderation.categories }
    );
  }

  logger.info("AI request validated", {
    requestId: request.requestId,
    promptLength: request.prompt.length,
    hasUserId: !!request.userId,
    hasContext: !!request.context,
  });
}

/* -------------------------------------------------------------------------- */
/*                            Processing Pipeline                             */
/* -------------------------------------------------------------------------- */

/**
 * Process AI request through full pipeline
 */
export async function processAIRequest(request: AIRequest): Promise<AIResponse> {
  const startTime = Date.now();
  const requestId = request.requestId;

  try {
    // 1. Validate request
    await validateAIRequest(request);

    // 2. Sanitize prompt
    const sanitized = sanitizePrompt(request.prompt);
    logger.info("Prompt sanitized", { requestId, originalLength: request.prompt.length, sanitizedLength: sanitized.length });

    // 3. Call AI with retry logic
    const apiKey = process.env.OPENAI_API_KEY || "";
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4-turbo";

    const spec = (await callAIWithRetry(
      sanitized,
      apiKey,
      baseUrl,
      model,
      SlideSpecZ,
      requestId
    )) as SlideSpecV1;

    // 4. Enhance spec with advanced features
    const enhanced = await enhanceSlideSpec(spec);

    // 5. Validate output
    validateSlideSpec(enhanced, requestId);

    const processingTime = Date.now() - startTime;

    logger.info("AI request processed successfully", {
      requestId,
      processingTime,
      specType: enhanced.type,
    });

    return {
      spec: enhanced,
      requestId,
      processingTime,
      model: "gpt-4-turbo",
      tokensUsed: undefined, // Would be populated from AI response metadata
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error("AI request processing failed", error, {
      requestId,
      processingTime,
    });
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                            Output Validation                               */
/* -------------------------------------------------------------------------- */

/**
 * Validate slide spec structure and content
 */
export function validateSlideSpec(spec: SlideSpecV1, requestId: string): void {
  // Check required fields
  if (!spec.content?.title?.text) {
    throw new ValidationError("Slide spec missing required field: content.title.text", requestId);
  }

  // Validate title content
  if (typeof spec.content.title.text !== "string" || spec.content.title.text.trim().length === 0) {
    throw new ValidationError("Title must be a non-empty string", requestId);
  }

  if (spec.content.title.text.length > 200) {
    throw new ValidationError("Title exceeds maximum length (200 characters)", requestId);
  }

  // Validate subtitle if present
  if (spec.content.subtitle?.text && typeof spec.content.subtitle.text !== "string") {
    throw new ValidationError("Subtitle must be a string", requestId);
  }

  if (spec.content.subtitle?.text && spec.content.subtitle.text.length > 300) {
    throw new ValidationError("Subtitle exceeds maximum length (300 characters)", requestId);
  }

  // Validate palette colors
  if (spec.styleTokens?.palette?.primary && !isValidHexColor(spec.styleTokens.palette.primary)) {
    throw new ValidationError("Invalid primary color format", requestId, {
      color: spec.styleTokens.palette.primary,
    });
  }

  logger.info("Slide spec validated", {
    requestId,
    titleLength: spec.content.title.text.length,
    hasSubtitle: !!spec.content.subtitle?.text,
    hasPalette: !!spec.styleTokens?.palette,
  });
}

/**
 * Check if string is valid hex color
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}([0-9A-F]{2})?$/i.test(color);
}

/* -------------------------------------------------------------------------- */
/*                            Response Formatting                             */
/* -------------------------------------------------------------------------- */

/**
 * Format AI response for client consumption
 */
export function formatAIResponse(response: AIResponse): Record<string, unknown> {
  return {
    spec: response.spec,
    requestId: response.requestId,
    processingTime: response.processingTime,
    model: response.model,
    timestamp: new Date().toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*                            Error Recovery                                  */
/* -------------------------------------------------------------------------- */

/**
 * Attempt to recover from AI response errors
 */
export async function recoverFromAIError(
  error: unknown,
  request: AIRequest,
  retryCount: number = 0
): Promise<AIResponse | null> {
  const maxRetries = 2;

  if (retryCount >= maxRetries) {
    logger.error("Max retries exceeded for AI request", error, {
      requestId: request.requestId,
      retryCount,
    });
    return null;
  }

  logger.warn("Attempting to recover from AI error", {
    requestId: request.requestId,
    retryCount,
    error: error instanceof Error ? error.message : String(error),
  });

  // Wait before retry with exponential backoff
  const delay = Math.min(10000, 1000 * Math.pow(2, retryCount));
  await new Promise((resolve) => setTimeout(resolve, delay));

  try {
    return await processAIRequest(request);
  } catch (retryError) {
    return recoverFromAIError(retryError, request, retryCount + 1);
  }
}

/* -------------------------------------------------------------------------- */
/*                            Performance Metrics                             */
/* -------------------------------------------------------------------------- */

/**
 * Track AI performance metrics for monitoring and optimization
 */
export interface AIMetrics {
  requestId: string;
  promptLength: number;
  processingTimeMs: number;
  model: string;
  success: boolean;
  errorType?: string;
  retryCount?: number;
  tokensUsed?: number;
}

/**
 * Log AI performance metrics
 */
export function logAIMetrics(metrics: AIMetrics): void {
  logger.info("AI performance metrics", {
    requestId: metrics.requestId,
    promptLength: metrics.promptLength,
    processingTimeMs: metrics.processingTimeMs,
    model: metrics.model,
    success: metrics.success,
    errorType: metrics.errorType,
    retryCount: metrics.retryCount,
    tokensUsed: metrics.tokensUsed,
    avgTimePerToken: metrics.tokensUsed ? (metrics.processingTimeMs / metrics.tokensUsed).toFixed(2) : undefined,
  });
}

