/**
 * Premium PPTX Builder
 * Creates world-class professional PowerPoint slides with sophisticated design
 * Combines best practices from Apple, Google, Tesla, and ChatGPT design systems
 */

import PptxGenJS from "pptxgenjs";
import type { SlideSpecV1 } from "../types/SlideSpecV1";
import { logger } from "firebase-functions/v2";
import {
  addAccentBar,
  addDecorativeCircle,
  addPremiumDivider,
  addCornerAccent,
  addMetricCard,
  addStatBlock,
  addFeatureHighlight,
  addGradientAccentBar,
  addProcessFlow,
  addArrow
} from "./premiumComponents";
import {
  addDirectionalArrow,
  addProgressBar,
  addStepIndicator,
  addHighlightBadge,
  addEmphasisBackground,
  addVerticalDivider,
  addHorizontalDivider
} from "./advancedShapes";
import {
  addChartHeader,
  addMetricHighlight,
  addTrendIndicator
} from "./enhancedDataViz";
import { applyDesignPattern, getRecommendedPattern } from "./advancedPatterns";
import {
  addGradientOverlay,
  addCornerFlourish,
  addLineAccent,
  addFrameAccent
} from "./designAccents";

const SLIDE_WIDTH = 10; // inches
const SLIDE_HEIGHT = 7.5; // inches (4:3 aspect ratio)

/**
 * Build a premium world-class slide
 */
export async function buildPremiumSlide(
  pptx: PptxGenJS,
  spec: SlideSpecV1
): Promise<void> {
  const slide = pptx.addSlide();

  try {
    // Apply sophisticated background
    applyPremiumBackground(slide, spec);

    // Determine and apply design pattern
    const pattern = getRecommendedPattern(spec);
    applyDesignPattern(slide, spec, pattern);

    // Add content with refined typography
    await addPremiumContent(slide, spec);
  } catch (error) {
    logger.error("Error building premium slide:", error);
    throw error;
  }
}

/**
 * Apply sophisticated gradient background with depth
 */
function applyPremiumBackground(slide: any, spec: SlideSpecV1): void {
  const palette = spec.styleTokens.palette;
  const primaryColor = palette.primary || "#6366F1";
  const accentColor = palette.accent || "#EC4899";
  const neutralLight = palette.neutral[6] || "#F8FAFC";

  // Base background - light neutral
  slide.background = { fill: neutralLight.replace("#", "") };

  // Add sophisticated gradient overlay
  addGradientOverlay(slide, primaryColor, accentColor, 0.03, "diagonal");

  // Add subtle corner flourishes for visual interest
  addCornerFlourish(slide, "top-right", accentColor, 0.35);
  addCornerFlourish(slide, "bottom-left", primaryColor, 0.3);

  // Add subtle line accents
  addLineAccent(slide, "top", accentColor, 0.06);
}



/**
 * Add premium content with refined typography
 */
async function addPremiumContent(slide: any, spec: SlideSpecV1): Promise<void> {
  const palette = spec.styleTokens.palette;
  const typography = spec.styleTokens.typography;

  const textColor = palette.neutral[0] || "#0F172A";
  const subtitleColor = palette.neutral[2] || "#64748B";
  const primaryColor = palette.primary || "#6366F1";

  const titleSize = typography?.sizes?.step_3 || 44;
  const subtitleSize = typography?.sizes?.step_1 || 22;
  const bodySize = typography?.sizes?.step_0 || 18;

  let currentY = 0.6;

  // Add title with premium styling
  if (spec.content.title) {
    slide.addText(spec.content.title.text, {
      x: 0.7,
      y: currentY,
      w: SLIDE_WIDTH - 1.4,
      h: 1.0,
      fontSize: titleSize,
      bold: true,
      color: textColor.replace("#", ""),
      fontFace: "Aptos",
      align: "left",
      valign: "top",
      lineSpacing: 110
    });

    // Premium divider under title
    addPremiumDivider(slide, 0.7, currentY + 0.95, 2.8, primaryColor.replace("#", ""), 0.05);
    currentY += 1.4;
  }

  // Add subtitle
  if (spec.content.subtitle) {
    slide.addText(spec.content.subtitle.text, {
      x: 0.7,
      y: currentY,
      w: SLIDE_WIDTH - 1.4,
      h: 0.6,
      fontSize: subtitleSize,
      color: subtitleColor.replace("#", ""),
      fontFace: "Aptos",
      align: "left",
      valign: "top",
      lineSpacing: 130
    });
    currentY += 0.9;
  }

  // Add bullets with premium styling
  if (spec.content.bullets && spec.content.bullets.length > 0) {
    const bullets = spec.content.bullets[0];
    const bulletColor = primaryColor.replace("#", "");

    bullets.items.forEach((item, index) => {
      // Add subtle background for emphasis
      if (index === 0) {
        addEmphasisBackground(slide, 0.6, currentY - 0.05, SLIDE_WIDTH - 1.2, 0.5, primaryColor, 0.04);
      }

      // Decorative bullet circle with step indicator for first few items
      if (index < 3) {
        addStepIndicator(slide, 0.65, currentY + 0.05, index + 1, bullets.items.length, bulletColor, 0.25);
      } else {
        addDecorativeCircle(slide, 0.65, currentY + 0.08, 0.14, bulletColor, 0.25);
      }

      // Bullet text
      slide.addText(item.text, {
        x: 0.95,
        y: currentY,
        w: SLIDE_WIDTH - 1.65,
        h: 0.4,
        fontSize: bodySize,
        color: textColor.replace("#", ""),
        fontFace: "Aptos",
        align: "left",
        valign: "top",
        wrap: true
      });

      currentY += 0.5;
    });
  }

  // Add callouts if present
  if (spec.content.callouts && spec.content.callouts.length > 0) {
    for (const callout of spec.content.callouts) {
      const bgColor = callout.variant === "warning" ? "FEF3C7" :
                      callout.variant === "danger" ? "FEE2E2" :
                      callout.variant === "success" ? "D1FAE5" : "F3F4F6";

      // Add subtle frame accent
      addFrameAccent(slide, 0.65, currentY - 0.05, SLIDE_WIDTH - 1.3, 0.7, primaryColor, 0.04);

      slide.addShape("roundRect", {
        x: 0.7,
        y: currentY,
        w: SLIDE_WIDTH - 1.4,
        h: 0.6,
        fill: { color: bgColor },
        line: { color: primaryColor.replace("#", ""), width: 2 }
      });

      const calloutText = callout.title ? `${callout.title} — ${callout.text}` : callout.text;
      slide.addText(calloutText, {
        x: 0.9,
        y: currentY + 0.1,
        w: SLIDE_WIDTH - 1.8,
        h: 0.4,
        fontSize: bodySize - 2,
        color: textColor.replace("#", ""),
        fontFace: "Aptos",
        align: "left",
        valign: "middle",
        wrap: true
      });

      currentY += 0.8;
    }
  }
}

