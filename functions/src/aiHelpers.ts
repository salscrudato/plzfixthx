import * as logger from "firebase-functions/logger";
import { fetch as undiciFetch } from "undici";
import { z } from "zod";
import { ENHANCED_SYSTEM_PROMPT } from "./prompts";
import { generatePalette } from "./colorPaletteGenerator";
import { randomUUID } from "crypto";

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

/* -------------------------------------------------------------------------- */
/*                               Color & Contrast                             */
/* -------------------------------------------------------------------------- */

/**
 * WCAG 2.2 relative luminance + contrast.
 * Parses #RRGGBB (alpha ignored). Returns ratio and compliance.
 */
function ensureContrast(textHex: string, bgHex: string, minRatio: number) {
  const toRGB = (hex: string): [number, number, number] => {
    const clean = hex.replace("#", "").slice(0, 6);
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    return [r, g, b];
  };

  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  const luminance = (hex: string) => {
    const [r, g, b] = toRGB(hex);
    const R = lin(r);
    const G = lin(g);
    const B = lin(b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };

  const L1 = luminance(textHex);
  const L2 = luminance(bgHex);
  const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);

  return { compliant: ratio >= minRatio, ratio };
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

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 800
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const jitter = Math.floor(Math.random() * 150);
        const delay = Math.min(8000, baseDelay * Math.pow(2, attempt)) + jitter;
        logger.warn(`Attempt ${attempt + 1} failed; retrying in ${delay}ms`, {
          error: (lastError as any)?.message || String(lastError),
        });
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/* -------------------------------------------------------------------------- */
/*                      OpenAI‑compatible structured outputs                   */
/* -------------------------------------------------------------------------- */

/**
 * Convert Zod schema to JSON Schema for structured output.
 * Always available now that zod-to-json-schema is a dependency.
 */
function toJsonSchema(schema: z.ZodTypeAny): any {
  const json = zodToJsonSchema(schema, { name: "SlideSpec" });
  // Add draft for providers that expect a $schema field
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
 */
export async function callAIWithRetry(
  prompt: string,
  apiKey: string,
  baseUrl: string,
  model: string,
  schema: z.ZodTypeAny,
  requestId: string = randomUUID()
): Promise<unknown> {
  return retryWithBackoff(async () => {
    const start = Date.now();
    let usedMode: "json_schema" | "json_object" = "json_schema";
    let responseId: string | undefined;

    // Generate JSON Schema from Zod
    const jsonSchema = toJsonSchema(schema);

    const attempt = async (mode: "json_schema" | "json_object") => {
      usedMode = mode;

      const body: any = {
        model,
        temperature: 0.2,
        top_p: 0.95,
        seed: requestId.split("-")[0], // Use first segment of UUID for reproducibility
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

      const response = await undiciFetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      });

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

      // Log token usage if available
      if (data.usage) {
        logger.info("AI token usage", {
          requestId,
          responseId,
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
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
    };

    // First try json_schema; fallback to json_object on 400/unsupported
    return attempt("json_schema");
  }, 3, 1000);
}

/* -------------------------------------------------------------------------- */
/*                              Prompt sanitation                              */
/* -------------------------------------------------------------------------- */

export function sanitizePrompt(prompt: string, maxLength = 800): string {
  if (!prompt || typeof prompt !== "string") throw new Error("Prompt must be a non-empty string");
  let p = prompt.trim();

  // Remove code fences and obvious wrappers
  p = p.replace(/^```[a-z0-9]*\n?/i, "").replace(/```$/i, "").trim();

  if (p.length < 3) throw new Error("Prompt must be at least 3 characters long");

  if (p.length > maxLength) {
    logger.info("Prompt truncated to max length", { original: p.length, max: maxLength });
    return p.slice(0, maxLength);
  }

  return p;
}

/* -------------------------------------------------------------------------- */
/*                                  Moderation                                 */
/* -------------------------------------------------------------------------- */

export function moderateContent(
  prompt: string
): { safe: boolean; reason?: string; categories?: string[] } {
  const lower = prompt.toLowerCase();

  // Business context keywords allow benign usage (esp. crypto/finance/security topics)
  const benignBusiness = /\b(strategy|market|roadmap|policy|regulation|regulatory|compliance|report|analysis|architecture|infrastructure|risk|controls|governance|kpi|presentation|slide|deck|test|testing|assessment)\b/i;

  // High-risk categories
  const categories: Array<{ name: string; rx: RegExp; severity: number }> = [
    // Explicit wrongdoing / instructions
    { name: "violent wrongdoing", rx: /\b(build|make|how\s*to|instructions?|guide)\b.*\b(bomb|weapon|explosive|molotov|knife|gun)\b/i, severity: 5 },
    { name: "cyber wrongdoing", rx: /\b(hack|zero[-\s]?day|exploit|ransomware|botnet|ddos|bypass|backdoor)\b.*\b(guide|how|tutorial|steps?|system)\b/i, severity: 5 },
    // Extremist violence or threats
    { name: "incitement", rx: /\b(kill|murder|assault|shoot|stab)\b.*\b(how|plan|guide|tips?)\b/i, severity: 5 },
    // Sexual content explicit
    { name: "sexual content", rx: /\b(porn|xxx|nsfw|explicit|nude|sexual)\b/i, severity: 4 },
    // Drugs illegal
    { name: "illegal drugs", rx: /\b(cocaine|heroin|meth|mdma|lsd|fentanyl)\b/i, severity: 4 },
    // Fraud / scams
    { name: "scams", rx: /\b(get\s*rich\s*quick|double\s*your\s*(money|btc)|seed\s*phrase|giveaway|airdrop\s*claim)\b/i, severity: 4 },
    // Hate / harassment
    { name: "hate speech", rx: /\b(racist|white\s*power|kkk|nazi|kill\s*\w+|gas\s*\w+)\b/i, severity: 5 },
  ];

  // **Allow** benign business contexts for crypto/security words
  if (/\b(crypto|bitcoin|nft|blockchain|penetration\s*test|security)\b/i.test(prompt) && benignBusiness.test(prompt)) {
    // do nothing — allowed
  } else {
    // Add softer generic matches (these alone shouldn't block)
    categories.push(
      { name: "generic violence", rx: /\b(violence|weapon|bomb|terror)\b/i, severity: 1 },
      { name: "generic cyber", rx: /\b(hack|exploit|vulnerability|xss|sql\s*injection|malware)\b/i, severity: 2 },
      { name: "generic spam", rx: /\b(spam|scam|phishing|fraud)\b/i, severity: 2 }
    );
  }

  let score = 0;
  const hits: string[] = [];

  for (const c of categories) {
    if (c.rx.test(lower)) {
      score += c.severity;
      hits.push(c.name);
    }
  }

  // Length abuse
  if (prompt.length > 4000) {
    return { safe: false, reason: "Prompt too long (max 4000 chars)", categories: ["abuse"] };
  }

  // Repetition abuse
  const words = prompt.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    const freq = new Map<string, number>();
    for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
    const maxFreq = Math.max(...freq.values());
    if (maxFreq > words.length * 0.5) {
      return { safe: false, reason: "Excessive repetition", categories: ["abuse"] };
    }
  }

  if (score >= 2) {
    logger.warn("Content moderation blocked prompt", { categories: hits });
    return { safe: false, reason: "Content may be unsafe or disallowed", categories: hits };
  }

  return { safe: true };
}

/* -------------------------------------------------------------------------- */
/*                         Fallback Spec Generation                            */
/* -------------------------------------------------------------------------- */

/**
 * Generate a minimal but valid fallback spec when AI generation fails.
 * Ensures the slide is still renderable with sensible defaults.
 */
export function generateFallbackSpec(prompt: string, requestId: string): any {
  logger.warn("Generating fallback spec", { requestId, prompt: prompt.slice(0, 100) });

  return {
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Professional",
      aspectRatio: "16:9",
    },
    content: {
      title: {
        id: "title",
        text: prompt.slice(0, 60).trim() || "Untitled Slide",
      },
      subtitle: {
        id: "subtitle",
        text: "Generated with fallback due to AI service unavailability",
      },
    },
    layout: {
      grid: {
        rows: 6,
        cols: 6,
        gutter: 16,
        margin: { t: 32, r: 32, b: 32, l: 32 },
      },
      regions: [
        {
          name: "header",
          rowStart: 1,
          colStart: 1,
          rowSpan: 2,
          colSpan: 6,
        },
        {
          name: "body",
          rowStart: 3,
          colStart: 1,
          rowSpan: 4,
          colSpan: 6,
        },
      ],
      anchors: [
        {
          refId: "title",
          region: "header",
          order: 0,
        },
        {
          refId: "subtitle",
          region: "header",
          order: 1,
        },
      ],
    },
    styleTokens: {
      palette: {
        primary: "#1E40AF",
        accent: "#F59E0B",
        neutral: [
          "#0F172A",
          "#1E293B",
          "#334155",
          "#475569",
          "#64748B",
          "#94A3B8",
          "#CBD5E1",
          "#E2E8F0",
          "#F8FAFC",
        ],
      },
      typography: {
        fonts: { sans: "Inter, Arial, sans-serif" },
        sizes: {
          "step_-2": 12,
          "step_-1": 14,
          step_0: 16,
          step_1: 20,
          step_2: 24,
          step_3: 44,
        },
        weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { compact: 1.2, standard: 1.5 },
      },
      spacing: { base: 16, steps: [4, 8, 12, 16, 24, 32, 48, 64] },
      radii: { sm: 4, md: 8, lg: 12 },
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.1)",
        lg: "0 10px 15px rgba(0,0,0,0.1)",
      },
      contrast: { minTextContrast: 7, minUiContrast: 4.5 },
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                           Enhancement (idempotent)                          */
/* -------------------------------------------------------------------------- */

/**
 * Action verbs for professional slide titles
 */
const ACTION_VERBS = [
  "Transform", "Accelerate", "Unlock", "Optimize", "Drive", "Elevate", "Maximize",
  "Enhance", "Streamline", "Innovate", "Deliver", "Enable", "Build", "Scale",
  "Achieve", "Create", "Develop", "Implement", "Launch", "Execute"
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

  // If title is a noun phrase, prepend appropriate verb
  // Simple heuristic: if starts with "The/A/An", it's likely a noun phrase
  if (/^(the|a|an)\s+/i.test(trimmed)) {
    return `Unlock ${trimmed}`;
  }

  // Otherwise, return as-is (might already be imperative)
  return trimmed;
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

  return normalized;
}

/**
 * Split concatenated bullets like "1776 A 1783 B 1789 C" -> separate items.
 * Extended to handle year ranges, quarters, and date patterns.
 */
function splitConcatenatedBullets(bulletGroup: any): any {
  if (!bulletGroup.items || bulletGroup.items.length === 0) return bulletGroup;

  const newItems: any[] = [];
  for (const item of bulletGroup.items) {
    const text = String(item.text || "");

    // Pattern 1: Year events (1776 Event A 1783 Event B)
    const yearEventPattern = /(\d{4}\s+[^0-9]+?)(?=\d{4}\s+|$)/g;
    const yearMatches = text.match(yearEventPattern);

    // Pattern 2: Year ranges (1999–2001 Event A 2002–2004 Event B)
    const yearRangePattern = /(\d{4}[–-]\d{4}\s+[^0-9]+?)(?=\d{4}[–-]\d{4}\s+|$)/g;
    const rangeMatches = text.match(yearRangePattern);

    // Pattern 3: Quarters (Q1 Event A Q2 Event B)
    const quarterPattern = /(Q[1-4]\s+\d{4}\s+[^Q]+?)(?=Q[1-4]\s+\d{4}\s+|$)/gi;
    const quarterMatches = text.match(quarterPattern);

    // Pattern 4: Month-year dates (Jan 2024 Event A Feb 2024 Event B)
    const monthYearPattern = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s+[^A-Z]+?)(?=(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s+|$)/gi;
    const monthMatches = text.match(monthYearPattern);

    if ((yearMatches && yearMatches.length > 1) ||
        (rangeMatches && rangeMatches.length > 1) ||
        (quarterMatches && quarterMatches.length > 1) ||
        (monthMatches && monthMatches.length > 1)) {
      const matches = yearMatches || rangeMatches || quarterMatches || monthMatches || [];
      logger.info("Splitting concatenated timeline bullets", {
        original: text.slice(0, 100),
        count: matches.length,
        pattern: yearMatches ? "year" : rangeMatches ? "range" : quarterMatches ? "quarter" : "month"
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
 * Post-process and enhance AI-generated slide spec.
 * - Ensures required fields
 * - Trims bullets to policy (<=3 groups, <=5 items each, <=80 chars)
 * - Normalizes chart series to labels length
 * - Validates palette, enforces 9 neutrals & contrast AA/AAA
 * - Heuristically fixes header layout when title+subtitle present
 */
export function enhanceSlideSpec(spec: any): any {
  const warnings: string[] = [];
  logger.info("🔍 Enhancing slide spec for world-class quality");

  // --- Required scaffolding --------------------------------------------------
  spec.meta = spec.meta || { version: "1.0", locale: "en-US", theme: "Professional", aspectRatio: "16:9" };
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

    if (t.length > 60) {
      warnings.push("Title truncated to 60 chars");
      t = t.slice(0, 57).trim() + "...";
    }
    spec.content.title.text = t;
    spec.content.title.id = spec.content.title.id || "title";
  }

  if (spec.content.subtitle?.text) {
    let st = String(spec.content.subtitle.text).trim().replace(/\s+/g, " ");
    if (st.length > 100) {
      warnings.push("Subtitle truncated to 100 chars");
      st = st.slice(0, 97).trim() + "...";
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
    const bulletValidation = validateBulletCount(spec.content.bullets, 5);
    if (!bulletValidation.valid) warnings.push("Bullet items per group limited to 5");

    for (const group of spec.content.bullets) {
      if (!Array.isArray(group.items)) group.items = [];
      if (group.items.length > 5) group.items = group.items.slice(0, 5);

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
    spec.content.callouts = spec.content.callouts.slice(0, 2);
    spec.content.callouts.forEach((c: any, i: number) => (c.id = c.id || `callout_${i}`));
  }

  // --- Charts: series length == labels length + format sanity ---------------
  if (spec.content?.dataViz?.labels && spec.content?.dataViz?.series) {
    const viz = spec.content.dataViz;
    viz.id = viz.id || "dataviz";
    const labelCount = Math.max(0, Math.min(10, viz.labels.length));
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
  }

  // --- Palette & accessibility with context-aware generation ------------------
  const hex = /^#[0-9A-Fa-f]{6}$/;

  spec.styleTokens = spec.styleTokens || {};
  spec.styleTokens.palette = spec.styleTokens.palette || {};
  const p = spec.styleTokens.palette;

  // Generate context-aware palette if colors are missing
  if (!p.primary || !hex.test(p.primary) || !p.accent || !hex.test(p.accent)) {
    const prompt = spec.content?.title?.text || "";
    const generatedPalette = generatePalette(prompt);

    if (!p.primary || !hex.test(p.primary)) {
      p.primary = generatedPalette.primary;
      warnings.push("Primary color generated from context");
    }
    if (!p.accent || !hex.test(p.accent)) {
      p.accent = generatedPalette.accent;
      warnings.push("Accent color generated from context");
    }
  }

  // Guarantee exactly 9 neutrals, dark → light
  const defaultNeutrals = [
    "#0F172A",
    "#1E293B",
    "#334155",
    "#475569",
    "#64748B",
    "#94A3B8",
    "#CBD5E1",
    "#E2E8F0",
    "#F8FAFC",
  ];

  if (!Array.isArray(p.neutral)) {
    p.neutral = defaultNeutrals;
    warnings.push("Neutral palette defaulted");
  } else {
    const filtered = p.neutral.filter((c: any) => typeof c === "string" && hex.test(c)).slice(0, 9);
    p.neutral = filtered.length === 9 ? filtered : defaultNeutrals;
    if (filtered.length !== 9) warnings.push("Neutral palette corrected to 9 colors");
  }

  // Enforce contrast AAA for text (7:1); AA (4.5:1) for UI accents
  const textColor = p.neutral[0];
  const bgColor = p.neutral[8];
  const textContrast = ensureContrast(textColor, bgColor, 7);
  if (!textContrast.compliant) {
    p.neutral[0] = "#000000";
    p.neutral[8] = "#FFFFFF";
    warnings.push("Contrast adjusted to meet WCAG AAA (7:1)");
  }

  // Primary vs accent separation (4.5:1 for consistent legibility)
  const primAcc = ensureContrast(p.primary, p.accent, 4.5);
  if (!primAcc.compliant) {
    // Pick a compliant accent from curated ramp
    const accentRamp = ["#F59E0B", "#EC4899", "#8B5CF6", "#10B981", "#3B82F6", "#EF4444"];
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

  // --- Layout heuristics: expand header if title+subtitle --------------------
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

  const header = spec.layout.regions.find((r: any) => r.name === "header");
  if (header && hasTitle && hasSubtitle && header.rowSpan === 1) {
    header.rowSpan = 2;

    const body = spec.layout.regions.find((r: any) => r.name === "body");
    if (body && body.rowStart === 2) {
      body.rowStart = 3;
      body.rowSpan = Math.max(1, body.rowSpan - 1);
    }
    const aside = spec.layout.regions.find((r: any) => r.name === "aside");
    if (aside && aside.rowStart === 2) {
      aside.rowStart = 3;
      aside.rowSpan = Math.max(1, aside.rowSpan - 1);
    }
  }

  // Drop anchors pointing to missing regions
  const regionNames = new Set(spec.layout.regions.map((r: any) => r.name));
  spec.layout.anchors = spec.layout.anchors.filter((a: any) => regionNames.has(a.region));

  return spec;
}