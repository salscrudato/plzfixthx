/**
 * Precision Slide Builder
 * Implements exact layout specifications with precise control over all elements
 * 
 * Requirements:
 * - Title: 28pt font size
 * - Subtitle: 16pt font size, grey color
 * - Content: Fits between subtitle and bottom, respects margins
 * - Accent bar: Thin blue/purple gradient, left-aligned, full height
 */

import PptxGenJS from "pptxgenjs";
import type { SlideSpecV1 } from "../types/SlideSpecV1";
import { logger } from "firebase-functions/v2";

// Slide dimensions for 16:9 aspect ratio
const SLIDE_WIDTH_16_9 = 10; // inches
const SLIDE_HEIGHT_16_9 = 5.625; // inches

// Slide dimensions for 4:3 aspect ratio
const SLIDE_WIDTH_4_3 = 10; // inches
const SLIDE_HEIGHT_4_3 = 7.5; // inches

// Font sizes (in points)
const TITLE_FONT_SIZE = 26;
const SUBTITLE_FONT_SIZE = 14;
const CONTENT_FONT_SIZE = 12;

// Colors
const TITLE_COLOR = "1F2937"; // Dark grey
const SUBTITLE_COLOR = "6B7280"; // Medium grey
const CONTENT_COLOR = "374151"; // Medium-dark grey
const ACCENT_GRADIENT_START = "3B82F6"; // Blue
const ACCENT_GRADIENT_END = "8B5CF6"; // Purple

// Layout measurements (in inches)
const ACCENT_BAR_WIDTH = 0.08;
const MARGIN_LEFT = 0.6;
const MARGIN_RIGHT = 0.5;
const MARGIN_TOP = 0.35; // Moved closer to top
const MARGIN_BOTTOM = 0.5;
const TITLE_HEIGHT = 0.45; // Reduced for smaller font
const SUBTITLE_HEIGHT = 0.3; // Reduced for smaller font
const SPACING_AFTER_TITLE = 0.05; // Tighter spacing
const SPACING_AFTER_SUBTITLE = 0.2; // Reduced spacing before content

/**
 * Build a precision slide with exact layout control
 */
export async function buildPrecisionSlide(
  pptx: PptxGenJS,
  spec: SlideSpecV1
): Promise<void> {
  const slide = pptx.addSlide();
  
  try {
    logger.info("Building precision slide", {
      theme: spec.meta.theme,
      aspectRatio: spec.meta.aspectRatio
    });
    
    // Get slide dimensions based on aspect ratio
    const { width, height } = getSlideDimensions(spec.meta.aspectRatio);

    // 1. Apply background
    applyBackground(slide, spec);

    // 2. Add gradient accent bar
    addGradientAccentBar(slide, height);

    // 3. Add title (26pt)
    addTitle(slide, spec, width);

    // 4. Add subtitle (14pt, grey)
    addSubtitle(slide, spec, width);
    
    // 5. Add content (bullets, callouts, etc.)
    await addContent(slide, spec, width, height);
    
    // 6. Add data visualization if present
    if (spec.content.dataViz) {
      await addDataVisualization(slide, spec, width, height);
    }
    
    // 7. Add images if present
    if (spec.content.images && spec.content.images.length > 0) {
      await addImages(slide, spec, width, height);
    }
    
    logger.info("Precision slide built successfully");
  } catch (error) {
    logger.error("Error building precision slide:", error);
    throw error;
  }
}

/**
 * Get slide dimensions based on aspect ratio
 */
function getSlideDimensions(aspectRatio: string): { width: number; height: number } {
  if (aspectRatio === "4:3") {
    return { width: SLIDE_WIDTH_4_3, height: SLIDE_HEIGHT_4_3 };
  }
  return { width: SLIDE_WIDTH_16_9, height: SLIDE_HEIGHT_16_9 };
}

/**
 * Apply background
 */
function applyBackground(slide: any, spec: SlideSpecV1): void {
  const bgColor = spec.styleTokens?.palette?.neutral?.[8] || "F8FAFC";
  slide.background = { fill: bgColor.replace("#", "") };
}

/**
 * Add gradient accent bar on left edge
 */
function addGradientAccentBar(slide: any, slideHeight: number): void {
  const steps = 30; // Smooth gradient
  const barHeight = slideHeight / steps;
  
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
 * Add title with 28pt font
 */
function addTitle(slide: any, spec: SlideSpecV1, slideWidth: number): void {
  if (!spec.content.title) return;
  
  const titleY = MARGIN_TOP;
  const titleColor = spec.styleTokens?.palette?.neutral?.[0] || TITLE_COLOR;
  
  slide.addText(spec.content.title.text, {
    x: MARGIN_LEFT,
    y: titleY,
    w: slideWidth - MARGIN_LEFT - MARGIN_RIGHT,
    h: TITLE_HEIGHT,
    fontSize: TITLE_FONT_SIZE,
    bold: true,
    color: titleColor.replace("#", ""),
    fontFace: "Arial",
    align: "left",
    valign: "top",
    wrap: true
  });
}

/**
 * Add subtitle with 16pt font in grey
 */
function addSubtitle(slide: any, spec: SlideSpecV1, slideWidth: number): void {
  if (!spec.content.subtitle) return;
  
  const subtitleY = MARGIN_TOP + TITLE_HEIGHT + SPACING_AFTER_TITLE;
  const subtitleColor = spec.styleTokens?.palette?.neutral?.[3] || SUBTITLE_COLOR;
  
  slide.addText(spec.content.subtitle.text, {
    x: MARGIN_LEFT,
    y: subtitleY,
    w: slideWidth - MARGIN_LEFT - MARGIN_RIGHT,
    h: SUBTITLE_HEIGHT,
    fontSize: SUBTITLE_FONT_SIZE,
    color: subtitleColor.replace("#", ""),
    fontFace: "Arial",
    align: "left",
    valign: "top",
    wrap: true
  });
}

/**
 * Add content (bullets, callouts)
 */
async function addContent(
  slide: any,
  spec: SlideSpecV1,
  slideWidth: number,
  slideHeight: number
): Promise<void> {
  const contentY = MARGIN_TOP + TITLE_HEIGHT + SPACING_AFTER_TITLE + 
                   SUBTITLE_HEIGHT + SPACING_AFTER_SUBTITLE;
  const contentHeight = slideHeight - contentY - MARGIN_BOTTOM;
  const contentWidth = slideWidth - MARGIN_LEFT - MARGIN_RIGHT;
  
  // Add bullets if present
  if (spec.content.bullets && spec.content.bullets.length > 0) {
    let yPos = contentY;
    
    for (const bulletGroup of spec.content.bullets) {
      if (!bulletGroup.items || bulletGroup.items.length === 0) continue;
      
      const bulletText = bulletGroup.items
        .map(item => {
          const indent = "  ".repeat(item.level - 1);
          return `${indent}• ${item.text}`;
        })
        .join("\n");
      
      const textHeight = Math.min(contentHeight * 0.6, bulletGroup.items.length * 0.3);
      
      slide.addText(bulletText, {
        x: MARGIN_LEFT,
        y: yPos,
        w: contentWidth,
        h: textHeight,
        fontSize: CONTENT_FONT_SIZE,
        color: CONTENT_COLOR,
        fontFace: "Arial",
        align: "left",
        valign: "top",
        wrap: true,
        lineSpacing: 24
      });
      
      yPos += textHeight + 0.2;
    }
  }
  
  // Add callouts if present
  if (spec.content.callouts && spec.content.callouts.length > 0) {
    const calloutY = contentY + contentHeight * 0.7;
    
    for (let i = 0; i < spec.content.callouts.length; i++) {
      const callout = spec.content.callouts[i];
      const calloutX = MARGIN_LEFT + (i * (contentWidth / spec.content.callouts.length));
      const calloutWidth = (contentWidth / spec.content.callouts.length) - 0.2;
      
      // Callout background
      slide.addShape("rect", {
        x: calloutX,
        y: calloutY,
        w: calloutWidth,
        h: 0.6,
        fill: { color: "EFF6FF" },
        line: { color: "3B82F6", width: 0.02 }
      });
      
      // Callout text
      slide.addText(callout.text, {
        x: calloutX + 0.1,
        y: calloutY + 0.1,
        w: calloutWidth - 0.2,
        h: 0.4,
        fontSize: 12,
        color: "1E40AF",
        fontFace: "Arial",
        align: "center",
        valign: "middle",
        wrap: true
      });
    }
  }
}

/**
 * Add data visualization
 */
async function addDataVisualization(
  slide: any,
  spec: SlideSpecV1,
  slideWidth: number,
  slideHeight: number
): Promise<void> {
  if (!spec.content.dataViz) return;

  const chartY = MARGIN_TOP + TITLE_HEIGHT + SPACING_AFTER_TITLE +
                 SUBTITLE_HEIGHT + SPACING_AFTER_SUBTITLE + 0.5;
  const chartHeight = slideHeight - chartY - MARGIN_BOTTOM - 0.5;
  const chartWidth = (slideWidth - MARGIN_LEFT - MARGIN_RIGHT) * 0.6;
  const chartX = slideWidth - MARGIN_RIGHT - chartWidth;

  const dataViz = spec.content.dataViz;

  // Prepare chart data
  const chartData = dataViz.series.map(series => ({
    name: series.name,
    labels: dataViz.labels,
    values: series.values
  }));

  // Add chart (using string type instead of enum)
  slide.addChart("bar", chartData, {
    x: chartX,
    y: chartY,
    w: chartWidth,
    h: chartHeight,
    showTitle: false,
    showLegend: true,
    legendPos: "b"
  });
}

/**
 * Add images
 */
async function addImages(
  slide: any,
  spec: SlideSpecV1,
  slideWidth: number,
  slideHeight: number
): Promise<void> {
  // Image placement logic would go here
  // For now, we'll skip this as it requires image processing
  logger.info("Image support not yet implemented in precision builder");
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

