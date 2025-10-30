/**
 * Slide Spec Rules Enforcement Module
 * ====================================
 * Enforces strict content rules on generated specs (deterministic, no AI calls).
 * Ensures compliance with design system and content guidelines.
 */

import { type SlideSpecV1 } from "@plzfixthx/slide-spec";
import {
  STANDARD_GRID,
  EXECUTIVE_MARGINS,
  TYPOGRAPHY_SCALE,
  FONT_FAMILIES,
} from "../designSystem";

/* -------------------------------------------------------------------------- */
/*                            Rule Enforcement                                */
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
      rows: STANDARD_GRID.rows,
      cols: STANDARD_GRID.cols,
      gutter: STANDARD_GRID.gutter * 96,
      margin: {
        t: EXECUTIVE_MARGINS.top * 96,
        r: EXECUTIVE_MARGINS.right * 96,
        b: EXECUTIVE_MARGINS.bottom * 96,
        l: EXECUTIVE_MARGINS.left * 96,
      },
    };

    // Enforce region bounds to fit within 8-row grid
    if (enforced.layout.regions && Array.isArray(enforced.layout.regions)) {
      enforced.layout.regions = enforced.layout.regions.map((region: any) => {
        const maxRow = STANDARD_GRID.rows;
        const maxCol = STANDARD_GRID.cols;

        const rowStart = Math.max(1, Math.min(region.rowStart, maxRow));
        const colStart = Math.max(1, Math.min(region.colStart, maxCol));
        const maxRowSpan = maxRow - rowStart + 1;
        const rowSpan = Math.max(1, Math.min(region.rowSpan, maxRowSpan));
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
        "step_-2": TYPOGRAPHY_SCALE.caption,
        "step_-1": 14,
        step_0: TYPOGRAPHY_SCALE.body,
        step_1: 20,
        step_2: TYPOGRAPHY_SCALE.h2,
        step_3: TYPOGRAPHY_SCALE.display,
      },
      weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeights: { compact: 1.2, standard: 1.5 },
    };
  } else {
    enforced.styleTokens.typography.fonts = { sans: FONT_FAMILIES.primary };
    enforced.styleTokens.typography.sizes = {
      "step_-2": TYPOGRAPHY_SCALE.caption,
      "step_-1": 14,
      step_0: TYPOGRAPHY_SCALE.body,
      step_1: 20,
      step_2: TYPOGRAPHY_SCALE.h2,
      step_3: TYPOGRAPHY_SCALE.display,
    };
  }

  return enforced;
}

