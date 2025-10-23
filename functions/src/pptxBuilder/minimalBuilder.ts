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

  // Get title
  const title = spec.content.title;
  if (title && title.text) {
    // Add title in top left
    // Using Aptos font (modern, clean, default in Office)
    slide.addText(title.text, {
      x: 0.5,           // 0.5 inches from left
      y: 0.5,           // 0.5 inches from top
      w: 9,             // 9 inches wide
      h: 1,             // 1 inch tall
      fontFace: "Aptos", // Modern, clean font
      fontSize: 44,     // Large title
      bold: true,
      color: "000000",  // Black text
      align: "left",
      valign: "top"
    });
  }

  // Get subtitle if present
  const subtitle = spec.content.subtitle;
  if (subtitle && subtitle.text) {
    slide.addText(subtitle.text, {
      x: 0.5,
      y: 1.7,           // Below title
      w: 9,
      h: 0.6,
      fontFace: "Aptos",
      fontSize: 24,     // Smaller than title
      color: "666666",  // Gray text
      align: "left",
      valign: "top"
    });
  }

  // Get bullets if present
  const bullets = spec.content.bullets?.[0];
  if (bullets && bullets.items && bullets.items.length > 0) {
    // Format bullet items for PptxGenJS
    const bulletItems = bullets.items.map((item: any) => ({
      text: item.text,
      options: {
        bullet: true,
        indentLevel: Math.max(0, item.level - 1)
      }
    }));

    slide.addText(bulletItems, {
      x: 0.5,
      y: 2.5,           // Below subtitle
      w: 9,
      h: 4,             // Plenty of space for bullets
      fontFace: "Aptos",
      fontSize: 18,     // Body text size
      color: "000000",
      align: "left",
      valign: "top",
      wrap: true
    });
  }
}

