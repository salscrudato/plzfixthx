/**
 * Layout-Based PPTX Builder
 * Uses the spec's layout grid system to properly position and size content
 * Prevents overlapping text and ensures professional formatting
 */

import PptxGenJS from "pptxgenjs";
import type { SlideSpecV1 } from "../types/SlideSpecV1";
import { logger } from "firebase-functions/v2";

const SLIDE_WIDTH = 10; // inches
const SLIDE_HEIGHT = 7.5; // inches

/**
 * Convert pixels to inches
 */
function pxToIn(px: number): number {
  return (px * 0.75) / 72;
}

/**
 * Build slide using layout grid system
 */
export async function buildLayoutSlide(
  pptx: PptxGenJS,
  spec: SlideSpecV1
): Promise<void> {
  const slide = pptx.addSlide();

  try {
    logger.info("🎨 Layout builder starting", {
      hasTitle: !!spec.content.title,
      hasSubtitle: !!spec.content.subtitle,
      anchorsCount: spec.layout.anchors.length,
    });

    // Apply background
    applyBackground(slide, spec);

    // Calculate grid dimensions
    const { rows, cols, gutter, margin } = spec.layout.grid;
    const marginTop = pxToIn(margin.t);
    const marginRight = pxToIn(margin.r);
    const marginBottom = pxToIn(margin.b);
    const marginLeft = pxToIn(margin.l);
    const gutterIn = pxToIn(gutter);

    const gridWidth = SLIDE_WIDTH - marginLeft - marginRight;
    const gridHeight = SLIDE_HEIGHT - marginTop - marginBottom;
    const cellWidth = (gridWidth - (cols - 1) * gutterIn) / cols;
    const cellHeight = (gridHeight - (rows - 1) * gutterIn) / rows;

    // Create region map
    const regions: Record<string, any> = {};
    spec.layout.regions.forEach((region) => {
      const x = marginLeft + (region.colStart - 1) * (cellWidth + gutterIn);
      const y = marginTop + (region.rowStart - 1) * (cellHeight + gutterIn);
      const w = region.colSpan * cellWidth + (region.colSpan - 1) * gutterIn;
      const h = region.rowSpan * cellHeight + (region.rowSpan - 1) * gutterIn;

      regions[region.name] = { x, y, w, h };
    });

    // Get style tokens
    const palette = spec.styleTokens.palette;
    const typography = spec.styleTokens.typography;
    const textColor = palette.neutral[0] || "#0F172A";
    const subtitleColor = palette.neutral[2] || "#334155";
    const primaryColor = palette.primary || "#6366F1";

    const titleSize = typography?.sizes?.step_3 || 44;
    const subtitleSize = typography?.sizes?.step_1 || 22;
    const bodySize = typography?.sizes?.step_0 || 18;

    // Group anchors by region to handle stacking
    const anchorsByRegion: Record<string, any[]> = {};
    spec.layout.anchors.forEach((anchor) => {
      if (!anchorsByRegion[anchor.region]) {
        anchorsByRegion[anchor.region] = [];
      }
      anchorsByRegion[anchor.region].push(anchor);
    });

    // Render content by region, stacking multiple anchors vertically
    Object.entries(anchorsByRegion).forEach(([regionName, anchors]) => {
      const region = regions[regionName];
      if (!region) return;

      let currentY = region.y;
      const regionHeight = region.h;
      let usedHeight = 0;

      // Sort anchors by order
      anchors.sort((a, b) => a.order - b.order);

      anchors.forEach((anchor) => {
        // Title
        if (anchor.refId === spec.content.title?.id) {
          // Calculate title height based on text length and width
          const titleText = spec.content.title.text;
          const estimatedLines = Math.ceil(titleText.length / 40); // Rough estimate
          const titleHeight = Math.max(0.6, estimatedLines * (titleSize / 72) * 1.5); // Convert to inches

          logger.info("📝 Rendering title", {
            text: titleText.substring(0, 50),
            y: currentY,
            height: titleHeight,
            fontSize: titleSize,
            estimatedLines,
          });
          slide.addText(spec.content.title.text, {
            x: region.x,
            y: currentY,
            w: region.w,
            h: titleHeight,
            fontSize: titleSize,
            bold: true,
            color: primaryColor.replace("#", ""),
            fontFace: "Aptos",
            align: "left",
            valign: "top",
            wrap: true,
          });
          currentY += titleHeight + 0.15; // Add gap between title and subtitle
          usedHeight += titleHeight + 0.15;
          return;
        }

        // Subtitle
        if (anchor.refId === spec.content.subtitle?.id && spec.content.subtitle) {
          // Calculate subtitle height based on text length and width
          const subtitleText = spec.content.subtitle.text;
          const estimatedLines = Math.ceil(subtitleText.length / 50); // Rough estimate
          const subtitleHeight = Math.max(0.4, estimatedLines * (subtitleSize / 72) * 1.5); // Convert to inches

          logger.info("📝 Rendering subtitle", {
            text: subtitleText.substring(0, 50),
            y: currentY,
            height: subtitleHeight,
            fontSize: subtitleSize,
            estimatedLines,
          });
          slide.addText(spec.content.subtitle.text, {
            x: region.x,
            y: currentY,
            w: region.w,
            h: subtitleHeight,
            fontSize: subtitleSize,
            color: subtitleColor.replace("#", ""),
            fontFace: "Aptos",
            align: "left",
            valign: "top",
            wrap: true,
          });
          currentY += subtitleHeight + 0.15; // Add gap
          usedHeight += subtitleHeight + 0.15;
          return;
        }

        // Bullets
        const bulletList = spec.content.bullets?.find((b) => b.id === anchor.refId);
        if (bulletList) {
          const bulletTexts = bulletList.items.map((item) => ({
            text: item.text,
            options: {
              bullet: true,
              indentLevel: Math.max(0, item.level - 1),
            },
          }));

          const bulletHeight = Math.min(regionHeight - usedHeight, bulletList.items.length * bodySize * 1.5);
          slide.addText(bulletTexts, {
            x: region.x,
            y: currentY,
            w: region.w,
            h: bulletHeight,
            fontSize: bodySize,
            color: textColor.replace("#", ""),
            fontFace: "Aptos",
            align: "left",
            valign: "top",
            wrap: true,
          });
          return;
        }

        // Callouts
        const callout = spec.content.callouts?.find((c) => c.id === anchor.refId);
        if (callout) {
          const bgColor =
            callout.variant === "warning"
              ? "FEF3C7"
              : callout.variant === "danger"
                ? "FEE2E2"
                : callout.variant === "success"
                  ? "D1FAE5"
                  : "F3F4F6";

          const calloutHeight = Math.min(regionHeight - usedHeight, 1.0);
          slide.addShape("rect", {
            x: region.x,
            y: currentY,
            w: region.w,
            h: calloutHeight,
            fill: { color: bgColor },
            line: { color: primaryColor.replace("#", ""), width: 2 },
          });

          const calloutText = callout.title
            ? `${callout.title} — ${callout.text}`
            : callout.text;

          slide.addText(calloutText, {
            x: region.x + 0.2,
            y: currentY + 0.1,
            w: region.w - 0.4,
            h: calloutHeight - 0.2,
            fontSize: bodySize - 2,
            color: textColor.replace("#", ""),
            fontFace: "Aptos",
            align: "left",
            valign: "top",
            wrap: true,
          });
          return;
        }
      });
    });
  } catch (error) {
    logger.error("❌ Error building layout slide:", {
      error: String(error),
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Apply background with subtle gradient
 */
function applyBackground(slide: any, spec: SlideSpecV1): void {
  const palette = spec.styleTokens.palette;
  const neutralLight = palette.neutral[8] || "#F8FAFC";

  slide.background = { fill: neutralLight.replace("#", "") };
}

