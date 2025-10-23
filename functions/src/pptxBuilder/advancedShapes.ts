/**
 * Advanced Shapes and Visual Elements for Premium PowerPoint Slides
 * Provides sophisticated decorative and functional elements
 * Inspired by Apple, Google, Tesla, and ChatGPT design systems
 */

import PptxGenJS from "pptxgenjs";

/**
 * Add a directional arrow with professional styling
 */
export function addDirectionalArrow(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  direction: "right" | "left" | "up" | "down",
  color: string,
  thickness: number = 3
): void {
  const arrowShapes: Record<string, string> = {
    right: "rightArrow",
    left: "leftArrow",
    up: "upArrow",
    down: "downArrow"
  };

  slide.addShape(arrowShapes[direction], {
    x,
    y,
    w: width,
    h: height,
    fill: { color },
    line: { type: "none" },
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.1,
      blur: 4,
      offset: 2
    }
  });
}

/**
 * Add a curved connector between two points
 */
export function addCurvedConnector(
  slide: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  thickness: number = 2
): void {
  // Use a curved connector shape
  slide.addShape("curve", {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.abs(x2 - x1) || 0.1,
    h: Math.abs(y2 - y1) || 0.1,
    line: { color, width: thickness },
    fill: { type: "none" }
  });
}

/**
 * Add a professional progress bar
 */
export function addProgressBar(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  percentage: number,
  color: string,
  backgroundColor: string = "#E5E7EB"
): void {
  // Background bar
  slide.addShape("roundRect", {
    x,
    y,
    w: width,
    h: height,
    fill: { color: backgroundColor },
    line: { type: "none" }
  });

  // Progress fill
  const fillWidth = (width * Math.min(percentage, 100)) / 100;
  slide.addShape("roundRect", {
    x,
    y,
    w: fillWidth,
    h: height,
    fill: { color },
    line: { type: "none" }
  });

  // Percentage text
  slide.addText(`${Math.round(percentage)}%`, {
    x: x + width + 0.1,
    y: y - 0.05,
    w: 0.4,
    h: height + 0.1,
    fontSize: 11,
    bold: true,
    color,
    align: "left",
    valign: "middle"
  });
}

/**
 * Add a numbered step indicator
 */
export function addStepIndicator(
  slide: any,
  x: number,
  y: number,
  stepNumber: number,
  totalSteps: number,
  color: string,
  size: number = 0.4
): void {
  // Circle background
  slide.addShape("ellipse", {
    x,
    y,
    w: size,
    h: size,
    fill: { color },
    line: { type: "none" },
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.12,
      blur: 6,
      offset: 2
    }
  });

  // Step number
  slide.addText(stepNumber.toString(), {
    x,
    y,
    w: size,
    h: size,
    fontSize: 16,
    bold: true,
    color: "#FFFFFF",
    align: "center",
    valign: "middle",
    fontFace: "Inter, Arial, sans-serif"
  });
}

/**
 * Add a comparison box with two columns
 */
export function addComparisonBox(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  leftLabel: string,
  rightLabel: string,
  leftColor: string,
  rightColor: string
): void {
  const halfWidth = width / 2;
  const dividerX = x + halfWidth;

  // Left box
  slide.addShape("rect", {
    x,
    y,
    w: halfWidth - 0.05,
    h: height,
    fill: { color: leftColor, transparency: 90 },
    line: { color: leftColor, width: 2 }
  });

  // Right box
  slide.addShape("rect", {
    x: dividerX + 0.05,
    y,
    w: halfWidth - 0.05,
    h: height,
    fill: { color: rightColor, transparency: 90 },
    line: { color: rightColor, width: 2 }
  });

  // Left label
  slide.addText(leftLabel, {
    x,
    y: y + height + 0.1,
    w: halfWidth,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: leftColor,
    align: "center"
  });

  // Right label
  slide.addText(rightLabel, {
    x: dividerX,
    y: y + height + 0.1,
    w: halfWidth,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: rightColor,
    align: "center"
  });
}

/**
 * Add a highlight badge with icon-like appearance
 */
export function addHighlightBadge(
  slide: any,
  x: number,
  y: number,
  text: string,
  color: string,
  backgroundColor: string = "#FFFFFF"
): void {
  const width = 1.5;
  const height = 0.4;

  // Badge background
  slide.addShape("roundRect", {
    x,
    y,
    w: width,
    h: height,
    fill: { color: backgroundColor },
    line: { color, width: 2 },
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.1,
      blur: 4,
      offset: 1
    }
  });

  // Badge text
  slide.addText(text, {
    x,
    y,
    w: width,
    h: height,
    fontSize: 11,
    bold: true,
    color,
    align: "center",
    valign: "middle",
    fontFace: "Inter, Arial, sans-serif"
  });
}

/**
 * Add a subtle background shape for emphasis
 */
export function addEmphasisBackground(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  opacity: number = 0.08,
  borderRadius: number = 0.15
): void {
  slide.addShape("roundRect", {
    x,
    y,
    w: width,
    h: height,
    fill: { color, transparency: Math.round((1 - opacity) * 100) },
    line: { type: "none" }
  });
}

/**
 * Add a vertical divider line
 */
export function addVerticalDivider(
  slide: any,
  x: number,
  y: number,
  height: number,
  color: string = "#E5E7EB",
  thickness: number = 0.02
): void {
  slide.addShape("rect", {
    x,
    y,
    w: thickness,
    h: height,
    fill: { color },
    line: { type: "none" }
  });
}

/**
 * Add a horizontal divider line
 */
export function addHorizontalDivider(
  slide: any,
  x: number,
  y: number,
  width: number,
  color: string = "#E5E7EB",
  thickness: number = 0.02
): void {
  slide.addShape("rect", {
    x,
    y,
    w: width,
    h: thickness,
    fill: { color },
    line: { type: "none" }
  });
}

