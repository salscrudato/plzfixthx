/**
 * Premium UI Components for Professional PowerPoint Slides
 * Provides sophisticated, production-ready components
 */

import PptxGenJS from "pptxgenjs";

export interface BadgeConfig {
  text: string;
  color: string;
  backgroundColor: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface AccentBarConfig {
  position: "top" | "bottom" | "left" | "right";
  color: string;
  thickness: number;
}

export interface DecorativeElementConfig {
  type: "circle" | "line" | "accent-bar" | "corner-accent";
  color: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

/**
 * Add a professional badge/tag to the slide
 */
export function addPremiumBadge(
  slide: any,
  config: BadgeConfig
): void {
  const width = config.width || 1.2;
  const height = config.height || 0.35;

  // Badge background
  slide.addShape(PptxGenJS.ShapeType.roundRect, {
    x: config.x,
    y: config.y,
    w: width,
    h: height,
    fill: { color: config.backgroundColor },
    line: { color: config.color, width: 1.5 },
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.08,
      blur: 4,
      offset: 1
    }
  });

  // Badge text
  slide.addText(config.text, {
    x: config.x,
    y: config.y,
    w: width,
    h: height,
    fontSize: 10,
    bold: true,
    color: config.color,
    align: "center",
    valign: "middle",
    fontFace: "Inter, Arial, sans-serif"
  });
}

/**
 * Add an accent bar for visual emphasis
 */
export function addAccentBar(
  slide: any,
  config: AccentBarConfig
): void {
  const slideWidth = 10;
  const slideHeight = 7.5;

  let x = 0, y = 0, w = slideWidth, h = config.thickness;

  switch (config.position) {
    case "top":
      x = 0;
      y = 0;
      w = slideWidth;
      h = config.thickness;
      break;
    case "bottom":
      x = 0;
      y = slideHeight - config.thickness;
      w = slideWidth;
      h = config.thickness;
      break;
    case "left":
      x = 0;
      y = 0;
      w = config.thickness;
      h = slideHeight;
      break;
    case "right":
      x = slideWidth - config.thickness;
      y = 0;
      w = config.thickness;
      h = slideHeight;
      break;
  }

  slide.addShape(PptxGenJS.ShapeType.rect, {
    x,
    y,
    w,
    h,
    fill: { color: config.color },
    line: { type: "none" }
  });
}

/**
 * Add a decorative circle accent
 */
export function addDecorativeCircle(
  slide: any,
  x: number,
  y: number,
  size: number,
  color: string,
  opacity: number = 0.1
): void {
  slide.addShape(PptxGenJS.ShapeType.ellipse, {
    x,
    y,
    w: size,
    h: size,
    fill: { color, transparency: Math.round((1 - opacity) * 100) },
    line: { type: "none" }
  });
}

/**
 * Add a decorative line accent
 */
export function addDecorativeLine(
  slide: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number = 2
): void {
  slide.addShape(PptxGenJS.ShapeType.line, {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: { color, width }
  });
}

/**
 * Add a corner accent for premium feel
 */
export function addCornerAccent(
  slide: any,
  corner: "top-left" | "top-right" | "bottom-left" | "bottom-right",
  color: string,
  size: number = 0.3
): void {
  const slideWidth = 10;
  const slideHeight = 7.5;

  let x = 0, y = 0;

  switch (corner) {
    case "top-left":
      x = 0;
      y = 0;
      break;
    case "top-right":
      x = slideWidth - size;
      y = 0;
      break;
    case "bottom-left":
      x = 0;
      y = slideHeight - size;
      break;
    case "bottom-right":
      x = slideWidth - size;
      y = slideHeight - size;
      break;
  }

  slide.addShape(PptxGenJS.ShapeType.rect, {
    x,
    y,
    w: size,
    h: size,
    fill: { color },
    line: { type: "none" }
  });
}

/**
 * Add a premium divider line
 */
export function addPremiumDivider(
  slide: any,
  x: number,
  y: number,
  width: number,
  color: string = "#E2E8F0",
  thickness: number = 0.02
): void {
  slide.addShape(PptxGenJS.ShapeType.rect, {
    x,
    y,
    w: width,
    h: thickness,
    fill: { color },
    line: { type: "none" }
  });
}

/**
 * Add a premium highlight box
 */
export function addHighlightBox(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  opacity: number = 0.15
): void {
  slide.addShape(PptxGenJS.ShapeType.rect, {
    x,
    y,
    w: width,
    h: height,
    fill: { color, transparency: Math.round((1 - opacity) * 100) },
    line: { type: "none" }
  });
}

/**
 * Add a premium metric card
 */
export function addMetricCard(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  metric: string,
  value: string,
  unit?: string,
  accentColor: string = "#3B82F6"
): void {
  // Card background
  slide.addShape(PptxGenJS.ShapeType.roundRect, {
    x,
    y,
    w: width,
    h: height,
    fill: { color: "#FFFFFF" },
    line: { color: "#E5E7EB", width: 1 },
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.08,
      blur: 8,
      offset: 2
    }
  });

  // Accent bar
  slide.addShape(PptxGenJS.ShapeType.rect, {
    x,
    y,
    w: 0.08,
    h: height,
    fill: { color: accentColor },
    line: { type: "none" }
  });

  // Metric label
  slide.addText(metric, {
    x: x + 0.15,
    y: y + 0.1,
    w: width - 0.25,
    h: 0.25,
    fontSize: 11,
    color: "#6B7280",
    fontFace: "Inter, Arial, sans-serif",
    bold: false
  });

  // Value
  slide.addText(value, {
    x: x + 0.15,
    y: y + 0.4,
    w: width - 0.25,
    h: 0.5,
    fontSize: 28,
    bold: true,
    color: "#0F172A",
    fontFace: "Inter, Arial, sans-serif"
  });

  // Unit
  if (unit) {
    slide.addText(unit, {
      x: x + 0.15,
      y: y + 0.85,
      w: width - 0.25,
      h: 0.2,
      fontSize: 10,
      color: "#9CA3AF",
      fontFace: "Inter, Arial, sans-serif"
    });
  }
}

/**
 * Add a sophisticated gradient-like accent bar with multiple colors
 */
export function addGradientAccentBar(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: string[]
): void {
  if (colors.length === 0) return;

  const segmentWidth = width / colors.length;

  colors.forEach((color, index) => {
    slide.addShape(PptxGenJS.ShapeType.rect, {
      x: x + index * segmentWidth,
      y,
      w: segmentWidth,
      h: height,
      fill: { color },
      line: { type: "none" }
    });
  });
}

/**
 * Add a premium stat block with icon placeholder
 */
export function addStatBlock(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  stat: string,
  label: string,
  backgroundColor: string = "#F8FAFC",
  accentColor: string = "#3B82F6"
): void {
  // Background
  slide.addShape(PptxGenJS.ShapeType.roundRect, {
    x,
    y,
    w: width,
    h: height,
    fill: { color: backgroundColor },
    line: { color: "#E5E7EB", width: 1 },
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.06,
      blur: 6,
      offset: 1
    }
  });

  // Top accent bar
  slide.addShape(PptxGenJS.ShapeType.rect, {
    x,
    y,
    w: width,
    h: 0.04,
    fill: { color: accentColor },
    line: { type: "none" }
  });

  // Stat value
  slide.addText(stat, {
    x: x + 0.2,
    y: y + 0.3,
    w: width - 0.4,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: accentColor,
    fontFace: "Inter, Arial, sans-serif",
    align: "center"
  });

  // Label
  slide.addText(label, {
    x: x + 0.2,
    y: y + 0.95,
    w: width - 0.4,
    h: 0.3,
    fontSize: 12,
    color: "#6B7280",
    fontFace: "Inter, Arial, sans-serif",
    align: "center"
  });
}

/**
 * Add a premium section divider with icon
 */
export function addSectionDivider(
  slide: any,
  x: number,
  y: number,
  width: number,
  color: string = "#E2E8F0",
  thickness: number = 0.03
): void {
  // Main divider line
  slide.addShape(PptxGenJS.ShapeType.rect, {
    x,
    y,
    w: width,
    h: thickness,
    fill: { color },
    line: { type: "none" }
  });

  // Accent circle in center
  const centerX = x + width / 2 - 0.08;
  const centerY = y - 0.08;

  slide.addShape(PptxGenJS.ShapeType.ellipse, {
    x: centerX,
    y: centerY,
    w: 0.16,
    h: 0.16,
    fill: { color: "#FFFFFF" },
    line: { color, width: 2 }
  });
}

/**
 * Add a premium feature highlight box
 */
export function addFeatureHighlight(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  description: string,
  accentColor: string = "#3B82F6"
): void {
  // Background
  slide.addShape(PptxGenJS.ShapeType.roundRect, {
    x,
    y,
    w: width,
    h: height,
    fill: { color: "#FFFFFF" },
    line: { color: accentColor, width: 2 },
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.08,
      blur: 12,
      offset: 3
    }
  });

  // Title
  slide.addText(title, {
    x: x + 0.2,
    y: y + 0.2,
    w: width - 0.4,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: accentColor,
    fontFace: "Inter, Arial, sans-serif"
  });

  // Description
  slide.addText(description, {
    x: x + 0.2,
    y: y + 0.65,
    w: width - 0.4,
    h: height - 0.85,
    fontSize: 12,
    color: "#6B7280",
    fontFace: "Inter, Arial, sans-serif",
    wrap: true
  });
}

