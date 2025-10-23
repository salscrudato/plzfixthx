/**
 * Shape Helpers for PowerPoint Slides
 * Professional shapes, arrows, and visual elements
 */

import PptxGenJS from "pptxgenjs";

/**
 * Add a professional arrow between two points
 */
export function addConnectorArrow(
  slide: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string = "#3B82F6",
  thickness: number = 3
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  slide.addShape("rightArrow", {
    x: x1,
    y: y1 - 0.08,
    w: length,
    h: 0.16,
    fill: { color: color.replace("#", "") },
    line: { type: "none" },
    rotate: angle,
  });
}

/**
 * Add a curved connector line
 */
export function addCurvedConnector(
  slide: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string = "#3B82F6",
  thickness: number = 2
): void {
  slide.addShape("line", {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: {
      color: color.replace("#", ""),
      width: thickness,
      endArrowType: "triangle",
      dashType: "solid",
    },
  });
}

/**
 * Add a callout box with pointer
 */
export function addCalloutBox(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  color: string = "#3B82F6",
  backgroundColor: string = "#EEF2FF"
): void {
  // Background box
  slide.addShape("roundRect", {
    x,
    y,
    w: width,
    h: height,
    fill: { color: backgroundColor.replace("#", "") },
    line: { color: color.replace("#", ""), width: 2 },
  });

  // Text
  slide.addText(text, {
    x: x + 0.1,
    y: y + 0.1,
    w: width - 0.2,
    h: height - 0.2,
    fontSize: 14,
    color: "#0F172A",
    fontFace: "Aptos",
    align: "center",
    valign: "middle",
    wrap: true,
  });
}

/**
 * Add a process flow diagram
 */
export function addProcessFlow(
  slide: any,
  steps: string[],
  startX: number,
  startY: number,
  stepWidth: number,
  stepHeight: number,
  spacing: number,
  color: string = "#3B82F6"
): void {
  let currentX = startX;

  steps.forEach((step, index) => {
    // Step box
    slide.addShape("roundRect", {
      x: currentX,
      y: startY,
      w: stepWidth,
      h: stepHeight,
      fill: { color: "#FFFFFF" },
      line: { color: color.replace("#", ""), width: 2 },
      shadow: {
        type: "outer",
        color: "000000",
        opacity: 0.1,
        blur: 8,
        offset: 2,
      },
    });

    // Step number badge
    slide.addShape("ellipse", {
      x: currentX + 0.05,
      y: startY + 0.05,
      w: 0.25,
      h: 0.25,
      fill: { color: color.replace("#", "") },
      line: { type: "none" },
    });

    slide.addText((index + 1).toString(), {
      x: currentX + 0.05,
      y: startY + 0.05,
      w: 0.25,
      h: 0.25,
      fontSize: 12,
      bold: true,
      color: "#FFFFFF",
      align: "center",
      valign: "middle",
    });

    // Step text
    slide.addText(step, {
      x: currentX + 0.1,
      y: startY + 0.35,
      w: stepWidth - 0.2,
      h: stepHeight - 0.4,
      fontSize: 12,
      color: "#0F172A",
      fontFace: "Aptos",
      align: "center",
      valign: "middle",
      wrap: true,
    });

    // Arrow to next step
    if (index < steps.length - 1) {
      addConnectorArrow(
        slide,
        currentX + stepWidth + 0.05,
        startY + stepHeight / 2,
        currentX + stepWidth + spacing - 0.05,
        startY + stepHeight / 2,
        color,
        2
      );
    }

    currentX += stepWidth + spacing;
  });
}

/**
 * Add a metric card
 */
export function addMetricCard(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  value: string,
  label: string,
  color: string = "#3B82F6"
): void {
  // Card background
  slide.addShape("roundRect", {
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
      offset: 2,
    },
  });

  // Accent bar
  slide.addShape("rect", {
    x,
    y,
    w: 0.08,
    h: height,
    fill: { color: color.replace("#", "") },
    line: { type: "none" },
  });

  // Value
  slide.addText(value, {
    x: x + 0.15,
    y: y + 0.15,
    w: width - 0.25,
    h: height * 0.6,
    fontSize: 32,
    bold: true,
    color: color.replace("#", ""),
    fontFace: "Aptos",
    align: "center",
    valign: "middle",
  });

  // Label
  slide.addText(label, {
    x: x + 0.15,
    y: y + height * 0.65,
    w: width - 0.25,
    h: height * 0.25,
    fontSize: 12,
    color: "#6B7280",
    fontFace: "Aptos",
    align: "center",
    valign: "middle",
  });
}

/**
 * Add a comparison box (for before/after, pros/cons)
 */
export function addComparisonBox(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  items: string[],
  color: string = "#3B82F6",
  isPositive: boolean = true
): void {
  // Background
  slide.addShape("roundRect", {
    x,
    y,
    w: width,
    h: height,
    fill: { color: "#FFFFFF" },
    line: { color: color.replace("#", ""), width: 2 },
  });

  // Header bar
  slide.addShape("rect", {
    x,
    y,
    w: width,
    h: 0.4,
    fill: { color: color.replace("#", "") },
    line: { type: "none" },
  });

  // Title
  slide.addText(title, {
    x,
    y,
    w: width,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: "#FFFFFF",
    fontFace: "Aptos",
    align: "center",
    valign: "middle",
  });

  // Items
  let currentY = y + 0.5;
  items.forEach((item) => {
    // Bullet icon
    const icon = isPositive ? "✓" : "✗";
    slide.addText(icon, {
      x: x + 0.1,
      y: currentY,
      w: 0.2,
      h: 0.25,
      fontSize: 12,
      color: color.replace("#", ""),
      align: "center",
      valign: "middle",
    });

    // Item text
    slide.addText(item, {
      x: x + 0.35,
      y: currentY,
      w: width - 0.45,
      h: 0.25,
      fontSize: 11,
      color: "#0F172A",
      fontFace: "Aptos",
      align: "left",
      valign: "middle",
      wrap: true,
    });

    currentY += 0.3;
  });
}

