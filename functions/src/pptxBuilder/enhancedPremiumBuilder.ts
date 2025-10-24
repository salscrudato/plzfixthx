/**
 * Enhanced Premium Builder
 * Implements world-class professional slide generation
 * Integrates professional design system with sophisticated styling
 */

import PptxGenJS from "pptxgenjs";
import type { SlideSpecV1 } from "../types/SlideSpecV1";
import { logger } from "firebase-functions/v2";
import {
  applyProfessionalGradient,
  addProfessionalAccentBar,
  addProfessionalCornerFlourish,
  addPremiumDividerLine,
  getProfessionalPalette,
  getOptimalWhitespace,
  type GradientConfig,
  type AccentConfig
} from "./professionalDesignSystem";

const SLIDE_WIDTH = 10; // inches
const SLIDE_HEIGHT = 7.5; // inches

/**
 * Build an enhanced premium world-class slide
 */
export async function buildEnhancedPremiumSlide(
  pptx: PptxGenJS,
  spec: SlideSpecV1
): Promise<void> {
  const slide = pptx.addSlide();

  try {
    logger.info("Building enhanced premium slide", {
      theme: spec.meta.theme,
      aspectRatio: spec.meta.aspectRatio
    });

    // Apply professional background with gradient
    applyEnhancedBackground(slide, spec);

    // Add professional accents
    addProfessionalAccents(slide, spec);

    // Add content with refined typography
    await addEnhancedContent(slide, spec);

    logger.info("Enhanced premium slide built successfully");
  } catch (error) {
    logger.error("Error building enhanced premium slide:", error);
    throw error;
  }
}

/**
 * Apply enhanced background with sophisticated gradient
 */
function applyEnhancedBackground(slide: any, spec: SlideSpecV1): void {
  const palette = spec.styleTokens.palette;
  const primaryColor = palette.primary || "#1E40AF";
  const accentColor = palette.accent || "#06B6D4";
  const neutralLight = palette.neutral[6] || "#F8FAFC";

  // Set base background
  slide.background = { fill: neutralLight.replace("#", "") };

  // Apply subtle gradient overlay
  const gradientConfig: GradientConfig = {
    type: "diagonal",
    startColor: primaryColor,
    endColor: accentColor,
    opacity: 0.05 // Very subtle
  };

  applyProfessionalGradient(slide, gradientConfig);
}

/**
 * Add professional accents to slide
 */
function addProfessionalAccents(slide: any, spec: SlideSpecV1): void {
  const palette = spec.styleTokens.palette;
  const primaryColor = palette.primary || "#1E40AF";
  const accentColor = palette.accent || "#06B6D4";

  // Add left accent bar
  const accentBarConfig: AccentConfig = {
    position: "left",
    width: 0.1, // inches
    color: primaryColor,
    opacity: 1
  };

  addProfessionalAccentBar(slide, accentBarConfig);

  // Add corner flourishes
  addProfessionalCornerFlourish(slide, "top-right", accentColor, 0.08);
  addProfessionalCornerFlourish(slide, "bottom-left", primaryColor, 0.06);

  // Add premium divider under title area
  addPremiumDividerLine(slide, 0.44, 1.2, 2.5, primaryColor, 0.04);
}

/**
 * Add enhanced content with refined typography
 */
async function addEnhancedContent(slide: any, spec: SlideSpecV1): Promise<void> {
  const palette = spec.styleTokens.palette;
  const typography = spec.styleTokens.typography;
  const primaryColor = palette.primary || "#1E40AF";
  const neutralDark = palette.neutral[0] || "#0F172A";
  const neutralMid = palette.neutral[3] || "#64748B";

  // Add title
  if (spec.content.title) {
    slide.addText(spec.content.title.text, {
      x: 0.44,
      y: 0.44,
      w: 9.12,
      h: 1.2,
      fontSize: 44,
      bold: true,
      color: neutralDark,
      fontFace: "Aptos, Arial, sans-serif",
      align: "left",
      valign: "top",
      lineSpacing: 32
    });
  }

  // Add subtitle
  if (spec.content.subtitle) {
    slide.addText(spec.content.subtitle.text, {
      x: 0.44,
      y: 1.8,
      w: 9.12,
      h: 0.6,
      fontSize: 20,
      color: neutralMid,
      fontFace: "Aptos, Arial, sans-serif",
      align: "left",
      valign: "top"
    });
  }

  // Add bullets
  if (spec.content.bullets && spec.content.bullets.length > 0) {
    let yPos = 2.8;
    const bulletGroup = spec.content.bullets[0];

    for (const bullet of bulletGroup.items) {
      // Bullet point
      slide.addShape("ellipse", {
        x: 0.44,
        y: yPos + 0.15,
        w: 0.12,
        h: 0.12,
        fill: { color: primaryColor },
        line: { type: "none" }
      });

      // Bullet text
      slide.addText(bullet.text, {
        x: 0.7,
        y: yPos,
        w: 8.86,
        h: 0.4,
        fontSize: 16,
        color: neutralDark,
        fontFace: "Aptos, Arial, sans-serif",
        align: "left",
        valign: "top"
      });

      yPos += 0.6;
    }
  }

  // Add callouts if present
  if (spec.content.callouts && spec.content.callouts.length > 0) {
    addEnhancedCallouts(slide, spec);
  }
}

/**
 * Add enhanced callouts with professional styling
 */
function addEnhancedCallouts(slide: any, spec: SlideSpecV1): void {
  const palette = spec.styleTokens.palette;
  const accentColor = palette.accent || "#06B6D4";
  const neutralLight = palette.neutral[6] || "#F8FAFC";

  const callouts = spec.content.callouts || [];
  let yPos = 5.5;

  for (const callout of callouts) {
    // Callout background
    slide.addShape("roundRect", {
      x: 0.44,
      y: yPos,
      w: 9.12,
      h: 0.8,
      fill: { color: neutralLight },
      line: { color: accentColor, width: 2 },
      rectRadius: 0.1
    });

    // Callout text
    slide.addText(callout.text, {
      x: 0.64,
      y: yPos + 0.15,
      w: 8.72,
      h: 0.5,
      fontSize: 14,
      color: palette.primary,
      fontFace: "Aptos, Arial, sans-serif",
      align: "left",
      valign: "middle"
    });

    yPos += 1.0;
  }
}

/**
 * Validate enhanced slide specification
 */
export function validateEnhancedSlideSpec(spec: SlideSpecV1): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate required fields
  if (!spec.content.title || !spec.content.title.text) {
    errors.push("Title is required");
  }

  if (!spec.styleTokens.palette.primary) {
    errors.push("Primary color is required");
  }

  if (!spec.styleTokens.palette.accent) {
    errors.push("Accent color is required");
  }

  if (!spec.styleTokens.palette.neutral || spec.styleTokens.palette.neutral.length < 7) {
    errors.push("Neutral palette must have at least 7 colors");
  }

  // Validate color format
  const colorRegex = /^#[0-9A-F]{6}$/i;
  if (!colorRegex.test(spec.styleTokens.palette.primary)) {
    errors.push("Primary color must be valid hex format");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

