/**
 * Visual Verification Test for PowerPoint Layout
 * Creates slides with measurement guides and annotations
 */

import PptxGenJS from "pptxgenjs";
import * as fs from "fs";
import * as path from "path";

// Slide dimensions for 16:9 aspect ratio
const SLIDE_WIDTH = 10; // inches
const SLIDE_HEIGHT = 5.625; // inches (16:9)

// Font sizes in points
const TITLE_FONT_SIZE = 26;
const SUBTITLE_FONT_SIZE = 14;
const CONTENT_FONT_SIZE = 12;

// Colors
const TITLE_COLOR = "1F2937"; // Dark grey
const SUBTITLE_COLOR = "6B7280"; // Medium grey
const ACCENT_GRADIENT_START = "3B82F6"; // Blue
const ACCENT_GRADIENT_END = "8B5CF6"; // Purple

// Layout measurements (in inches)
const ACCENT_BAR_WIDTH = 0.08;
const MARGIN_LEFT = 0.6;
const MARGIN_RIGHT = 0.5;
const MARGIN_TOP = 0.35;
const TITLE_HEIGHT = 0.45;
const SUBTITLE_HEIGHT = 0.3;
const SPACING_AFTER_TITLE = 0.05;
const SPACING_AFTER_SUBTITLE = 0.2;

/**
 * Create a slide with visual measurement guides
 */
export async function createVisualVerificationSlide(): Promise<void> {
  const pptx = new PptxGenJS();
  
  pptx.layout = "LAYOUT_16x9";
  pptx.defineLayout({ name: "CUSTOM", width: SLIDE_WIDTH, height: SLIDE_HEIGHT });
  pptx.layout = "CUSTOM";
  
  const slide = pptx.addSlide();
  
  // Background
  slide.background = { fill: "FFFFFF" };
  
  // Add gradient accent bar
  addGradientAccentBar(slide);
  
  // Add measurement guides (light grey lines)
  addMeasurementGuides(slide);
  
  // Add title
  const titleY = MARGIN_TOP;
  slide.addText("Sample Title Text (26pt)", {
    x: MARGIN_LEFT,
    y: titleY,
    w: SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
    h: TITLE_HEIGHT,
    fontSize: TITLE_FONT_SIZE,
    bold: true,
    color: TITLE_COLOR,
    fontFace: "Arial",
    align: "left",
    valign: "top",
    wrap: true
  });

  // Add subtitle
  const subtitleY = titleY + TITLE_HEIGHT + SPACING_AFTER_TITLE;
  slide.addText("Sample Subtitle Text (14pt, Grey)", {
    x: MARGIN_LEFT,
    y: subtitleY,
    w: SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
    h: SUBTITLE_HEIGHT,
    fontSize: SUBTITLE_FONT_SIZE,
    color: SUBTITLE_COLOR,
    fontFace: "Arial",
    align: "left",
    valign: "top",
    wrap: true
  });

  // Add content
  const contentY = subtitleY + SUBTITLE_HEIGHT + SPACING_AFTER_SUBTITLE;
  const contentHeight = SLIDE_HEIGHT - contentY - 0.5;

  const bulletText = [
    "• Content area starts here",
    "• This is 12pt font for readability",
    "• Content should fit within bounds",
    "• Left and right margins respected",
    "• Bottom margin maintained",
    "• More room for content with tighter header"
  ].join("\n");

  slide.addText(bulletText, {
    x: MARGIN_LEFT,
    y: contentY,
    w: SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
    h: contentHeight,
    fontSize: CONTENT_FONT_SIZE,
    color: "374151",
    fontFace: "Arial",
    align: "left",
    valign: "top",
    wrap: true,
    lineSpacing: 18
  });
  
  // Add annotations showing measurements
  addAnnotations(slide);
  
  // Save
  const outputDir = path.join(__dirname, "../../test-output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, "visual-verification.pptx");
  const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
  fs.writeFileSync(outputPath, buffer);
  
  console.log("✅ Visual verification slide created!");
  console.log(`   File: ${outputPath}`);
  console.log("\n📏 Layout Specifications:");
  console.log(`   Title: ${TITLE_FONT_SIZE}pt, position: (${MARGIN_LEFT}", ${MARGIN_TOP}")`);
  console.log(`   Subtitle: ${SUBTITLE_FONT_SIZE}pt, position: (${MARGIN_LEFT}", ${subtitleY.toFixed(2)}")`);
  console.log(`   Content: starts at ${contentY.toFixed(2)}", height: ${contentHeight.toFixed(2)}"`);
  console.log(`   Accent bar: ${ACCENT_BAR_WIDTH}" wide, full height`);
  console.log(`   Margins: L=${MARGIN_LEFT}", R=${MARGIN_RIGHT}", T=${MARGIN_TOP}", B=0.5"`);
}

/**
 * Add gradient accent bar
 */
function addGradientAccentBar(slide: any): void {
  const steps = 30; // Smooth gradient
  const barHeight = SLIDE_HEIGHT / steps;
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const color = interpolateColor(ACCENT_GRADIENT_START, ACCENT_GRADIENT_END, ratio);
    
    slide.addShape("rect", {
      x: 0,
      y: i * barHeight,
      w: ACCENT_BAR_WIDTH,
      h: barHeight,
      fill: { color: color },
      line: { type: "none" }
    });
  }
}

/**
 * Add measurement guide lines
 */
function addMeasurementGuides(slide: any): void {
  const guideColor = "E5E7EB";
  const lineWidth = 0.01;
  
  // Left margin line
  slide.addShape("line", {
    x: MARGIN_LEFT,
    y: 0,
    w: 0,
    h: SLIDE_HEIGHT,
    line: { color: guideColor, width: lineWidth, dashType: "dash" }
  });
  
  // Right margin line
  slide.addShape("line", {
    x: SLIDE_WIDTH - MARGIN_RIGHT,
    y: 0,
    w: 0,
    h: SLIDE_HEIGHT,
    line: { color: guideColor, width: lineWidth, dashType: "dash" }
  });
  
  // Title bottom line
  const titleBottom = MARGIN_TOP + TITLE_HEIGHT;
  slide.addShape("line", {
    x: MARGIN_LEFT,
    y: titleBottom,
    w: SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
    h: 0,
    line: { color: guideColor, width: lineWidth, dashType: "dash" }
  });
  
  // Subtitle bottom line
  const subtitleBottom = titleBottom + SPACING_AFTER_TITLE + SUBTITLE_HEIGHT;
  slide.addShape("line", {
    x: MARGIN_LEFT,
    y: subtitleBottom,
    w: SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
    h: 0,
    line: { color: guideColor, width: lineWidth, dashType: "dash" }
  });
  
  // Content area top line
  const contentTop = subtitleBottom + SPACING_AFTER_SUBTITLE;
  slide.addShape("line", {
    x: MARGIN_LEFT,
    y: contentTop,
    w: SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
    h: 0,
    line: { color: "FCA5A5", width: 0.02 } // Red line for content start
  });
  
  // Bottom margin line
  slide.addShape("line", {
    x: MARGIN_LEFT,
    y: SLIDE_HEIGHT - 0.5,
    w: SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
    h: 0,
    line: { color: "FCA5A5", width: 0.02 } // Red line for content end
  });
}

/**
 * Add measurement annotations
 */
function addAnnotations(slide: any): void {
  const annotationColor = "9CA3AF";
  const fontSize = 8;
  
  // Accent bar width annotation
  slide.addText(`${ACCENT_BAR_WIDTH}"`, {
    x: 0,
    y: SLIDE_HEIGHT - 0.3,
    w: ACCENT_BAR_WIDTH * 3,
    h: 0.2,
    fontSize: fontSize,
    color: annotationColor,
    align: "center",
    valign: "middle"
  });
  
  // Title font size annotation
  slide.addText(`${TITLE_FONT_SIZE}pt`, {
    x: SLIDE_WIDTH - 0.8,
    y: MARGIN_TOP,
    w: 0.6,
    h: 0.3,
    fontSize: fontSize,
    color: annotationColor,
    align: "right",
    valign: "top"
  });
  
  // Subtitle font size annotation
  const subtitleY = MARGIN_TOP + TITLE_HEIGHT + SPACING_AFTER_TITLE;
  slide.addText(`${SUBTITLE_FONT_SIZE}pt`, {
    x: SLIDE_WIDTH - 0.8,
    y: subtitleY,
    w: 0.6,
    h: 0.3,
    fontSize: fontSize,
    color: annotationColor,
    align: "right",
    valign: "top"
  });
}

/**
 * Interpolate between two hex colors
 */
function interpolateColor(color1: string, color2: string, ratio: number): string {
  const r1 = parseInt(color1.substring(0, 2), 16);
  const g1 = parseInt(color1.substring(2, 4), 16);
  const b1 = parseInt(color1.substring(4, 6), 16);
  
  const r2 = parseInt(color2.substring(0, 2), 16);
  const g2 = parseInt(color2.substring(2, 4), 16);
  const b2 = parseInt(color2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  
  return `${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// Run if executed directly
if (require.main === module) {
  createVisualVerificationSlide().catch(console.error);
}

