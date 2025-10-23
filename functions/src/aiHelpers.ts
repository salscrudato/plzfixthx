import * as logger from "firebase-functions/logger";
import { fetch as undiciFetch } from "undici";
import { z } from "zod";
import { ENHANCED_SYSTEM_PROMPT } from "./prompts";

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

/** Call OpenAI-compatible API with retry logic */
export async function callAIWithRetry(
  prompt: string,
  apiKey: string,
  baseUrl: string,
  model: string,
  schema: z.ZodType
): Promise<unknown> {
  return retryWithBackoff(async () => {
    const response = await undiciFetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: ENHANCED_SYSTEM_PROMPT },
          { role: "user", content: `User prompt:\n<<<${prompt}>>>` }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error ${response.status}: ${errorText}`);
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      throw new Error(`Failed to parse AI response as JSON: ${e}`);
    }

    const validationResult = schema.safeParse(parsed);
    if (!validationResult.success) {
      const errorDetails = validationResult.error.issues.map((issue: any) =>
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ');

      logger.error("Schema validation failed", {
        errors: validationResult.error.issues,
        errorDetails,
        aiResponse: JSON.stringify(parsed, null, 2)
      });
      throw new Error(`Schema validation failed: ${errorDetails}`);
    }

    logger.info("Schema validation successful");

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

  if (trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }

  return trimmed;
}

/** Check for inappropriate content (basic filter) */
export function moderateContent(prompt: string): { safe: boolean; reason?: string } {
  const lowerPrompt = prompt.toLowerCase();
  
  // Basic inappropriate content detection
  const inappropriatePatterns = [
    /\b(hack|exploit|vulnerability|inject|xss|sql\s*injection)\b/i,
    /\b(porn|xxx|nsfw|explicit)\b/i,
    /\b(violence|weapon|bomb|terror)\b/i
  ];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(lowerPrompt)) {
      return {
        safe: false,
        reason: "Content may contain inappropriate or unsafe material"
      };
    }
  }

  return { safe: true };
}

/** Post-process and enhance AI-generated slide spec */
export function enhanceSlideSpec(spec: any): any {
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

  // Limit bullet points to 6 total
  if (spec.content?.bullets) {
    spec.content.bullets.forEach((bulletGroup: any) => {
      if (bulletGroup.items && bulletGroup.items.length > 6) {
        bulletGroup.items = bulletGroup.items.slice(0, 6);
      }
    });
  }

  // Validate chart data if present
  if (spec.content?.dataViz) {
    const viz = spec.content.dataViz;
    if (viz.labels && viz.series) {
      const labelCount = viz.labels.length;
      // Ensure all series have matching value counts
      viz.series.forEach((s: any) => {
        if (s.values.length !== labelCount) {
          // Pad or trim to match
          if (s.values.length < labelCount) {
            s.values = [...s.values, ...Array(labelCount - s.values.length).fill(0)];
          } else {
            s.values = s.values.slice(0, labelCount);
          }
        }
      });
    }
  }

  // Ensure color palette is valid
  if (spec.styleTokens?.palette) {
    const palette = spec.styleTokens.palette;
    // Validate hex colors
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    if (palette.primary && !hexPattern.test(palette.primary)) {
      palette.primary = "#6366F1"; // Default primary
    }
    if (palette.accent && !hexPattern.test(palette.accent)) {
      palette.accent = "#EC4899"; // Default accent
    }
  }

  // FIX LAYOUT ISSUES
  spec = fixLayoutIssues(spec);

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

