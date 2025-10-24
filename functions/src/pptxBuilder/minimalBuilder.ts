/**
 * Professional PPTX Builder
 * Creates beautiful, professional PowerPoint slides with subtle accents, shapes, and modern design
 */

import PptxGenJS from "pptxgenjs";
import type { SlideSpecV1 } from "../types/SlideSpecV1";
import { processImageSource, getOptimalImageDimensions } from "../imageHelpers";
import { logger } from "firebase-functions/v2";
import {
  addAccentBar,
  addDecorativeCircle,
  addPremiumDivider,
  addCornerAccent
} from "./premiumComponents";
import {
  getSlideDimsFromSpec,
  ensureContrast,
  validateBulletCount,
  calculateTextHeight
} from "./dimensionHelpers";
import { generateBackgroundForSlide, svgToPngDataUrl } from "../svgGenerator";

/**
 * Build a professional slide with beautiful design elements
 */
export async function buildMinimalSlide(
  pptx: PptxGenJS,
  spec: SlideSpecV1
): Promise<void> {
  const slide = pptx.addSlide();

  // Get slide dimensions
  const dims = getSlideDimsFromSpec(spec);
  const padding = 0.5;
  const contentWidth = dims.wIn - (padding * 2);

  // Apply subtle gradient background for modern, professional look (with SVG or fallback)
  await applyGradientBackground(slide, spec);

  // Add professional design accents
  addProfessionalAccents(slide, spec);

  // Get style tokens
  const palette = spec.styleTokens.palette;
  const typography = spec.styleTokens.typography;
  const textColor = palette.neutral[0] || "#0F172A";
  const subtitleColor = palette.neutral[2] || "#64748B";
  const primaryColor = palette.primary || "#6366F1";

  const titleSize = typography?.sizes?.step_3 || 32;
  const subtitleSize = typography?.sizes?.step_1 || 18;

  // Ensure contrast
  const titleContrast = ensureContrast(textColor, "#FFFFFF");
  const titleColor = titleContrast.compliant ? textColor : "#000000";

  const subtitleContrast = ensureContrast(subtitleColor, "#FFFFFF");
  const subColor = subtitleContrast.compliant ? subtitleColor : "#666666";

  let currentY = 0.5;

  // Add title with enhanced styling
  const title = spec.content.title;
  if (title && title.text) {
    const titleHeight = calculateTextHeight(title.text, contentWidth, titleSize);

    slide.addText(title.text, {
      x: padding,
      y: currentY,
      w: contentWidth,
      h: titleHeight,
      fontFace: typography?.fonts?.sans || "Aptos",
      fontSize: titleSize,
      bold: true,
      color: titleColor.replace("#", ""),
      align: "left",
      valign: "top"
    });

    // Add subtle accent line under title
    addPremiumDivider(slide, padding, currentY + titleHeight + 0.1, 2.5, primaryColor.replace("#", ""), 0.04);
    currentY += titleHeight + 0.25;
  }

  // Add subtitle with refined styling
  const subtitle = spec.content.subtitle;
  if (subtitle && subtitle.text) {
    const subtitleHeight = calculateTextHeight(subtitle.text, contentWidth, subtitleSize);

    slide.addText(subtitle.text, {
      x: padding,
      y: currentY,
      w: contentWidth,
      h: subtitleHeight,
      fontFace: typography?.fonts?.sans || "Aptos",
      fontSize: subtitleSize,
      color: subColor.replace("#", ""),
      align: "left",
      valign: "top"
    });
    currentY += subtitleHeight + 0.2;
  }

  // Add bullets with enhanced styling and subtle accents
  const bullets = spec.content.bullets?.[0];
  if (bullets && bullets.items && bullets.items.length > 0) {
    const primaryColor = spec.styleTokens.palette.primary.replace("#", "");
    let currentY = subtitle ? 2.0 : 1.8;
    const lineHeight = 0.4;

    for (let i = 0; i < bullets.items.length; i++) {
      const item = bullets.items[i];

      // Add subtle accent circle for each bullet
      addDecorativeCircle(slide, 0.55, currentY + 0.05, 0.12, primaryColor, 0.2);

      // Add bullet text with professional styling
      slide.addText(item.text, {
        x: 0.85,
        y: currentY,
        w: 8.65,
        h: lineHeight,
        fontFace: "Aptos",
        fontSize: 18,
        color: "1E293B",
        align: "left",
        valign: "top",
        wrap: true
      });

      currentY += lineHeight + 0.1;
    }
  }

  // Add images if present
  const images = spec.content.images;
  if (images && images.length > 0) {
    for (const image of images) {
      try {
        const imageData = await processImageSource(image.source);
        if (imageData) {
          const dimensions = getOptimalImageDimensions(image.role);

          // If imageData is a string (data URL), use it directly
          if (typeof imageData === "string") {
            const fitType = (image.fit === "fill" ? "cover" : image.fit) || "cover";
            slide.addImage({
              data: imageData,
              x: dimensions.x,
              y: dimensions.y,
              w: dimensions.w,
              h: dimensions.h,
              sizing: { type: fitType as "cover" | "contain" | "crop", w: dimensions.w, h: dimensions.h }
            });
          } else {
            // If imageData is ProcessedImage, convert buffer to base64
            const base64 = imageData.data.toString("base64");
            const dataUrl = `data:${imageData.mimeType};base64,${base64}`;
            const fitType = (image.fit === "fill" ? "cover" : image.fit) || "cover";

            slide.addImage({
              data: dataUrl,
              x: dimensions.x,
              y: dimensions.y,
              w: dimensions.w,
              h: dimensions.h,
              sizing: { type: fitType as "cover" | "contain" | "crop", w: dimensions.w, h: dimensions.h }
            });
          }
        }
      } catch (error) {
        logger.warn(`Failed to add image ${image.id}:`, error);
        // Continue with other images
      }
    }
  }
}

/**
 * Add professional design accents to the slide
 * Includes subtle shapes, lines, and decorative elements
 */
function addProfessionalAccents(slide: any, spec: SlideSpecV1): void {
  const primaryColor = spec.styleTokens.palette.primary.replace("#", "");
  const accentColor = spec.styleTokens.palette.accent.replace("#", "");

  // Add subtle left accent bar for visual interest
  addAccentBar(slide, {
    position: "left",
    color: primaryColor,
    thickness: 0.08
  });

  // Add decorative corner accent (top-right)
  addCornerAccent(slide, "top-right", accentColor, 0.15);

  // Add subtle decorative circles in bottom-right for depth
  addDecorativeCircle(slide, 8.8, 6.5, 0.6, primaryColor, 0.05);
  addDecorativeCircle(slide, 9.1, 6.8, 0.4, accentColor, 0.08);
}

/**
 * Apply subtle gradient background to slide
 * Creates a modern, professional look with minimal visual noise
 * Uses SVG with fallback to solid color
 */
async function applyGradientBackground(slide: any, spec: SlideSpecV1): Promise<void> {
  try {
    // Try to generate SVG background
    const svgBackground = generateBackgroundForSlide(spec);
    const backgroundDataUrl = await svgToPngDataUrl(svgBackground, 1920, 1080);
    slide.background = { data: backgroundDataUrl };
    logger.info("✅ SVG gradient background applied");
  } catch (error) {
    logger.warn("⚠️ SVG background failed, using solid color fallback", { error: String(error) });
    // Fallback: solid color background
    const neutralLight = spec.styleTokens.palette.neutral[6] || "#F8FAFC";
    slide.background = { fill: neutralLight.replace("#", "") };
  }
}

