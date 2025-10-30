import * as logger from "firebase-functions/logger";
import { fetch as undiciFetch } from "undici";
import { z } from "zod";
import { DEFAULT_NEUTRAL_9 } from "@plzfixthx/slide-spec";
import { ENHANCED_SYSTEM_PROMPT } from "./prompts";
import { generatePalette } from "./colorPaletteGenerator";
import { randomUUID } from "crypto";
import { contrastRatio, hexToRgb } from "@plzfixthx/slide-spec";
import { retryWithBackoff as sharedRetryWithBackoff } from "@plzfixthx/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodToJsonSchema } from "zod-to-json-schema";

/* -------------------------------------------------------------------------- */
/*                            Structured Error Types                          */
/* -------------------------------------------------------------------------- */

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public requestId: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "AIError";
  }
}

export class ValidationError extends AIError {
  constructor(message: string, requestId: string, details?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", requestId, details);
    this.name = "ValidationError";
  }
}

// Moderation functions are now exported from ./moderation module
export { ModerationError, moderateContent, sanitizePrompt } from "./moderation";

/* -------------------------------------------------------------------------- */
/*                               Color & Contrast                             */
/* -------------------------------------------------------------------------- */

/**
 * WCAG 2.2 contrast validation using shared utility
 * Note: This has a different signature than designSystem.ensureContrast
 * (returns object vs string), so we keep it here for palette validation.
 */
function ensureContrast(textHex: string, bgHex: string, minRatio: number) {
  const ratio = contrastRatio(textHex, bgHex);
  return { compliant: ratio >= minRatio, ratio };
}

/**
 * Generate a compliant neutral ramp if invalid
 */
function generateCompliantNeutralRamp(): string[] {
  // Simple linear interpolation from dark to light
  const [darkR, darkG, darkB] = hexToRgb("#0F172A");
  const [lightR, lightG, lightB] = hexToRgb("#F8FAFC");
  const ramp: string[] = [];

  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const r = Math.round(darkR * (1 - t) + lightR * t);
    const g = Math.round(darkG * (1 - t) + lightG * t);
    const b = Math.round(darkB * (1 - t) + lightB * t);
    ramp.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
  }

  return ramp;
}

/* -------------------------------------------------------------------------- */
/*                               Light validators                              */
/* -------------------------------------------------------------------------- */

function validateBulletCount(bullets: any[], maxPerGroup: number) {
  const valid = bullets.every((b) => !b.items || b.items.length <= maxPerGroup);
  return { valid, maxPerGroup };
}

/* -------------------------------------------------------------------------- */
/*                         Retry with exponential backoff                      */
/* -------------------------------------------------------------------------- */

/**
 * Re-export shared retry function for backward compatibility
 * Shared implementation is in @plzfixthx/utils
 */
export const retryWithBackoff = sharedRetryWithBackoff;

/* -------------------------------------------------------------------------- */
/*                      OpenAI‑compatible structured outputs                   */
/* -------------------------------------------------------------------------- */

/**
 * Convert Zod schema to JSON Schema for structured output.
 * Enhanced with strict mode and draft version.
 */
function toJsonSchema(schema: z.ZodTypeAny): any {
  const json = zodToJsonSchema(schema, { name: "SlideSpec" });
  if (json && typeof json === "object" && !("$schema" in json)) {
    (json as any).$schema = "http://json-schema.org/draft-07/schema#";
  }
  return json;
}

/**
 * Clean unknown keys from parsed spec to prevent silent drift.
 */
function cleanSpec(parsed: any, schema: z.ZodTypeAny): any {
  // Use Zod's parse to strip unknown keys
  const validation = schema.safeParse(parsed);
  if (validation.success) {
    return validation.data;
  }
  // If validation fails, return original (will be caught by caller)
  return parsed;
}

type AIResp = {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

/**
 * Call OpenAI-compatible /chat/completions with robust structured-output handling.
 * 1) Use response_format: json_schema with Zod-generated schema
 * 2) Fallback to response_format: json_object on 400/unsupported
 * 3) Validate with provided Zod schema and clean unknown keys
 * 4) Track request/response IDs and token usage
 * 5) Enforce content-length guard (max 200KB)
 * 6) Added cost estimation and timeout handling
 */
export async function callAIWithRetry(
  prompt: string,
  apiKey: string,
  baseUrl: string,
  model: string,
  schema: z.ZodTypeAny,
  requestId: string = randomUUID(),
  temperature: number = 0.3
): Promise<unknown> {
  return retryWithBackoff(async () => {
    const start = Date.now();
    let usedMode: "json_schema" | "json_object" = "json_schema";
    let responseId: string | undefined;

    // Generate JSON Schema from Zod
    const jsonSchema = toJsonSchema(schema);

    const attempt = async (mode: "json_schema" | "json_object") => {
      usedMode = mode;

      // Convert UUID to integer seed (OpenAI requires integer, not string)
      const seedStr = requestId.split("-")[0];
      const seedInt = parseInt(seedStr.substring(0, 8), 16) % 2147483647; // Use first 8 hex chars as seed

      const body: any = {
        model,
        temperature, // Use provided temperature parameter
        top_p: 0.95,
        seed: seedInt, // Use integer seed for reproducibility
        max_tokens: 4096, // Reasonable limit for slide content
        response_format:
          mode === "json_schema"
            ? { type: "json_schema", json_schema: { name: "SlideSpec", schema: jsonSchema, strict: true } }
            : { type: "json_object" },
        stop: ["```"], // Prevent fence leaks
        messages: [
          {
            role: "system",
            content:
              ENHANCED_SYSTEM_PROMPT +
              (mode === "json_object"
                ? `\n\nThe following JSON Schema is authoritative. Return ONLY a JSON object that validates against it:\n${JSON.stringify(
                    jsonSchema
                  )}`
                : ""),
          },
          { role: "user", content: `User prompt:\n<<<${prompt}>>>` },
        ],
      };

      // Add timeout to fetch (30s)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await undiciFetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - start;

        if (!response.ok) {
          const errorText = await response.text();
          logger.error("AI API request failed", {
            requestId,
            status: response.status,
            error: errorText?.slice(0, 500),
            model,
            promptLength: prompt.length,
            durationMs: duration,
            responseFormat: usedMode,
          });

          // If provider rejects json_schema, fall back once to json_object in-place
          const maybeUnsupported =
            usedMode === "json_schema" &&
            response.status === 400 &&
            /schema|response_format|unsupported/i.test(errorText || "");
          if (maybeUnsupported) {
            return attempt("json_object");
          }

          throw new AIError(
            `AI API error ${response.status}: ${errorText?.slice(0, 200)}`,
            "API_ERROR",
            requestId,
            { status: response.status, model, durationMs: duration }
          );
        }

        let data: AIResp;
        try {
          data = (await response.json()) as AIResp;
          responseId = (data as any)?.id || randomUUID();
        } catch (e) {
          logger.error("Failed to parse AI response as JSON", {
            requestId,
            error: String(e),
            durationMs: duration,
          });
          throw new AIError(
            `Failed to parse AI response: ${e}`,
            "PARSE_ERROR",
            requestId,
            { durationMs: duration }
          );
        }

        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
          logger.error("No content in AI response", {
            requestId,
            responseId,
            data: JSON.stringify(data)?.slice(0, 500),
            durationMs: duration,
            responseFormat: usedMode,
          });
          throw new AIError(
            "No content in AI response",
            "NO_CONTENT",
            requestId,
            { responseId, durationMs: duration }
          );
        }

        // Content-length guard: reject responses > 200KB
        const contentLength = Buffer.byteLength(content, "utf8");
        if (contentLength > 200 * 1024) {
          logger.error("AI response too large", {
            requestId,
            responseId,
            contentLength,
            maxAllowed: 200 * 1024,
            durationMs: duration,
          });
          throw new AIError(
            `AI response too large: ${contentLength} bytes (max 200KB)`,
            "RESPONSE_TOO_LARGE",
            requestId,
            { responseId, durationMs: duration, contentLength }
          );
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(content);
        } catch (e) {
          logger.error("Failed to parse AI response content as JSON", {
            requestId,
            responseId,
            content: content.slice(0, 500),
            error: String(e),
            durationMs: duration,
            responseFormat: usedMode,
          });
          throw new AIError(
            `Failed to parse AI response as JSON: ${e}`,
            "JSON_PARSE_ERROR",
            requestId,
            { responseId, durationMs: duration }
          );
        }

        const validation = schema.safeParse(parsed);
        if (!validation.success) {
          const detail = validation.error.issues
            .map((issue: any) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");
          logger.error("Schema validation failed", {
            requestId,
            responseId,
            topIssues: validation.error.issues.slice(0, 5),
            errorDetails: detail.slice(0, 500),
            aiResponse: JSON.stringify(parsed, null, 2).slice(0, 1000),
            durationMs: duration,
            responseFormat: usedMode,
          });
          throw new ValidationError(
            `Schema validation failed: ${detail.slice(0, 200)}`,
            requestId,
            { responseId, durationMs: duration, issues: validation.error.issues.slice(0, 5) }
          );
        }

        // Clean unknown keys from validated data
        const cleanedData = cleanSpec(validation.data, schema);

        // Log token usage and estimate cost (assuming $0.002/1k input, $0.006/1k output for gpt-4o-mini)
        if (data.usage) {
          const inputCost = (data.usage.prompt_tokens || 0) * 0.002 / 1000;
          const outputCost = (data.usage.completion_tokens || 0) * 0.006 / 1000;
          logger.info("AI token usage", {
            requestId,
            responseId,
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
            estimatedCost: (inputCost + outputCost).toFixed(4),
            durationMs: duration,
          });
        }

        logger.info("✅ AI response validated", {
          requestId,
          responseId,
          hasTitle: !!(cleanedData as any)?.content?.title,
          hasBullets: !!(cleanedData as any)?.content?.bullets,
          hasChart: !!(cleanedData as any)?.content?.dataViz,
          durationMs: duration,
          responseFormat: usedMode,
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          contentLength,
        });

        return cleanedData;
      } catch (error) {
        clearTimeout(timeoutId);
        if ((error as Error).name === 'AbortError') {
          throw new AIError("AI request timed out", "TIMEOUT_ERROR", requestId, { durationMs: Date.now() - start });
        }
        throw error;
      }
    };

    // First try json_schema; fallback to json_object on 400/unsupported
    return attempt("json_schema");
  }, 3, 1000);
}

/* -------------------------------------------------------------------------- */
/*                              Prompt sanitation                              */
/* -------------------------------------------------------------------------- */

// sanitizePrompt is now exported from ./moderation module (see top of file)

/* -------------------------------------------------------------------------- */
/*                                  Moderation                                 */
/* -------------------------------------------------------------------------- */

// moderateContent is now exported from ./moderation module (see top of file)

/* -------------------------------------------------------------------------- */
/*                         Brand & Palette Inference                          */
/* -------------------------------------------------------------------------- */

/**
 * Infer brand/sector from prompt and return appropriate palette
 */
export function brandPaletteFromPrompt(
  prompt: string,
  plannerOutput?: { brandHints?: string[]; intent?: string }
): { primary: string; accent: string } {
  const lower = prompt.toLowerCase();
  const brandHints = plannerOutput?.brandHints || [];

  // Known brand colors
  const brandColors: Record<string, { primary: string; accent: string }> = {
    google: { primary: "#4285F4", accent: "#EA4335" },
    microsoft: { primary: "#0078D4", accent: "#FFB900" },
    apple: { primary: "#000000", accent: "#A2AAAD" },
    amazon: { primary: "#FF9900", accent: "#146EB4" },
    meta: { primary: "#0668E1", accent: "#00A400" },
    facebook: { primary: "#1877F2", accent: "#42B72A" },
    tesla: { primary: "#CC0000", accent: "#000000" },
    netflix: { primary: "#E50914", accent: "#000000" },
    spotify: { primary: "#1DB954", accent: "#191414" },
    uber: { primary: "#000000", accent: "#5FB709" },
    airbnb: { primary: "#FF5A5F", accent: "#00A699" },
  };

  // Check for brand mentions
  for (const [brand, colors] of Object.entries(brandColors)) {
    if (brandHints.some(hint => hint.toLowerCase().includes(brand)) || lower.includes(brand)) {
      logger.info("Brand palette detected", { brand, primary: colors.primary, accent: colors.accent });
      return colors;
    }
  }

  // Sector-based palette inference
  const sectorPalettes: Array<{ keywords: RegExp; primary: string; accent: string; name: string }> = [
    { keywords: /\b(finance|bank|investment|trading|stock|capital|fund|wealth)\b/i, primary: "#1E3A8A", accent: "#D97706", name: "finance" },
    { keywords: /\b(tech|software|ai|digital|cloud|data|cyber|innovation)\b/i, primary: "#1D4ED8", accent: "#06B6D4", name: "tech" },
    { keywords: /\b(sustain|green|environment|climate|renewable|eco|carbon)\b/i, primary: "#047857", accent: "#84CC16", name: "sustainability" },
    { keywords: /\b(health|medical|pharma|biotech|clinical|patient|hospital)\b/i, primary: "#0369A1", accent: "#DC2626", name: "healthcare" },
    { keywords: /\b(retail|consumer|brand|marketing|ecommerce|shopping)\b/i, primary: "#7C3AED", accent: "#F59E0B", name: "retail" },
    { keywords: /\b(energy|oil|gas|power|utility|electric|solar)\b/i, primary: "#0F766E", accent: "#F97316", name: "energy" },
    { keywords: /\b(creative|design|media|art|agency|studio)\b/i, primary: "#6D28D9", accent: "#EC4899", name: "creative" },
    { keywords: /\b(consulting|strategy|advisory|management|mckinsey|bcg|bain)\b/i, primary: "#1E40AF", accent: "#F59E0B", name: "consulting" },
  ];

  for (const sector of sectorPalettes) {
    if (sector.keywords.test(lower)) {
      logger.info("Sector palette detected", { sector: sector.name, primary: sector.primary, accent: sector.accent });
      return { primary: sector.primary, accent: sector.accent };
    }
  }

  // Intent-based fallback
  if (plannerOutput?.intent === "analytical") {
    return { primary: "#1E40AF", accent: "#06B6D4" }; // Blue + cyan for data
  } else if (plannerOutput?.intent === "action") {
    return { primary: "#DC2626", accent: "#F59E0B" }; // Red + amber for urgency
  }

  // Default professional palette
  return { primary: "#1E40AF", accent: "#F59E0B" };
}



/* -------------------------------------------------------------------------- */
/*                           Enhancement (idempotent)                          */
/* -------------------------------------------------------------------------- */

/**
 * Action verbs for professional slide titles - expanded list
 */
const ACTION_VERBS = [
  "Transform", "Accelerate", "Unlock", "Optimize", "Drive", "Elevate", "Maximize",
  "Enhance", "Streamline", "Innovate", "Deliver", "Enable", "Build", "Scale",
  "Achieve", "Create", "Develop", "Implement", "Launch", "Execute", "Revolutionize",
  "Pioneer", "Catalyze", "Amplify", "Fortify", "Reinvent", "Empower", "Orchestrate"
];

/**
 * Ensure title starts with an action verb for professional impact
 */
function ensureActionVerb(title: string): string {
  const trimmed = title.trim();
  // Check if already starts with an action verb
  const startsWithAction = ACTION_VERBS.some(verb =>
    trimmed.toLowerCase().startsWith(verb.toLowerCase())
  );

  if (startsWithAction) return trimmed;

  // Heuristic-based verb selection
  const growthKeywords = /\b(grow|increase|expand|scale|boost)\b/i.test(trimmed);
  const efficiencyKeywords = /\b(efficien|optim|streamline|reduce|cost|save)\b/i.test(trimmed);
  const innovationKeywords = /\b(innovat|new|develop|create|build)\b/i.test(trimmed);

  let verb = "Unlock";
  if (growthKeywords) verb = "Accelerate";
  else if (efficiencyKeywords) verb = "Optimize";
  else if (innovationKeywords) verb = "Innovate";

  // If title is a noun phrase, prepend appropriate verb
  if (/^(the|a|an)\s+/i.test(trimmed)) {
    return `${verb} ${trimmed.replace(/^(the|a|an)\s+/i, "")}`;
  }

  return `${verb} ${trimmed}`;
}

/**
 * Normalize bullet grammar to parallel voice
 */
function normalizeBulletGrammar(text: string): string {
  let normalized = text.trim();

  // Remove trailing punctuation (periods, commas)
  normalized = normalized.replace(/[.,;:]$/, "");

  // Ensure starts with capital letter
  if (normalized.length > 0) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  // Ensure action-oriented if possible
  const verbs = /\b(is|are|was|were|has|have|had)\b/i;
  if (verbs.test(normalized)) {
    normalized = normalized.replace(verbs, match => {
      return match.toLowerCase() === 'is' ? 'Implement' : 'Drive'; // Simple replacement
    });
  }

  return normalized;
}

/**
 * Split concatenated bullets like "1776 A 1783 B 1789 C" -> separate items.
 * Extended to handle year ranges, quarters, month-year, and numbered lists.
 */
function splitConcatenatedBullets(bulletGroup: any): any {
  if (!bulletGroup.items || bulletGroup.items.length === 0) return bulletGroup;

  const newItems: any[] = [];
  for (const item of bulletGroup.items) {
    const text = String(item.text || "");

    // Pattern 1: Year events (1776 Event A 1783 Event B)
    const yearEventPattern = /(\d{4}\s+[^0-9]+?)(?=\d{4}\s+|$)/g;
    const yearMatches = [...text.matchAll(yearEventPattern)].map(m => m[0]);

    // Pattern 2: Year ranges (1999–2001 Event A 2002–2004 Event B)
    const yearRangePattern = /(\d{4}[–-]\d{4}\s+[^0-9]+?)(?=\d{4}[–-]\d{4}\s+|$)/g;
    const rangeMatches = [...text.matchAll(yearRangePattern)].map(m => m[0]);

    // Pattern 3: Quarters (Q1 2024 Event A Q2 2024 Event B)
    const quarterPattern = /(Q[1-4]\s+\d{4}\s+[^Q]+?)(?=Q[1-4]\s+\d{4}\s+|$)/gi;
    const quarterMatches = [...text.matchAll(quarterPattern)].map(m => m[0]);

    // Pattern 4: Month-year dates (Jan 2024 Event A Feb 2024 Event B)
    const monthYearPattern = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s+[^A-Z]+?)(?=(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s+|$)/gi;
    const monthMatches = [...text.matchAll(monthYearPattern)].map(m => m[0]);

    // Pattern 5: Numbered lists (1. Item A 2. Item B)
    const numberedPattern = /(\d+\.\s+[^0-9]+?)(?=\d+\.\s+|$)/g;
    const numberedMatches = [...text.matchAll(numberedPattern)].map(m => m[0].replace(/^\d+\.\s+/, '')); // Strip number

    let matches: string[] = [];
    let patternType = '';

    if (yearMatches.length > 1) {
      matches = yearMatches;
      patternType = 'year';
    } else if (rangeMatches.length > 1) {
      matches = rangeMatches;
      patternType = 'range';
    } else if (quarterMatches.length > 1) {
      matches = quarterMatches;
      patternType = 'quarter';
    } else if (monthMatches.length > 1) {
      matches = monthMatches;
      patternType = 'month';
    } else if (numberedMatches.length > 1) {
      matches = numberedMatches;
      patternType = 'numbered';
    }

    if (matches.length > 1) {
      logger.info("Splitting concatenated timeline bullets", {
        original: text.slice(0, 100),
        count: matches.length,
        pattern: patternType
      });
      for (const m of matches) {
        newItems.push({ text: m.trim(), level: item.level || 1 });
      }
    } else {
      newItems.push(item);
    }
  }
  return { ...bulletGroup, items: newItems };
}

/**
 * Infer and add callouts if key insights detected in bullets
 */
function inferCallouts(spec: any): any {
  if (!Array.isArray(spec.content?.bullets) || spec.content.callouts?.length > 0) return spec;

  const potentialCallouts: any[] = [];
  const insightPatterns = /\b(roi|kpi|metric|achieve|impact|result|projected|forecast|benchmark)\b/i;
  const riskPatterns = /\b(risk|challenge|constraint|warning|blocker|issue)\b/i;

  for (const group of spec.content.bullets) {
    for (const item of group.items || []) {
      const text = item.text || '';
      if (insightPatterns.test(text)) {
        potentialCallouts.push({
          id: `c_${potentialCallouts.length}`,
          type: "success",
          text: text.slice(0, 40),
          icon: "check-circle"
        });
      } else if (riskPatterns.test(text)) {
        potentialCallouts.push({
          id: `c_${potentialCallouts.length}`,
          type: "warning",
          text: text.slice(0, 40),
          icon: "alert-triangle"
        });
      }
    }
  }

  if (potentialCallouts.length > 0) {
    spec.content.callouts = potentialCallouts.slice(0, 3); // Max 3 inferred
    logger.info("Inferred callouts from bullets", { count: spec.content.callouts.length });
  }

  return spec;
}

/**
 * Suggest image placeholders if content suggests visuals
 */
function suggestImages(spec: any): any {
  if (spec.content.images?.length > 0 || spec.content.imagePlaceholders?.length > 0) return spec;

  const visualPatterns = /\b(image|photo|illustration|diagram|chart|graph|picture|visual|depict|show)\b/i;
  const hasVisualHint = visualPatterns.test(JSON.stringify(spec.content));

  if (hasVisualHint) {
    spec.content.imagePlaceholders = [
      {
        id: "ph1",
        role: "illustration",
        alt: "Suggested illustration for key concept"
      }
    ];
    logger.info("Added suggested image placeholder based on content");
  }

  return spec;
}

/**
 * Post-process and enhance AI-generated slide spec.
 * - Ensures required fields
 * - Trims bullets to policy (<=3 groups, <=6 items each, <=80 chars)
 * - Normalizes chart series to labels length
 * - Validates palette, enforces 9 neutrals & contrast AAA
 * - Heuristically fixes header layout
 * - Infers callouts and suggests images
 * - Enhanced color validation with luminance checks
 * - Uses brand/sector palette inference when available
 */
export function enhanceSlideSpec(
  spec: any,
  plannerOutput?: { brandHints?: string[]; intent?: string },
  originalPrompt?: string
): any {
  const warnings: string[] = [];
  logger.info("🔍 Enhancing slide spec for world-class quality");

  // --- Required scaffolding --------------------------------------------------
  spec.meta = spec.meta || { version: "1.0", locale: "en-US", theme: "Professional", aspectRatio: "16:9" };
  spec.design = spec.design || { pattern: "executive", whitespace: { strategy: "balanced", breathingRoom: 0.35 } };
  spec.content = spec.content || {};
  if (!spec.content.title?.text) spec.content.title = { id: "title", text: "Untitled Slide" };

  // --- Title & subtitle hygiene ---------------------------------------------
  if (spec.content.title?.text) {
    let t = String(spec.content.title.text).trim().replace(/\s+/g, " ");

    // Enforce action-verb start for professional impact
    const original = t;
    t = ensureActionVerb(t);
    if (t !== original) {
      warnings.push("Title enhanced with action verb");
    }

    if (t.length > 50) { // Tightened limit for impact
      warnings.push("Title truncated to 50 chars");
      t = t.slice(0, 47).trim() + "...";
    }
    spec.content.title.text = t;
    spec.content.title.id = spec.content.title.id || "title";
  }

  if (spec.content.subtitle?.text) {
    let st = String(spec.content.subtitle.text).trim().replace(/\s+/g, " ");
    if (st.length > 80) { // Tightened limit
      warnings.push("Subtitle truncated to 80 chars");
      st = st.slice(0, 77).trim() + "...";
    }
    spec.content.subtitle.text = st;
    spec.content.subtitle.id = spec.content.subtitle.id || "subtitle";
  }

  // --- Bullets normalization -------------------------------------------------
  if (Array.isArray(spec.content.bullets)) {
    // Cap groups to 3
    if (spec.content.bullets.length > 3) {
      warnings.push("Bullet groups capped at 3");
      spec.content.bullets = spec.content.bullets.slice(0, 3);
    }

    // Ensure IDs and split concatenations
    spec.content.bullets = spec.content.bullets.map((b: any, i: number) => ({
      id: b.id || `bullets_${i}`,
      items: b.items || [],
    }));
    spec.content.bullets = spec.content.bullets.map(splitConcatenatedBullets);

    // Per-item hygiene
    const bulletValidation = validateBulletCount(spec.content.bullets, 6); // Increased to 6
    if (!bulletValidation.valid) warnings.push("Bullet items per group limited to 6");

    for (const group of spec.content.bullets) {
      if (!Array.isArray(group.items)) group.items = [];
      if (group.items.length > 6) group.items = group.items.slice(0, 6);

      for (let i = 0; i < group.items.length; i++) {
        let item = group.items[i];
        if (!item) continue;

        // Convert string items to objects
        if (typeof item === "string") {
          item = { text: item, level: 1 };
          group.items[i] = item;
        }

        item.level = Math.min(3, Math.max(1, Number(item.level || 1)));
        if (typeof item.text === "string") {
          let tx = item.text.trim().replace(/\s+/g, " ");

          // Normalize grammar for parallel voice
          tx = normalizeBulletGrammar(tx);

          if (tx.length > 80) {
            warnings.push("Bullet text truncated to 80 chars");
            tx = tx.slice(0, 77).trim() + "...";
          }
          item.text = tx;
        }
      }
    }
  }

  // --- Callouts & IDs --------------------------------------------------------
  if (Array.isArray(spec.content.callouts)) {
    spec.content.callouts = spec.content.callouts.slice(0, 4); // Increased max to 4
    spec.content.callouts.forEach((c: any, i: number) => (c.id = c.id || `callout_${i}`));
  } else {
    // Infer callouts if possible
    spec = inferCallouts(spec);
  }

  // --- Charts: series length == labels length + format sanity ---------------
  if (spec.content?.dataViz?.labels && spec.content?.dataViz?.series) {
    const viz = spec.content.dataViz;
    viz.id = viz.id || "dataviz";
    const labelCount = Math.max(0, Math.min(12, viz.labels.length)); // Increased max labels
    viz.labels = viz.labels.slice(0, labelCount);

    // Chart label sanity: if labels look numeric but valueFormat is "percent", normalize
    if (viz.valueFormat === "percent") {
      const allNumeric = viz.labels.every((l: any) => !isNaN(Number(l)));
      if (allNumeric) {
        warnings.push("Chart labels appear numeric with percent format - treating as categories");
      }

      // Normalize series values to 0..100 range if they appear to be 0..1
      for (const s of viz.series) {
        if (Array.isArray(s.values)) {
          const maxVal = Math.max(...s.values.filter((v: any) => typeof v === "number"));
          if (maxVal > 0 && maxVal <= 1) {
            s.values = s.values.map((v: any) => typeof v === "number" ? v * 100 : v);
            warnings.push(`Series "${s.name}" normalized to 0-100 for percent format`);
          }
        }
      }
    }

    for (const s of viz.series) {
      const diff = labelCount - (Array.isArray(s.values) ? s.values.length : 0);
      if (diff > 0) {
        warnings.push("Series padded with zeros to match labels length");
        s.values = [...(s.values || []), ...Array(diff).fill(0)];
      } else if (diff < 0) {
        warnings.push("Series trimmed to labels length");
        s.values = (s.values || []).slice(0, labelCount);
      }
    }

    // Add legend if multiple series
    if (viz.series.length > 1 && !viz.legend) {
      viz.legend = { position: "bottom", alignment: "center" };
      warnings.push("Added default legend for multi-series chart");
    }
  }

  // --- Images and placeholders -----------------------------------------------
  spec = suggestImages(spec);

  if (Array.isArray(spec.content.images)) {
    spec.content.images.forEach((img: any, i: number) => {
      img.id = img.id || `img_${i}`;
      if (!img.fit) img.fit = "cover"; // Default fit
    });
  }

  if (Array.isArray(spec.content.imagePlaceholders)) {
    spec.content.imagePlaceholders.forEach((ph: any, i: number) => {
      ph.id = ph.id || `ph_${i}`;
    });
  }

  // --- Palette & accessibility with context-aware generation ------------------
  const hex = /^#[0-9A-Fa-f]{6}$/;

  spec.styleTokens = spec.styleTokens || {};
  spec.styleTokens.palette = spec.styleTokens.palette || {};
  const p = spec.styleTokens.palette;

  // Generate context-aware palette if colors are missing
  if (!p.primary || !hex.test(p.primary) || !p.accent || !hex.test(p.accent)) {
    // Use brand/sector inference if planner output available
    const prompt = originalPrompt || spec.content?.title?.text || "";
    let generatedPalette;

    if (plannerOutput) {
      generatedPalette = brandPaletteFromPrompt(prompt, plannerOutput);
      warnings.push("Palette inferred from brand/sector hints");
    } else {
      generatedPalette = generatePalette(prompt);
      warnings.push("Palette generated from context");
    }

    if (!p.primary || !hex.test(p.primary)) {
      p.primary = generatedPalette.primary;
    }
    if (!p.accent || !hex.test(p.accent)) {
      p.accent = generatedPalette.accent;
    }
  }

  // Guarantee exactly 9 neutrals, dark → light
  if (!Array.isArray(p.neutral)) {
    p.neutral = [...DEFAULT_NEUTRAL_9];
    warnings.push("Neutral palette defaulted");
  } else {
    const filtered = p.neutral.filter((c: any) => typeof c === "string" && hex.test(c)).slice(0, 9);
    if (filtered.length !== 9) {
      p.neutral = generateCompliantNeutralRamp();
      warnings.push("Neutral palette regenerated to ensure 9 compliant colors");
    } else {
      p.neutral = filtered;
    }
  }

  // Enforce contrast AAA for text (7:1); AA (4.5:1) for UI accents
  const textColor = p.neutral[0];
  const bgColor = p.neutral[8];
  const textContrast = ensureContrast(textColor, bgColor, 7);
  if (!textContrast.compliant) {
    // Use standard compliant colors
    p.neutral[0] = "#111827"; // Darker text
    p.neutral[8] = "#F9FAFB"; // Lighter bg
    warnings.push("Contrast adjusted to meet WCAG AAA (7:1)");
  }

  // Primary vs accent separation (4.5:1 for consistent legibility)
  const primAcc = ensureContrast(p.primary, p.accent, 4.5);
  if (!primAcc.compliant) {
    // Pick a compliant accent from curated ramp
    const accentRamp = ["#F59E0B", "#EC4899", "#8B5CF6", "#10B981", "#3B82F6", "#EF4444", "#6366F1", "#14B8A6"];
    let foundCompliant = false;
    for (const candidate of accentRamp) {
      const test = ensureContrast(p.primary, candidate, 4.5);
      if (test.compliant) {
        p.accent = candidate;
        foundCompliant = true;
        warnings.push(`Accent color adjusted for 4.5:1 contrast (${test.ratio.toFixed(2)}:1)`);
        break;
      }
    }
    if (!foundCompliant) {
      p.accent = "#F59E0B"; // Fallback
      warnings.push("Accent color set to fallback (contrast may be suboptimal)");
    }
  }

  // --- Layout heuristics -----------------------------------------------------
  spec = fixLayoutIssues(spec);

  if (warnings.length) {
    logger.info("Spec enhancement warnings", { warnings });
  }

  return spec;
}

/* -------------------------------------------------------------------------- */
/*                              Layout heuristics                              */
/* -------------------------------------------------------------------------- */

function fixLayoutIssues(spec: any): any {
  if (!spec.layout?.regions || !spec.layout?.anchors) return spec;

  const hasSubtitle = !!spec.content?.subtitle?.text;
  const hasTitle = !!spec.content?.title?.text;
  const hasChart = !!spec.content?.dataViz;
  const hasBullets = Array.isArray(spec.content?.bullets) && spec.content.bullets.length > 0;

  const header = spec.layout.regions.find((r: any) => r.name === "header");
  if (header && hasTitle && hasSubtitle && header.rowSpan < 2) {
    header.rowSpan = 2;

    const body = spec.layout.regions.find((r: any) => r.name === "body");
    if (body && body.rowStart <= 2) {
      body.rowStart = 3;
      body.rowSpan = Math.max(1, body.rowSpan - (3 - body.rowStart));
    }
    const aside = spec.layout.regions.find((r: any) => r.name === "aside" || r.name === "sidebar");
    if (aside && aside.rowStart <= 2) {
      aside.rowStart = 3;
      aside.rowSpan = Math.max(1, aside.rowSpan - (3 - aside.rowStart));
    }
  }

  // Split layout for chart + bullets
  if (hasChart && hasBullets && spec.layout.regions.length < 3) {
    // Add left/right body if not present
    const bodyIndex = spec.layout.regions.findIndex((r: any) => r.name === "body");
    if (bodyIndex !== -1) {
      const body = spec.layout.regions[bodyIndex];
      spec.layout.regions.splice(bodyIndex, 1); // Remove full body

      spec.layout.regions.push({
        name: "left-body",
        rowStart: body.rowStart,
        colStart: 1,
        rowSpan: body.rowSpan,
        colSpan: 5,
      });
      spec.layout.regions.push({
        name: "right-body",
        rowStart: body.rowStart,
        colStart: 6,
        rowSpan: body.rowSpan,
        colSpan: 7,
      });

      // Reassign anchors
      spec.layout.anchors = spec.layout.anchors.map((a: any) => {
        if (a.region === "body") {
          a.region = hasBullets ? "left-body" : "right-body";
        }
        return a;
      });

      // Assign chart to right, bullets to left
      const chartAnchor = spec.layout.anchors.find((a: any) => a.refId === spec.content.dataViz?.id);
      if (chartAnchor) chartAnchor.region = "right-body";

      const bulletAnchors = spec.layout.anchors.filter((a: any) => a.refId.startsWith("bullets_") || a.refId.startsWith("b"));
      bulletAnchors.forEach((a: any) => { a.region = "left-body"; });

      logger.info("Split body layout for chart + bullets");
    }
  }

  // Drop anchors pointing to missing regions
  const regionNames = new Set(spec.layout.regions.map((r: any) => r.name));
  spec.layout.anchors = spec.layout.anchors.filter((a: any) => regionNames.has(a.region));

  // Ensure all content elements have anchors
  const anchorRefIds = new Set(spec.layout.anchors.map((a: any) => a.refId));
  const mainRegion = spec.layout.regions.find((r: any) => r.name.includes("body"))?.name || "body";

  // Add chart anchor if chart exists but not anchored
  if (spec.content?.dataViz?.id && !anchorRefIds.has(spec.content.dataViz.id)) {
    const maxOrder = Math.max(
      0,
      ...spec.layout.anchors
        .filter((a: any) => a.region === mainRegion)
        .map((a: any) => a.order || 0)
    );
    spec.layout.anchors.push({
      refId: spec.content.dataViz.id,
      region: mainRegion,
      order: maxOrder + 1,
    });
    anchorRefIds.add(spec.content.dataViz.id);
  }

  // Add bullet anchors if bullets exist but not anchored
  if (Array.isArray(spec.content?.bullets)) {
    for (const bullet of spec.content.bullets) {
      if (bullet.id && !anchorRefIds.has(bullet.id)) {
        const maxOrder = Math.max(
          0,
          ...spec.layout.anchors
            .filter((a: any) => a.region === mainRegion)
            .map((a: any) => a.order || 0)
        );
        spec.layout.anchors.push({
          refId: bullet.id,
          region: mainRegion,
          order: maxOrder + 1,
        });
        anchorRefIds.add(bullet.id);
      }
    }
  }

  // Add callout anchors if callouts exist but not anchored
  if (Array.isArray(spec.content?.callouts)) {
    for (const callout of spec.content.callouts) {
      if (callout.id && !anchorRefIds.has(callout.id)) {
        const maxOrder = Math.max(
          0,
          ...spec.layout.anchors
            .filter((a: any) => a.region === mainRegion)
            .map((a: any) => a.order || 0)
        );
        spec.layout.anchors.push({
          refId: callout.id,
          region: mainRegion,
          order: maxOrder + 1,
        });
        anchorRefIds.add(callout.id);
      }
    }
  }

  // Add image anchors
  if (Array.isArray(spec.content?.images)) {
    for (const img of spec.content.images) {
      if (img.id && !anchorRefIds.has(img.id)) {
        const maxOrder = Math.max(
          0,
          ...spec.layout.anchors
            .filter((a: any) => a.region === mainRegion)
            .map((a: any) => a.order || 0)
        );
        spec.layout.anchors.push({
          refId: img.id,
          region: mainRegion,
          order: maxOrder + 1,
        });
        anchorRefIds.add(img.id);
      }
    }
  }

  return spec;
}