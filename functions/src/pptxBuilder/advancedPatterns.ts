/**
 * Advanced Design Patterns for Professional Slides
 * Implements hero, split, asymmetric, grid, minimal, and data-focused layouts
 */

import PptxGenJS from "pptxgenjs";
import type { SlideSpecV1 } from "../types/SlideSpecV1";
import {
  addAccentBar,
  addDecorativeCircle,
  addPremiumDivider,
  addCornerAccent,
  addStatBlock,
  addFeatureHighlight,
  addArrow
} from "./premiumComponents";

const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 7.5;

export type DesignPattern = "hero" | "split" | "asymmetric" | "grid" | "minimal" | "data-focused";

/**
 * Apply design pattern to slide
 */
export function applyDesignPattern(
  slide: any,
  spec: SlideSpecV1,
  pattern: DesignPattern
): void {
  const palette = spec.styleTokens.palette;
  const primaryColor = palette.primary.replace("#", "");
  const accentColor = palette.accent.replace("#", "");

  switch (pattern) {
    case "hero":
      applyHeroPattern(slide, spec, primaryColor, accentColor);
      break;
    case "split":
      applySplitPattern(slide, spec, primaryColor, accentColor);
      break;
    case "asymmetric":
      applyAsymmetricPattern(slide, spec, primaryColor, accentColor);
      break;
    case "grid":
      applyGridPattern(slide, spec, primaryColor, accentColor);
      break;
    case "minimal":
      applyMinimalPattern(slide, spec, primaryColor, accentColor);
      break;
    case "data-focused":
      applyDataFocusedPattern(slide, spec, primaryColor, accentColor);
      break;
  }
}

/**
 * Hero Pattern: Large title/image (55-65% of slide), minimal supporting text
 * Best for: Executive summaries, product reveals, keynote slides
 */
function applyHeroPattern(slide: any, spec: SlideSpecV1, primaryColor: string, accentColor: string): void {
  // Large accent bar on left
  addAccentBar(slide, {
    position: "left",
    color: primaryColor,
    thickness: 0.15
  });

  // Top accent bar
  addAccentBar(slide, {
    position: "top",
    color: accentColor,
    thickness: 0.06
  });

  // Large decorative circles for visual interest
  addDecorativeCircle(slide, 8.0, 6.0, 1.2, primaryColor, 0.08);
  addDecorativeCircle(slide, 9.0, 7.0, 0.8, accentColor, 0.1);

  // Corner accents
  addCornerAccent(slide, "top-right", accentColor, 0.25);
  addCornerAccent(slide, "bottom-left", primaryColor, 0.2);
}

/**
 * Split Pattern: 50/50 content division with clear visual separation
 * Best for: Comparisons, pros/cons, two-part stories
 */
function applySplitPattern(slide: any, spec: SlideSpecV1, primaryColor: string, accentColor: string): void {
  // Vertical divider in center
  slide.addShape("rect", {
    x: SLIDE_WIDTH / 2 - 0.05,
    y: 0.5,
    w: 0.1,
    h: SLIDE_HEIGHT - 1,
    fill: { color: primaryColor, transparency: 80 },
    line: { type: "none" }
  });

  // Left accent bar
  addAccentBar(slide, {
    position: "left",
    color: primaryColor,
    thickness: 0.08
  });

  // Right accent bar
  addAccentBar(slide, {
    position: "right",
    color: accentColor,
    thickness: 0.08
  });

  // Corner accents
  addCornerAccent(slide, "top-left", primaryColor, 0.15);
  addCornerAccent(slide, "bottom-right", accentColor, 0.15);
}

/**
 * Asymmetric Pattern: Dynamic off-center layout with visual tension
 * Best for: Creative industries, feature highlights, modern tech
 */
function applyAsymmetricPattern(slide: any, spec: SlideSpecV1, primaryColor: string, accentColor: string): void {
  // Diagonal accent bar
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_WIDTH,
    h: 0.08,
    fill: { color: primaryColor },
    line: { type: "none" }
  });

  // Asymmetric accent shapes
  addDecorativeCircle(slide, 7.5, 1.0, 1.5, accentColor, 0.1);
  addDecorativeCircle(slide, 0.5, 5.5, 1.0, primaryColor, 0.08);

  // Corner accent
  addCornerAccent(slide, "top-right", accentColor, 0.3);
}

/**
 * Grid Pattern: Structured multi-element layout (2x2, 3x3, etc.)
 * Best for: Portfolio items, process steps, multiple metrics
 */
function applyGridPattern(slide: any, spec: SlideSpecV1, primaryColor: string, accentColor: string): void {
  // Top accent bar
  addAccentBar(slide, {
    position: "top",
    color: primaryColor,
    thickness: 0.08
  });

  // Left accent bar
  addAccentBar(slide, {
    position: "left",
    color: accentColor,
    thickness: 0.08
  });

  // Grid lines (subtle)
  const gridColor = primaryColor;
  slide.addShape("rect", {
    x: SLIDE_WIDTH / 2 - 0.02,
    y: 1.0,
    w: 0.04,
    h: SLIDE_HEIGHT - 1.5,
    fill: { color: gridColor, transparency: 90 },
    line: { type: "none" }
  });

  slide.addShape("rect", {
    x: 0.5,
    y: SLIDE_HEIGHT / 2 - 0.02,
    w: SLIDE_WIDTH - 1,
    h: 0.04,
    fill: { color: gridColor, transparency: 90 },
    line: { type: "none" }
  });

  // Corner accents
  addCornerAccent(slide, "top-right", accentColor, 0.15);
  addCornerAccent(slide, "bottom-left", primaryColor, 0.15);
}

/**
 * Minimal Pattern: Maximum white space (40%+), essential content only
 * Best for: Quotes, key takeaways, luxury/premium positioning
 */
function applyMinimalPattern(slide: any, spec: SlideSpecV1, primaryColor: string, accentColor: string): void {
  // Subtle top accent bar
  addAccentBar(slide, {
    position: "top",
    color: primaryColor,
    thickness: 0.04
  });

  // Single corner accent for sophistication
  addCornerAccent(slide, "bottom-right", accentColor, 0.12);

  // Minimal decorative element
  addDecorativeCircle(slide, 0.3, 0.4, 0.4, primaryColor, 0.05);
}

/**
 * Data-Focused Pattern: Chart as primary (55-70%), supporting text sidebar
 * Best for: Analytics, financial reports, data-driven insights
 */
function applyDataFocusedPattern(slide: any, spec: SlideSpecV1, primaryColor: string, accentColor: string): void {
  // Left accent bar - strong visual anchor
  addAccentBar(slide, {
    position: "left",
    color: primaryColor,
    thickness: 0.12
  });

  // Top accent bar
  addAccentBar(slide, {
    position: "top",
    color: accentColor,
    thickness: 0.05
  });

  // Vertical divider between chart and sidebar
  slide.addShape("rect", {
    x: 6.8,
    y: 1.0,
    w: 0.08,
    h: SLIDE_HEIGHT - 1.5,
    fill: { color: primaryColor, transparency: 85 },
    line: { type: "none" }
  });

  // Corner accents
  addCornerAccent(slide, "top-right", accentColor, 0.2);
  addCornerAccent(slide, "bottom-left", primaryColor, 0.15);

  // Decorative elements
  addDecorativeCircle(slide, 8.5, 6.5, 0.7, accentColor, 0.08);
}

/**
 * Get recommended pattern based on content type
 */
export function getRecommendedPattern(spec: SlideSpecV1): DesignPattern {
  const content = spec.content;

  // If has chart, use data-focused
  if (content.dataViz) {
    return "data-focused";
  }

  // If has multiple callouts, use grid
  if (content.callouts && content.callouts.length > 2) {
    return "grid";
  }

  // If has many bullets, use split
  if (content.bullets && content.bullets[0]?.items.length > 4) {
    return "split";
  }

  // If short content, use minimal
  const totalWords = (content.title?.text || "").split(" ").length +
                     (content.subtitle?.text || "").split(" ").length +
                     (content.bullets?.[0]?.items || []).reduce((sum, item) => sum + item.text.split(" ").length, 0);

  if (totalWords < 30) {
    return "minimal";
  }

  // Default to split
  return "split";
}

