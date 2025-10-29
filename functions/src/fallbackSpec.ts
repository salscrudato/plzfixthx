/**
 * Fallback Spec Factory
 * Single source of truth for generating fallback SlideSpec when AI generation fails
 * 
 * Design Philosophy:
 * - Executive-grade: McKinsey/BCG-inspired MECE structure (Situation-Complication-Resolution)
 * - Professional typography: Aptos font family, modular scale
 * - Accessible: WCAG AAA contrast ratios, semantic structure
 * - Consistent: Same tokens, layout, and styling across all fallbacks
 */

import * as logger from "firebase-functions/logger";
import type { SlideSpec } from "@plzfixthx/slide-spec";
import { DEFAULT_NEUTRAL_9, DEFAULT_TYPOGRAPHY } from "@plzfixthx/slide-spec";
import {
  STANDARD_GRID,
  EXECUTIVE_MARGINS,
  TYPOGRAPHY_SCALE,
  FONT_FAMILIES,
  BASELINE_RHYTHM,
} from "./designSystem";

/**
 * Extract action verb from prompt for professional title
 */
function ensureActionVerb(text: string): string {
  const actionVerbs = [
    "Analyze", "Assess", "Build", "Create", "Define", "Deliver", "Design",
    "Develop", "Drive", "Enable", "Enhance", "Establish", "Evaluate", "Execute",
    "Expand", "Explore", "Identify", "Implement", "Improve", "Increase", "Launch",
    "Lead", "Manage", "Optimize", "Plan", "Present", "Prioritize", "Propose",
    "Recommend", "Review", "Scale", "Streamline", "Strengthen", "Transform",
  ];

  const words = text.trim().split(/\s+/);
  const firstWord = words[0];

  // Check if first word is already an action verb
  if (actionVerbs.some(v => firstWord?.toLowerCase() === v.toLowerCase())) {
    return text;
  }

  // Prepend a contextual action verb
  const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
  return `${verb} ${text}`;
}

/**
 * Generate a professional fallback SlideSpec
 * 
 * This is the SINGLE SOURCE OF TRUTH for fallback specs.
 * All other fallback generation should use this function.
 * 
 * @param prompt - User's original prompt (used for context)
 * @param requestId - Request ID for logging/tracing
 * @returns A valid, professional SlideSpec
 */
export function createFallbackSpec(prompt: string, requestId?: string): SlideSpec {
  if (requestId) {
    logger.warn("Generating fallback spec", { requestId, prompt: prompt.slice(0, 100) });
  }

  // Extract keywords for title
  const keywords = prompt?.trim() 
    ? prompt.split(/\s+/).slice(0, 8).join(" ")
    : "Strategic Overview";
  
  const title = ensureActionVerb(keywords);

  return {
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Executive",
      aspectRatio: "16:9",
    },
    design: {
      pattern: "minimal",
      whitespace: { strategy: "balanced", breathingRoom: 0.35 },
    },
    content: {
      title: { 
        id: "title", 
        text: title,
      },
      subtitle: { 
        id: "subtitle", 
        text: "Key Insights and Recommendations",
      },
      bullets: [
        {
          id: "b1",
          items: [
            { text: "Situation: Analyze current state and context", level: 1 },
            { text: "Complication: Identify key challenges and gaps", level: 1 },
            { text: "Resolution: Propose actionable next steps", level: 1 },
          ],
        },
      ],
      callouts: [
        { 
          id: "c1", 
          variant: "note", 
          text: "AI generation fallback - refine your prompt for better results",
        },
      ],
    },
    layout: {
      grid: {
        rows: STANDARD_GRID.rows, // Use design system grid (8 rows)
        cols: STANDARD_GRID.cols, // Use design system grid (12 cols)
        gutter: STANDARD_GRID.gutter * 96, // Convert inches to pixels (0.125in * 96dpi = 12px)
        margin: {
          t: EXECUTIVE_MARGINS.top * 96, // Convert inches to pixels (0.6in * 96dpi = 57.6px)
          r: EXECUTIVE_MARGINS.right * 96, // Convert inches to pixels (0.9in * 96dpi = 86.4px)
          b: EXECUTIVE_MARGINS.bottom * 96, // Convert inches to pixels (0.6in * 96dpi = 57.6px)
          l: EXECUTIVE_MARGINS.left * 96, // Convert inches to pixels (0.9in * 96dpi = 86.4px)
        },
      },
      regions: [
        { name: "header", rowStart: 1, colStart: 1, rowSpan: 3, colSpan: 12 }, // Increased to 3 rows for better spacing
        { name: "body", rowStart: 4, colStart: 1, rowSpan: 4, colSpan: 8 }, // Adjusted to start at row 4
        { name: "aside", rowStart: 4, colStart: 9, rowSpan: 4, colSpan: 4 }, // Adjusted to start at row 4
      ],
      anchors: [
        { refId: "title", region: "header", order: 0 },
        { refId: "subtitle", region: "header", order: 1 },
        { refId: "b1", region: "body", order: 0 },
        { refId: "c1", region: "aside", order: 0 },
      ],
    },
    styleTokens: {
      palette: {
        primary: "#005EB8", // McKinsey blue - professional, trustworthy
        accent: "#F3C13A", // McKinsey gold - premium accent
        neutral: [...DEFAULT_NEUTRAL_9], // Guaranteed 9-step neutral ramp
      },
      typography: {
        ...DEFAULT_TYPOGRAPHY,
        fonts: { sans: FONT_FAMILIES.primary }, // Use design system font
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
      },
      spacing: {
        base: BASELINE_RHYTHM * 96, // Convert inches to pixels (0.125in * 96dpi = 12px)
        steps: [0, 4, 8, 12, 16, 24, 32, 48, 64]
      },
      radii: { sm: 4, md: 8, lg: 16 },
      shadows: {
        sm: "0 2px 4px rgba(0,0,0,.08)",
        md: "0 4px 12px rgba(0,0,0,.12)",
        lg: "0 12px 32px rgba(0,0,0,.16)",
      },
      contrast: { minTextContrast: 7, minUiContrast: 4.5 }, // WCAG AAA
    },
  };
}

/**
 * Validate that a spec has all required fields
 * Used to ensure fallback specs are always valid
 */
export function validateFallbackSpec(spec: SlideSpec): boolean {
  try {
    // Check required top-level fields
    if (!spec.meta || !spec.content || !spec.layout || !spec.styleTokens) {
      return false;
    }

    // Check meta
    if (!spec.meta.version || !spec.meta.locale || !spec.meta.theme || !spec.meta.aspectRatio) {
      return false;
    }

    // Check content has at least title
    if (!spec.content.title || !spec.content.title.text) {
      return false;
    }

    // Check layout has grid and regions
    if (!spec.layout.grid || !spec.layout.regions || spec.layout.regions.length === 0) {
      return false;
    }

    // Check styleTokens has palette
    if (!spec.styleTokens.palette || !spec.styleTokens.palette.primary) {
      return false;
    }

    // Check neutral palette has exactly 9 colors
    if (!Array.isArray(spec.styleTokens.palette.neutral) || 
        spec.styleTokens.palette.neutral.length !== 9) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

