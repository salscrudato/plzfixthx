/**
 * Advanced Typography Effects
 * Text gradients, shadows, multi-column layouts, smart text fitting
 */

import PptxGenJS from "pptxgenjs";

export interface TextGradient {
  colors: string[];
  angle?: number; // 0-360 degrees
}

export interface TextShadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export interface MultiColumnConfig {
  columns: number;
  gap: number; // in inches
  text: string;
}

export interface SmartTextConfig {
  text: string;
  maxWidth: number;
  maxHeight: number;
  minFontSize: number;
  maxFontSize: number;
  fontFace?: string;
}

/**
 * Add text with gradient effect
 * Note: PptxGenJS has limited gradient support, so we simulate with layered text
 */
export function addGradientText(
  slide: any,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  gradient: TextGradient,
  options: any = {}
): void {
  // PptxGenJS doesn't support text gradients directly
  // We'll use the primary color from the gradient
  const primaryColor = gradient.colors[0]?.replace("#", "") || "000000";
  
  slide.addText(text, {
    x,
    y,
    w,
    h,
    color: primaryColor,
    ...options,
    // Add shadow for depth to simulate gradient effect
    shadow: {
      type: "outer",
      color: gradient.colors[1]?.replace("#", "") || "000000",
      opacity: 0.3,
      blur: 3,
      offset: 1,
      angle: gradient.angle || 45
    }
  });
}

/**
 * Add text with custom shadow effect
 */
export function addShadowText(
  slide: any,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  shadow: TextShadow,
  options: any = {}
): void {
  slide.addText(text, {
    x,
    y,
    w,
    h,
    ...options,
    shadow: {
      type: "outer",
      color: shadow.color.replace("#", ""),
      opacity: shadow.opacity,
      blur: shadow.blur,
      offset: Math.sqrt(shadow.offsetX ** 2 + shadow.offsetY ** 2),
      angle: Math.atan2(shadow.offsetY, shadow.offsetX) * (180 / Math.PI)
    }
  });
}

/**
 * Add multi-column text layout
 */
export function addMultiColumnText(
  slide: any,
  config: MultiColumnConfig,
  x: number,
  y: number,
  totalWidth: number,
  height: number,
  options: any = {}
): void {
  const columnWidth = (totalWidth - (config.gap * (config.columns - 1))) / config.columns;
  const words = config.text.split(" ");
  const wordsPerColumn = Math.ceil(words.length / config.columns);
  
  for (let i = 0; i < config.columns; i++) {
    const columnWords = words.slice(i * wordsPerColumn, (i + 1) * wordsPerColumn);
    const columnText = columnWords.join(" ");
    const columnX = x + (i * (columnWidth + config.gap));
    
    slide.addText(columnText, {
      x: columnX,
      y,
      w: columnWidth,
      h: height,
      ...options,
      align: "left",
      valign: "top"
    });
  }
}

/**
 * Smart text fitting - automatically adjust font size to fit content
 */
export function calculateOptimalFontSize(config: SmartTextConfig): number {
  const { text, maxWidth, maxHeight, minFontSize, maxFontSize } = config;
  
  // Estimate characters per line based on width
  // Average character width is roughly 0.6 * fontSize (in points)
  const estimateLines = (fontSize: number): number => {
    const avgCharWidth = fontSize * 0.6 / 72; // Convert to inches
    const charsPerLine = Math.floor(maxWidth / avgCharWidth);
    return Math.ceil(text.length / charsPerLine);
  };
  
  const estimateHeight = (fontSize: number): number => {
    const lineHeight = fontSize * 1.4 / 72; // Convert to inches with 1.4 line height
    return estimateLines(fontSize) * lineHeight;
  };
  
  // Binary search for optimal font size
  let low = minFontSize;
  let high = maxFontSize;
  let optimal = minFontSize;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const height = estimateHeight(mid);
    
    if (height <= maxHeight) {
      optimal = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  
  return optimal;
}

/**
 * Add text with smart fitting
 */
export function addSmartFitText(
  slide: any,
  config: SmartTextConfig,
  x: number,
  y: number,
  options: any = {}
): void {
  const fontSize = calculateOptimalFontSize(config);
  
  slide.addText(config.text, {
    x,
    y,
    w: config.maxWidth,
    h: config.maxHeight,
    fontSize,
    fontFace: config.fontFace || "Arial",
    ...options,
    fit: "shrink", // PptxGenJS built-in text fitting
    shrinkText: true
  });
}

/**
 * Add pull quote with decorative styling
 */
export function addPullQuote(
  slide: any,
  quote: string,
  author: string,
  x: number,
  y: number,
  w: number,
  h: number,
  accentColor: string = "#3B82F6"
): void {
  // Add accent bar on left
  slide.addShape(PptxGenJS.ShapeType.rect, {
    x: x - 0.1,
    y,
    w: 0.05,
    h: h,
    fill: { color: accentColor.replace("#", "") },
    line: { type: "none" }
  });
  
  // Add quote text
  slide.addText(quote, {
    x,
    y,
    w,
    h: h * 0.7,
    fontSize: 24,
    fontFace: "Georgia, serif",
    italic: true,
    color: "1F2937",
    align: "left",
    valign: "top"
  });
  
  // Add author attribution
  slide.addText(`— ${author}`, {
    x,
    y: y + (h * 0.7),
    w,
    h: h * 0.3,
    fontSize: 16,
    fontFace: "Arial, sans-serif",
    color: "6B7280",
    align: "left",
    valign: "bottom"
  });
}

/**
 * Add callout box with icon
 */
export function addCalloutBox(
  slide: any,
  title: string,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  variant: "info" | "success" | "warning" | "danger" = "info"
): void {
  const colors = {
    info: { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF" },
    success: { bg: "#D1FAE5", border: "#10B981", text: "#065F46" },
    warning: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
    danger: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" }
  };
  
  const color = colors[variant];
  
  // Background box
  slide.addShape(PptxGenJS.ShapeType.rect, {
    x,
    y,
    w,
    h,
    fill: { color: color.bg.replace("#", "") },
    line: { color: color.border.replace("#", ""), width: 2 },
    rectRadius: 0.1
  });
  
  // Title
  slide.addText(title, {
    x: x + 0.2,
    y: y + 0.15,
    w: w - 0.4,
    h: 0.3,
    fontSize: 16,
    bold: true,
    color: color.text.replace("#", ""),
    fontFace: "Arial, sans-serif"
  });
  
  // Body text
  slide.addText(text, {
    x: x + 0.2,
    y: y + 0.5,
    w: w - 0.4,
    h: h - 0.65,
    fontSize: 14,
    color: color.text.replace("#", ""),
    fontFace: "Arial, sans-serif",
    valign: "top"
  });
}

/**
 * Add highlighted text (background highlight)
 */
export function addHighlightedText(
  slide: any,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  highlightColor: string = "#FEF3C7",
  textColor: string = "#000000",
  options: any = {}
): void {
  // Add highlight background
  slide.addShape(PptxGenJS.ShapeType.rect, {
    x: x - 0.05,
    y: y - 0.05,
    w: w + 0.1,
    h: h + 0.1,
    fill: { color: highlightColor.replace("#", ""), transparency: 30 },
    line: { type: "none" }
  });
  
  // Add text on top
  slide.addText(text, {
    x,
    y,
    w,
    h,
    color: textColor.replace("#", ""),
    ...options
  });
}

/**
 * Get font pairing recommendations
 */
export function getFontPairing(style: "professional" | "elegant" | "modern" | "bold" | "minimal"): {
  heading: string;
  body: string;
} {
  const pairings = {
    professional: { heading: "Calibri", body: "Calibri" },
    elegant: { heading: "Georgia", body: "Garamond" },
    modern: { heading: "Segoe UI", body: "Segoe UI" },
    bold: { heading: "Impact", body: "Arial" },
    minimal: { heading: "Arial", body: "Arial" }
  };
  
  return pairings[style] || pairings.professional;
}

