import * as logger from "firebase-functions/logger";
import { fetch as undiciFetch } from "undici";
import { z } from "zod";
import { ENHANCED_SYSTEM_PROMPT } from "./prompts";

/** Simple contrast ratio calculator */
function ensureContrast(textColor: string, bgColor: string, minRatio: number) {
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? luminance : 1 - luminance;
  };
  const l1 = getLuminance(textColor);
  const l2 = getLuminance(bgColor);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return { compliant: ratio >= minRatio, ratio };
}

/** Validate bullet count */
function validateBulletCount(bullets: any[], maxPerGroup: number) {
  const valid = bullets.every(b => !b.items || b.items.length <= maxPerGroup);
  return { valid, maxPerGroup };
}

/** Validate data visualization */
function validateDataVizSeries(dataViz: any) {
  const valid = dataViz.labels && dataViz.series &&
    dataViz.series.every((s: any) => s.values.length === dataViz.labels.length);
  return { valid };
}

/** Retry with exponential backoff */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        logger.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, { error: lastError.message });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("Max retries exceeded");
}

/** Call OpenAI-compatible API with retry logic and structured output */
export async function callAIWithRetry(
  prompt: string,
  apiKey: string,
  baseUrl: string,
  model: string,
  schema: z.ZodType
): Promise<unknown> {
  return retryWithBackoff(async () => {
    const startTime = Date.now();

    const response = await undiciFetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        top_p: 0.95,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: ENHANCED_SYSTEM_PROMPT },
          { role: "user", content: `User prompt:\n<<<${prompt}>>>` }
        ]
      })
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("AI API request failed", {
        status: response.status,
        error: errorText.substring(0, 500),
        model,
        promptLength: prompt.length,
        durationMs: duration
      });
      throw new Error(`AI API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      logger.error("Failed to parse AI response as JSON", {
        error: String(e),
        durationMs: duration
      });
      throw new Error(`Failed to parse AI response: ${e}`);
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      logger.error("No content in AI response", {
        data: JSON.stringify(data).substring(0, 500),
        durationMs: duration
      });
      throw new Error("No content in AI response");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      logger.error("Failed to parse AI response content as JSON", {
        content: content.substring(0, 500),
        error: String(e),
        durationMs: duration
      });
      throw new Error(`Failed to parse AI response as JSON: ${e}`);
    }

    const validationResult = schema.safeParse(parsed);
    if (!validationResult.success) {
      const errorDetails = validationResult.error.issues.map((issue: any) =>
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ');

      logger.error("Schema validation failed", {
        errors: validationResult.error.issues.slice(0, 5),
        errorDetails: errorDetails.substring(0, 500),
        aiResponse: JSON.stringify(parsed, null, 2).substring(0, 1000),
        durationMs: duration
      });
      throw new Error(`Schema validation failed: ${errorDetails.substring(0, 200)}`);
    }

    logger.info("✅ AI response validated successfully", {
      hasTitle: !!(parsed as any)?.content?.title,
      hasBullets: !!(parsed as any)?.content?.bullets,
      hasChart: !!(parsed as any)?.content?.dataViz,
      durationMs: duration
    });

    return validationResult.data;
  }, 3, 1000);
}

/** Validate and sanitize user prompt */
export function sanitizePrompt(prompt: string, maxLength = 800): string {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error("Prompt must be a non-empty string");
  }

  const trimmed = prompt.trim();
  if (trimmed.length === 0) {
    throw new Error("Prompt cannot be empty");
  }

  // Check for minimum length (at least 3 characters for meaningful content)
  if (trimmed.length < 3) {
    throw new Error("Prompt must be at least 3 characters long");
  }

  if (trimmed.length > maxLength) {
    logger.info("Prompt truncated to max length", { original: trimmed.length, max: maxLength });
    return trimmed.slice(0, maxLength);
  }

  return trimmed;
}

/** Check for inappropriate content with comprehensive filtering */
export function moderateContent(prompt: string): { safe: boolean; reason?: string } {
  const lowerPrompt = prompt.toLowerCase();

  // Comprehensive inappropriate content detection
  const inappropriatePatterns = [
    // Security/hacking
    /\b(hack|exploit|vulnerability|inject|xss|sql\s*injection|malware|ransomware|ddos|botnet)\b/i,
    // Adult content
    /\b(porn|xxx|nsfw|explicit|adult|nude|sexual)\b/i,
    // Violence/weapons
    /\b(violence|weapon|bomb|terror|kill|murder|assault|shoot|stab)\b/i,
    // Hate speech
    /\b(hate|racist|sexist|discriminat|bigot)\b/i,
    // Spam/scam
    /\b(spam|scam|phishing|fraud|crypto|bitcoin|nft)\b/i,
    // Illegal activities
    /\b(illegal|drug|cocaine|heroin|meth|steal|robbery)\b/i
  ];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(lowerPrompt)) {
      logger.warn("Content moderation blocked prompt", { reason: "Inappropriate content detected" });
      return {
        safe: false,
        reason: "Content may contain inappropriate or unsafe material"
      };
    }
  }

  // Check for excessive length (potential abuse)
  if (prompt.length > 2000) {
    logger.warn("Content moderation blocked prompt", { reason: "Prompt too long", length: prompt.length });
    return {
      safe: false,
      reason: "Prompt is too long (max 2000 characters)"
    };
  }

  // Check for excessive repetition (potential spam)
  const words = prompt.split(/\s+/);
  const wordFreq = new Map<string, number>();
  for (const word of words) {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }
  const maxFreq = Math.max(...Array.from(wordFreq.values()));
  if (maxFreq > words.length * 0.5) {
    logger.warn("Content moderation blocked prompt", { reason: "Excessive repetition detected" });
    return {
      safe: false,
      reason: "Prompt contains excessive repetition"
    };
  }

  return { safe: true };
}

/**
 * Split concatenated bullet points into separate items
 * Detects patterns like "1776 Event1783 Event1789 Event" and splits them
 */
function splitConcatenatedBullets(bulletGroup: any): any {
  if (!bulletGroup.items || bulletGroup.items.length === 0) {
    return bulletGroup;
  }

  const newItems: any[] = [];

  for (const item of bulletGroup.items) {
    const text = item.text || "";

    // Detect concatenated timeline events (year + event pattern)
    // Pattern: 4-digit year followed by text, repeated
    const yearEventPattern = /(\d{4}\s+[^0-9]+?)(?=\d{4}\s+|$)/g;
    const matches = text.match(yearEventPattern);

    if (matches && matches.length > 1) {
      // Split concatenated events
      logger.info("Splitting concatenated bullet points", { original: text, count: matches.length });
      for (const match of matches) {
        const trimmed = match.trim();
        if (trimmed) {
          newItems.push({
            text: trimmed,
            level: item.level || 1
          });
        }
      }
    } else {
      // Keep as-is if not concatenated
      newItems.push(item);
    }
  }

  return {
    ...bulletGroup,
    items: newItems
  };
}

/** Post-process and enhance AI-generated slide spec */
export function enhanceSlideSpec(spec: any): any {
  logger.info("🔍 Enhancing slide spec for world-class quality");

  // Ensure all required fields are present
  if (!spec.meta) {
    spec.meta = {
      version: "1.0",
      locale: "en-US",
      theme: "Professional",
      aspectRatio: "16:9"
    };
  }

  // Ensure content has at least a title
  if (!spec.content?.title?.text) {
    if (!spec.content) spec.content = {};
    spec.content.title = {
      id: "title",
      text: "Untitled Slide"
    };
  }

  // Enhance title quality - ensure it's concise and impactful
  if (spec.content?.title?.text) {
    let title = spec.content.title.text.trim();

    // Remove extra whitespace
    title = title.replace(/\s+/g, ' ');

    // Limit to 60 characters for professional presentation
    if (title.length > 60) {
      title = title.substring(0, 57).trim() + "...";
      logger.info("Title truncated for optimal presentation", { originalLength: spec.content.title.text.length });
    }

    spec.content.title.text = title;
  }

  // Enhance subtitle quality
  if (spec.content?.subtitle?.text) {
    let subtitle = spec.content.subtitle.text.trim();

    // Remove extra whitespace
    subtitle = subtitle.replace(/\s+/g, ' ');

    // Limit to 100 characters for professional presentation
    if (subtitle.length > 100) {
      subtitle = subtitle.substring(0, 97).trim() + "...";
      logger.info("Subtitle truncated for optimal presentation", { originalLength: spec.content.subtitle.text.length });
    }

    spec.content.subtitle.text = subtitle;
  }

  // Ensure all content has IDs
  if (spec.content?.title && !spec.content.title.id) {
    spec.content.title.id = "title";
  }
  if (spec.content?.subtitle && !spec.content.subtitle.id) {
    spec.content.subtitle.id = "subtitle";
  }
  if (spec.content?.bullets) {
    spec.content.bullets.forEach((b: any, i: number) => {
      if (!b.id) b.id = `bullets_${i}`;
    });
  }
  if (spec.content?.callouts) {
    spec.content.callouts.forEach((c: any, i: number) => {
      if (!c.id) c.id = `callout_${i}`;
    });
  }
  if (spec.content?.dataViz && !spec.content.dataViz.id) {
    spec.content.dataViz.id = "dataviz";
  }

  // Split concatenated bullet points (e.g., timeline events)
  if (spec.content?.bullets) {
    spec.content.bullets = spec.content.bullets.map((bulletGroup: any) =>
      splitConcatenatedBullets(bulletGroup)
    );
  }

  // Validate and fix bullet points (max 5 total for professional presentation)
  if (spec.content?.bullets) {
    const bulletValidation = validateBulletCount(spec.content.bullets, 5);
    if (!bulletValidation.valid) {
      logger.warn("⚠️ Bullet count exceeds limit", bulletValidation);
      spec.content.bullets.forEach((bulletGroup: any) => {
        if (bulletGroup.items && bulletGroup.items.length > 5) {
          bulletGroup.items = bulletGroup.items.slice(0, 5);
        }
      });
    }

    // Enhance bullet text quality - ensure conciseness
    spec.content.bullets.forEach((bulletGroup: any) => {
      if (bulletGroup.items) {
        bulletGroup.items.forEach((item: any) => {
          if (item.text) {
            let text = item.text.trim();

            // Remove extra whitespace
            text = text.replace(/\s+/g, ' ');

            // Limit bullet text to 80 characters for readability
            if (text.length > 80) {
              text = text.substring(0, 77).trim() + "...";
              logger.info("Bullet text truncated for optimal readability", { originalLength: item.text.length });
            }

            item.text = text;
          }
        });
      }
    });
  }

  // Validate and fix chart data
  if (spec.content?.dataViz) {
    const vizValidation = validateDataVizSeries(spec.content.dataViz);
    if (!vizValidation.valid) {
      logger.warn("⚠️ DataViz validation failed", vizValidation);
      const viz = spec.content.dataViz;
      if (viz.labels && viz.series) {
        const labelCount = viz.labels.length;
        viz.series.forEach((s: any) => {
          if (s.values.length !== labelCount) {
            if (s.values.length < labelCount) {
              s.values = [...s.values, ...Array(labelCount - s.values.length).fill(0)];
            } else {
              s.values = s.values.slice(0, labelCount);
            }
          }
        });
      }
    }
  }

  // Ensure color palette is valid and WCAG AAA compliant (7:1 minimum)
  if (spec.styleTokens?.palette) {
    const palette = spec.styleTokens.palette;
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;

    // Validate and fix primary color
    if (!palette.primary || !hexPattern.test(palette.primary)) {
      palette.primary = "#1E40AF"; // Professional blue
      logger.info("Primary color corrected to professional blue");
    }

    // Validate and fix accent color
    if (!palette.accent || !hexPattern.test(palette.accent)) {
      palette.accent = "#F59E0B"; // Warm amber
      logger.info("Accent color corrected to warm amber");
    }

    // Ensure neutral palette - exactly 9 colors from dark to light
    const defaultNeutral = [
      "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
      "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC"
    ];

    if (!palette.neutral || palette.neutral.length < 9) {
      palette.neutral = defaultNeutral;
      logger.info("Neutral palette set to default 9-color scale");
    } else {
      // Filter out null/undefined values and ensure all are valid hex
      const filtered = (palette.neutral as (string | null | undefined)[])
        .filter((color): color is string => color != null && typeof color === 'string' && hexPattern.test(color))
        .slice(0, 9);

      // If we filtered out too many, use defaults
      if (filtered.length < 9) {
        palette.neutral = defaultNeutral;
        logger.info("Neutral palette reset to default due to invalid colors");
      } else {
        palette.neutral = filtered;
      }
    }

    // Validate contrast - WCAG AAA compliant (7:1 minimum)
    const textColor = palette.neutral[0] || "#0F172A";
    const bgColor = palette.neutral[palette.neutral.length - 1] || "#F8FAFC";
    const contrast = ensureContrast(textColor, bgColor, 7);

    if (!contrast.compliant) {
      logger.warn("⚠️ Contrast ratio below WCAG AAA (7:1)", { ratio: contrast.ratio.toFixed(2) });
      // Adjust to ensure compliance
      palette.neutral[0] = "#000000"; // Use pure black for text
      palette.neutral[palette.neutral.length - 1] = "#FFFFFF"; // Use pure white for background
      logger.info("Contrast adjusted to pure black/white for WCAG AAA compliance");
    }

    // Validate primary/accent contrast
    const primaryAccentContrast = ensureContrast(palette.primary, palette.accent, 3);
    if (!primaryAccentContrast.compliant) {
      logger.warn("⚠️ Primary/accent contrast below 3:1", { ratio: primaryAccentContrast.ratio.toFixed(2) });
      // Adjust accent if needed
      palette.accent = "#F59E0B"; // Use warm amber as fallback
    }
  }

  // Fix layout issues
  spec = fixLayoutIssues(spec);

  logger.info("✅ Spec enhancement complete");
  return spec;
}

/**
 * Fix common layout issues in generated specs
 */
function fixLayoutIssues(spec: any): any {
  logger.info("fixLayoutIssues called", {
    hasLayout: !!spec.layout,
    hasRegions: !!spec.layout?.regions,
    hasAnchors: !!spec.layout?.anchors,
    hasTitle: !!spec.content?.title?.text,
    hasSubtitle: !!spec.content?.subtitle?.text
  });

  if (!spec.layout?.regions || !spec.layout?.anchors) {
    logger.warn("No layout regions or anchors found");
    return spec;
  }

  const hasSubtitle = !!spec.content?.subtitle?.text;
  const hasTitle = !!spec.content?.title?.text;

  // Find header region
  const headerRegion = spec.layout.regions.find((r: any) => r.name === "header");

  logger.info("Header region check", {
    headerRegionExists: !!headerRegion,
    headerRowSpan: headerRegion?.rowSpan,
    hasTitle,
    hasSubtitle
  });

  if (headerRegion && hasTitle && hasSubtitle) {
    // If header has both title and subtitle but only 1 row, expand it to 2 rows
    if (headerRegion.rowSpan === 1) {
      logger.info("Expanding header region from 1 to 2 rows for title + subtitle");
      headerRegion.rowSpan = 2;

      // Adjust body region if it exists
      const bodyRegion = spec.layout.regions.find((r: any) => r.name === "body");
      if (bodyRegion && bodyRegion.rowStart === 2) {
        logger.info("Adjusting body region");
        bodyRegion.rowStart = 3;
        bodyRegion.rowSpan = Math.max(1, bodyRegion.rowSpan - 1);
      }

      // Adjust aside region if it exists
      const asideRegion = spec.layout.regions.find((r: any) => r.name === "aside");
      if (asideRegion && asideRegion.rowStart === 2) {
        logger.info("Adjusting aside region");
        asideRegion.rowStart = 3;
        asideRegion.rowSpan = Math.max(1, asideRegion.rowSpan - 1);
      }
    }
  }

  // Validate all anchors have corresponding regions
  const regionNames = new Set(spec.layout.regions.map((r: any) => r.name));
  spec.layout.anchors = spec.layout.anchors.filter((a: any) => {
    if (!regionNames.has(a.region)) {
      logger.warn(`Removing anchor ${a.refId} with non-existent region ${a.region}`);
      return false;
    }
    return true;
  });

  return spec;
}

