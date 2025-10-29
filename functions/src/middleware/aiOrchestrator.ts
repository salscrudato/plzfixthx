/**
 * AI Orchestrator Middleware
 * ==========================
 * Centralized AI request orchestration with validation, enhancement, and error handling.
 * Handles prompt processing, response validation, and structured output generation.
 *
 * Two-Stage Pipeline:
 * 1. Planner: Extract intent, audience, tone, visual plan from prompt
 * 2. Generator: Generate full SlideSpec using planner output + schema
 */

import * as logger from "firebase-functions/logger";
import { z } from "zod";
import { callAIWithRetry, enhanceSlideSpec, sanitizePrompt, moderateContent, ValidationError } from "../aiHelpers";
import { SlideSpecZ, type SlideSpecV1 } from "@plzfixthx/slide-spec";
import {
  STANDARD_GRID,
  EXECUTIVE_MARGINS,
  TYPOGRAPHY_SCALE,
  FONT_FAMILIES,
} from "../designSystem";

/* -------------------------------------------------------------------------- */
/*                            Intent Plan Schema                              */
/* -------------------------------------------------------------------------- */

/**
 * Planner output schema - extracts high-level intent from user prompt
 */
export const IntentPlanZ = z.object({
  intent: z.enum(["explanatory", "action", "analytical"]),
  audience: z.string().max(100),
  tone: z.enum(["formal", "conversational", "technical", "executive"]),
  slidePattern: z.enum(["overview", "2x2", "timeline", "bar-chart", "compare-contrast", "process-flow", "hero"]),
  brandHints: z.array(z.string()).max(5).optional(),
  dataHints: z.array(z.string()).max(10).optional(),
  visualPlan: z.enum(["chart", "table", "hero", "illustration", "minimal"]),
});

export type IntentPlan = z.infer<typeof IntentPlanZ>;

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
  plannerTokens?: number;
  generatorTokens?: number;
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
/*                         Rule Enforcement (Post-Gen)                        */
/* -------------------------------------------------------------------------- */

/**
 * Enforce strict content rules on generated spec (deterministic, no AI calls)
 */
export function enforceSlideSpecRules(spec: SlideSpecV1): SlideSpecV1 {
  const enforced = { ...spec };

  // Ensure title ≤60 chars
  if (enforced.content.title.text.length > 60) {
    enforced.content.title.text = enforced.content.title.text.slice(0, 57) + "...";
  }

  // Ensure subtitle ≤100 chars
  if (enforced.content.subtitle?.text && enforced.content.subtitle.text.length > 100) {
    enforced.content.subtitle.text = enforced.content.subtitle.text.slice(0, 97) + "...";
  }

  // Enforce bullet limits: max 7 items per group, ≤80 chars each, max 3 groups
  if (enforced.content.bullets && Array.isArray(enforced.content.bullets)) {
    enforced.content.bullets = enforced.content.bullets.slice(0, 3).map((group: any) => {
      if (!group.items || !Array.isArray(group.items)) return group;
      return {
        ...group,
        items: group.items.slice(0, 7).map((item: any) => ({
          ...item,
          text: item.text.length > 80 ? item.text.slice(0, 77) + "..." : item.text,
        })),
      };
    });

    // Simple lexical de-duplication across all bullets
    const seenTexts = new Set<string>();
    enforced.content.bullets = enforced.content.bullets.map((group: any) => ({
      ...group,
      items: group.items.filter((item: any) => {
        const normalized = item.text.toLowerCase().trim();
        if (seenTexts.has(normalized)) return false;
        seenTexts.add(normalized);
        return true;
      }),
    })).filter((group: any) => group.items.length > 0);
  }

  // Enforce callout variant validation
  if (enforced.content.callouts && Array.isArray(enforced.content.callouts)) {
    const validVariants = ["note", "success", "warning", "danger"];
    enforced.content.callouts = enforced.content.callouts.map((callout: any) => ({
      ...callout,
      variant: validVariants.includes(callout.variant) ? callout.variant : "note",
    }));
  }

  // Ensure design.whitespace.breathingRoom default
  if (!enforced.design) {
    enforced.design = { pattern: "hero" };
  }
  if (!enforced.design.whitespace) {
    enforced.design.whitespace = {};
  }
  if (enforced.design.whitespace.breathingRoom === undefined) {
    enforced.design.whitespace.breathingRoom = 0.35;
  }

  // Ensure required meta fields
  if (!enforced.meta.theme) {
    enforced.meta.theme = "Professional";
  }
  if (!enforced.meta.aspectRatio) {
    enforced.meta.aspectRatio = "16:9";
  }

  // Enforce design system grid (12×8, executive margins)
  if (!enforced.layout) {
    enforced.layout = {
      grid: {
        rows: STANDARD_GRID.rows,
        cols: STANDARD_GRID.cols,
        gutter: STANDARD_GRID.gutter * 96,
        margin: {
          t: EXECUTIVE_MARGINS.top * 96,
          r: EXECUTIVE_MARGINS.right * 96,
          b: EXECUTIVE_MARGINS.bottom * 96,
          l: EXECUTIVE_MARGINS.left * 96,
        },
      },
      regions: [],
      anchors: [],
    };
  } else {
    // Override AI-generated grid with design system defaults
    enforced.layout.grid = {
      rows: STANDARD_GRID.rows, // 8 rows
      cols: STANDARD_GRID.cols, // 12 cols
      gutter: STANDARD_GRID.gutter * 96, // Convert inches to pixels (0.125in * 96dpi = 12px)
      margin: {
        t: EXECUTIVE_MARGINS.top * 96, // Convert inches to pixels (0.6in * 96dpi = 57.6px)
        r: EXECUTIVE_MARGINS.right * 96, // Convert inches to pixels (0.9in * 96dpi = 86.4px)
        b: EXECUTIVE_MARGINS.bottom * 96, // Convert inches to pixels (0.6in * 96dpi = 57.6px)
        l: EXECUTIVE_MARGINS.left * 96, // Convert inches to pixels (0.9in * 96dpi = 86.4px)
      },
    };

    // Enforce region bounds to fit within 8-row grid
    if (enforced.layout.regions && Array.isArray(enforced.layout.regions)) {
      enforced.layout.regions = enforced.layout.regions.map((region: any) => {
        const maxRow = STANDARD_GRID.rows; // 8
        const maxCol = STANDARD_GRID.cols; // 12

        // Clamp rowStart to valid range (1 to maxRow)
        const rowStart = Math.max(1, Math.min(region.rowStart, maxRow));

        // Clamp colStart to valid range (1 to maxCol)
        const colStart = Math.max(1, Math.min(region.colStart, maxCol));

        // Clamp rowSpan so region doesn't exceed grid
        const maxRowSpan = maxRow - rowStart + 1;
        const rowSpan = Math.max(1, Math.min(region.rowSpan, maxRowSpan));

        // Clamp colSpan so region doesn't exceed grid
        const maxColSpan = maxCol - colStart + 1;
        const colSpan = Math.max(1, Math.min(region.colSpan, maxColSpan));

        return {
          ...region,
          rowStart,
          colStart,
          rowSpan,
          colSpan,
        };
      });
    }
  }

  // Ensure styleTokens exist with required fields
  if (!enforced.styleTokens) {
    enforced.styleTokens = {
      palette: { primary: "#1E40AF", accent: "#F59E0B", neutral: [] },
      typography: {
        fonts: { sans: "Aptos, Calibri, Arial, sans-serif" },
        sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 24, step_3: 32 },
        weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { compact: 1.2, standard: 1.5 },
      },
      spacing: { base: 8, steps: [4, 8, 12, 16, 24, 32, 48, 64] },
      radii: { sm: 4, md: 8, lg: 16 },
      shadows: { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.1)", lg: "0 10px 15px rgba(0,0,0,0.1)" },
      contrast: { minTextContrast: 7.0, minUiContrast: 3.0 },
    };
  }

  // Enforce design system typography scale
  if (!enforced.styleTokens.typography) {
    enforced.styleTokens.typography = {
      fonts: { sans: FONT_FAMILIES.primary },
      sizes: {
        "step_-2": TYPOGRAPHY_SCALE.caption, // 12pt
        "step_-1": 14,
        step_0: TYPOGRAPHY_SCALE.body, // 16pt
        step_1: 20,
        step_2: TYPOGRAPHY_SCALE.h2, // 24pt
        step_3: TYPOGRAPHY_SCALE.display, // 44pt
      },
      weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeights: { compact: 1.2, standard: 1.5 },
    };
  } else {
    // Override AI-generated typography with design system values
    enforced.styleTokens.typography.fonts = { sans: FONT_FAMILIES.primary };
    enforced.styleTokens.typography.sizes = {
      "step_-2": TYPOGRAPHY_SCALE.caption, // 12pt
      "step_-1": 14,
      step_0: TYPOGRAPHY_SCALE.body, // 16pt
      step_1: 20,
      step_2: TYPOGRAPHY_SCALE.h2, // 24pt
      step_3: TYPOGRAPHY_SCALE.display, // 44pt
    };
  }

  return enforced;
}

/* -------------------------------------------------------------------------- */
/*                            Processing Pipeline                             */
/* -------------------------------------------------------------------------- */

/**
 * Planner system prompt - extracts intent from user prompt
 */
const PLANNER_PROMPT = `You are an expert slide intent analyzer. Extract the following from the user's prompt:
- intent: "explanatory" (explain/describe/overview), "action" (optimize/improve/strategy), or "analytical" (analyze/compare/metrics)
- audience: who is this for? (e.g., "executives", "technical team", "general audience")
- tone: "formal", "conversational", "technical", or "executive"
- slidePattern: "overview", "2x2", "timeline", "bar-chart", "compare-contrast", "process-flow", or "hero"
- brandHints: any company/brand names mentioned (max 5)
- dataHints: any explicit numbers, metrics, or data points mentioned (max 10)
- visualPlan: "chart", "table", "hero", "illustration", or "minimal"

Return ONLY valid JSON matching this schema. No markdown, no explanations.`;

/**
 * Process AI request through two-stage pipeline
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

    const apiKey = process.env.OPENAI_API_KEY || "";
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o";

    // STAGE A: Planner - extract intent at low temperature
    // Use gpt-4o-mini for planner to reduce token usage and cost
    const plannerStart = Date.now();
    const plannerModel = "gpt-4o-mini"; // Cheaper, faster model for intent extraction
    const planResult = await callAIWithRetry(
      `${PLANNER_PROMPT}\n\nUser prompt: ${sanitized}`,
      apiKey,
      baseUrl,
      plannerModel,
      IntentPlanZ,
      requestId,
      0.1 // Low temperature for consistent intent extraction
    );
    const plan = planResult as IntentPlan;
    const plannerTime = Date.now() - plannerStart;

    logger.info("Planner stage complete", {
      requestId,
      intent: plan.intent,
      audience: plan.audience,
      tone: plan.tone,
      slidePattern: plan.slidePattern,
      visualPlan: plan.visualPlan,
      plannerTimeMs: plannerTime,
    });

    // STAGE B: Generator - produce SlideSpec using planner output
    const generatorStart = Date.now();
    const generatorPrompt = `User prompt: ${sanitized}

Intent Analysis:
- Intent: ${plan.intent}
- Audience: ${plan.audience}
- Tone: ${plan.tone}
- Slide Pattern: ${plan.slidePattern}
- Visual Plan: ${plan.visualPlan}
${plan.brandHints && plan.brandHints.length > 0 ? `- Brand Hints: ${plan.brandHints.join(", ")}` : ""}
${plan.dataHints && plan.dataHints.length > 0 ? `- Data Hints: ${plan.dataHints.join(", ")}` : ""}

Generate a professional slide that matches this intent and plan.`;

    const spec = (await callAIWithRetry(
      generatorPrompt,
      apiKey,
      baseUrl,
      model,
      SlideSpecZ,
      requestId,
      0.3 // Moderate temperature for creative but controlled output
    )) as SlideSpecV1;
    const generatorTime = Date.now() - generatorStart;

    logger.info("Generator stage complete", {
      requestId,
      generatorTimeMs: generatorTime,
      hasTitle: !!spec.content.title,
      hasBullets: !!spec.content.bullets,
      hasChart: !!spec.content.dataViz,
    });

    // 3. Enforce strict rules (deterministic)
    const enforced = enforceSlideSpecRules(spec);

    // 4. Enhance spec with advanced features (pass plan for palette inference)
    const enhanced = await enhanceSlideSpec(enforced, plan, sanitized);

    // 5. Validate output
    validateSlideSpec(enhanced, requestId);

    const processingTime = Date.now() - startTime;

    logger.info("AI request processed successfully", {
      requestId,
      processingTime,
      plannerTimeMs: plannerTime,
      generatorTimeMs: generatorTime,
    });

    return {
      spec: enhanced,
      requestId,
      processingTime,
      model,
      tokensUsed: undefined, // Populated from response metadata if available
      plannerTokens: undefined,
      generatorTokens: undefined,
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

