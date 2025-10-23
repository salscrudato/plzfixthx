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

/**
 * Build a professional slide with beautiful design elements
 */
export async function buildMinimalSlide(
  pptx: PptxGenJS,
  spec: SlideSpecV1
): Promise<void> {
  const slide = pptx.addSlide();

  // Apply subtle gradient background for modern, professional look
  applyGradientBackground(slide, spec);

  // Add professional design accents
  addProfessionalAccents(slide, spec);

  // Add title with enhanced styling
  const title = spec.content.title;
  if (title && title.text) {
    slide.addText(title.text, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontFace: "Aptos",
      fontSize: 32,
      bold: true,
      color: "0F172A",
      align: "left",
      valign: "top"
    });

    // Add subtle accent line under title
    const primaryColor = spec.styleTokens.palette.primary.replace("#", "");
    addPremiumDivider(slide, 0.5, 1.15, 2.5, primaryColor, 0.04);
  }

  // Add subtitle with refined styling
  const subtitle = spec.content.subtitle;
  if (subtitle && subtitle.text) {
    slide.addText(subtitle.text, {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 0.4,
      fontFace: "Aptos",
      fontSize: 18,
      color: "64748B",
      align: "left",
      valign: "top"
    });
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
 */
function applyGradientBackground(slide: any, spec: SlideSpecV1): void {
  // Get theme-based colors from spec
  const primaryColor = spec.styleTokens.palette.primary || "#6366F1";
  const neutralLight = spec.styleTokens.palette.neutral[6] || "#F8FAFC";
  const neutralLighter = spec.styleTokens.palette.neutral[5] || "#F1F5F9";

  // Create subtle gradient using overlapping rectangles with transparency
  // This simulates a gradient effect in PowerPoint

  // Base layer - lightest color
  slide.background = { fill: neutralLight.replace("#", "") };

  // Add subtle gradient overlay using semi-transparent shapes
  // Top-left to bottom-right gradient effect
  const gradientSteps = 5;
  const slideWidth = 10;
  const slideHeight = 7.5;

  for (let i = 0; i < gradientSteps; i++) {
    const transparency = 95 - (i * 2); // 95%, 93%, 91%, 89%, 87%
    const yPos = (slideHeight / gradientSteps) * i;
    const height = slideHeight / gradientSteps + 0.1; // Slight overlap

    slide.addShape("rect", {
      x: 0,
      y: yPos,
      w: slideWidth,
      h: height,
      fill: {
        color: neutralLighter.replace("#", ""),
        transparency: transparency
      },
      line: { type: "none" }
    });
  }

  // Add very subtle accent gradient on the right edge for depth
  slide.addShape("rect", {
    x: slideWidth - 0.5,
    y: 0,
    w: 0.5,
    h: slideHeight,
    fill: {
      color: primaryColor.replace("#", ""),
      transparency: 97 // Very subtle
    },
    line: { type: "none" }
  });
}

