/**
 * Minimal PPTX Builder
 * Creates the simplest possible PowerPoint with just title and body text
 * No styling, no colors, no complex features - just clean, working PPTX
 */

import PptxGenJS from "pptxgenjs";
import type { SlideSpecV1 } from "../types/SlideSpecV1";

/**
 * Build a minimal slide with just title and body text
 * This is the MVP - no styling, just content
 */
export async function buildMinimalSlide(
  pptx: PptxGenJS,
  spec: SlideSpecV1
): Promise<void> {
  const slide = pptx.addSlide();

  // Set background to white
  slide.background = { fill: "FFFFFF" };

  // Add title (always 28px)
  const title = spec.content.title;
  if (title && title.text) {
    slide.addText(title.text, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontFace: "Aptos",
      fontSize: 28,
      bold: true,
      color: "000000",
      align: "left",
      valign: "top"
    });
  }

  // Add subtitle
  const subtitle = spec.content.subtitle;
  if (subtitle && subtitle.text) {
    slide.addText(subtitle.text, {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 0.4,
      fontFace: "Aptos",
      fontSize: 18,
      color: "666666",
      align: "left",
      valign: "top"
    });
  }

  // Add bullets with proper spacing
  const bullets = spec.content.bullets?.[0];
  if (bullets && bullets.items && bullets.items.length > 0) {
    // Format each bullet as a separate text element for proper spacing
    let currentY = 2.3;
    const lineHeight = 0.35; // Space between bullet lines

    for (const item of bullets.items) {
      const bulletText = "• " + item.text;

      slide.addText(bulletText, {
        x: 0.7,
        y: currentY,
        w: 8.8,
        h: lineHeight,
        fontFace: "Aptos",
        fontSize: 18,
        color: "000000",
        align: "left",
        valign: "top",
        wrap: true
      });

      currentY += lineHeight + 0.05; // Add spacing between bullets
    }
  }
}

