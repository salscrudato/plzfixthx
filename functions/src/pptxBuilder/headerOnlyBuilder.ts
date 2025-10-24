/**
 * Header and Subtitle PPTX Builder
 * Generates professional slides with header and subtitle
 * Header: 26px bold, primary color
 * Subtitle: 16px grey, supporting text
 * Includes left gradient bar accent
 */

import PptxGenJS from "pptxgenjs";

export interface HeaderOnlySlideSpec {
  header: string;
  subtitle: string;
  color: string;
}

/**
 * Build a header and subtitle slide
 * Features: left gradient bar, header (26px), subtitle (16px grey)
 */
export async function buildHeaderOnlySlide(
  pptx: PptxGenJS,
  spec: HeaderOnlySlideSpec
): Promise<void> {
  const slide = pptx.addSlide();

  // Get colors
  const primaryColor = spec.color || "#6366F1";
  const subtitleColor = "#64748B"; // Grey for subtitle
  const backgroundColor = "#FFFFFF"; // White background

  // Set background
  slide.background = { color: backgroundColor };

  // Add left gradient bar (accent) - 12px wide
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.17, // ~12px in inches (0.17 * 72 ≈ 12)
    h: 5.625, // Full height for 16:9
    fill: { color: primaryColor },
    line: { type: "none" }
  });

  // Add header text - 26px bold
  slide.addText(spec.header, {
    x: 0.5, // Left margin
    y: 1.8, // Top position
    w: 9.0, // Width (10 - 0.5 left - 0.5 right)
    h: 1.2, // Height for header
    fontSize: 26,
    bold: true,
    fontFace: "Aptos",
    color: primaryColor, // Use primary color for header text
    align: "left",
    valign: "top"
  });

  // Add subtitle text - 16px grey
  slide.addText(spec.subtitle, {
    x: 0.5, // Left margin (aligned with header)
    y: 3.1, // Below header
    w: 9.0, // Same width as header
    h: 1.5, // Height for subtitle (can wrap)
    fontSize: 16,
    bold: false,
    fontFace: "Aptos",
    color: subtitleColor, // Grey color for subtitle
    align: "left",
    valign: "top"
  });
}

