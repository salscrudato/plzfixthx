/**
 * Enhanced Data Visualization
 * Advanced chart styling, annotations, and visual enhancements
 */

import PptxGenJS from "pptxgenjs";

export interface ChartAnnotation {
  label: string;
  value: number | string;
  x: number;
  y: number;
  color: string;
}

export interface DataVizConfig {
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  showGridlines?: boolean;
  showDataLabels?: boolean;
  annotations?: ChartAnnotation[];
  colors?: string[];
}

/**
 * Add a professional chart title with subtitle
 */
export function addChartHeader(
  slide: any,
  x: number,
  y: number,
  width: number,
  title: string,
  subtitle?: string,
  titleColor: string = "#0F172A",
  subtitleColor: string = "#64748B"
): void {
  // Title
  slide.addText(title, {
    x,
    y,
    w: width,
    h: 0.35,
    fontSize: 18,
    bold: true,
    color: titleColor,
    align: "left",
    fontFace: "Inter, Arial, sans-serif"
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x,
      y: y + 0.35,
      w: width,
      h: 0.25,
      fontSize: 12,
      color: subtitleColor,
      align: "left",
      fontFace: "Inter, Arial, sans-serif"
    });
  }
}

/**
 * Add data point annotations to chart
 */
export function addChartAnnotations(
  slide: any,
  annotations: ChartAnnotation[]
): void {
  annotations.forEach((annotation) => {
    // Annotation background
    slide.addShape("roundRect", {
      x: annotation.x - 0.3,
      y: annotation.y - 0.15,
      w: 0.6,
      h: 0.3,
      fill: { color: "#FFFFFF" },
      line: { color: annotation.color, width: 1.5 },
      shadow: {
        type: "outer",
        color: "000000",
        opacity: 0.1,
        blur: 3,
        offset: 1
      }
    });

    // Annotation text
    slide.addText(annotation.label, {
      x: annotation.x - 0.3,
      y: annotation.y - 0.15,
      w: 0.6,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: annotation.color,
      align: "center",
      valign: "middle"
    });
  });
}

/**
 * Add a legend with custom styling
 */
export function addCustomLegend(
  slide: any,
  x: number,
  y: number,
  items: Array<{ label: string; color: string }>,
  columns: number = 1
): void {
  const itemHeight = 0.25;
  const itemWidth = 2;
  const gap = 0.1;

  items.forEach((item, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const itemX = x + col * (itemWidth + gap);
    const itemY = y + row * (itemHeight + gap);

    // Color indicator
    slide.addShape("rect", {
      x: itemX,
      y: itemY + 0.05,
      w: 0.15,
      h: 0.15,
      fill: { color: item.color },
      line: { type: "none" }
    });

    // Label
    slide.addText(item.label, {
      x: itemX + 0.2,
      y: itemY,
      w: itemWidth - 0.2,
      h: itemHeight,
      fontSize: 11,
      color: "#334155",
      align: "left",
      valign: "middle"
    });
  });
}

/**
 * Add a data highlight box with key metric
 */
export function addMetricHighlight(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  metric: string,
  value: string,
  change?: string,
  changeColor?: string
): void {
  // Background
  slide.addShape("roundRect", {
    x,
    y,
    w: width,
    h: height,
    fill: { color: "#F8FAFC" },
    line: { color: "#E2E8F0", width: 1 },
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.06,
      blur: 4,
      offset: 1
    }
  });

  // Metric label
  slide.addText(metric, {
    x: x + 0.15,
    y: y + 0.1,
    w: width - 0.3,
    h: 0.2,
    fontSize: 11,
    color: "#64748B",
    align: "left"
  });

  // Value
  slide.addText(value, {
    x: x + 0.15,
    y: y + 0.35,
    w: width - 0.3,
    h: 0.35,
    fontSize: 24,
    bold: true,
    color: "#0F172A",
    align: "left"
  });

  // Change indicator
  if (change && changeColor) {
    slide.addText(change, {
      x: x + 0.15,
      y: y + height - 0.25,
      w: width - 0.3,
      h: 0.2,
      fontSize: 10,
      bold: true,
      color: changeColor,
      align: "left"
    });
  }
}

/**
 * Add a trend indicator (up/down arrow with percentage)
 */
export function addTrendIndicator(
  slide: any,
  x: number,
  y: number,
  percentage: number,
  isPositive: boolean = true
): void {
  const color = isPositive ? "#10B981" : "#EF4444";
  const arrow = isPositive ? "↑" : "↓";

  slide.addText(`${arrow} ${Math.abs(percentage)}%`, {
    x,
    y,
    w: 0.8,
    h: 0.25,
    fontSize: 12,
    bold: true,
    color,
    align: "center",
    valign: "middle"
  });
}

/**
 * Add a comparison bar between two values
 */
export function addComparisonBar(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number,
  value1: number,
  value2: number,
  label1: string,
  label2: string,
  color1: string,
  color2: string
): void {
  const maxValue = Math.max(value1, value2);
  const bar1Width = (value1 / maxValue) * width;
  const bar2Width = (value2 / maxValue) * width;

  // Bar 1
  slide.addShape("rect", {
    x,
    y,
    w: bar1Width,
    h: height / 2 - 0.05,
    fill: { color: color1 },
    line: { type: "none" }
  });

  // Label 1
  slide.addText(label1, {
    x: x + bar1Width + 0.1,
    y,
    w: 1,
    h: height / 2 - 0.05,
    fontSize: 10,
    color: "#334155",
    align: "left",
    valign: "middle"
  });

  // Bar 2
  slide.addShape("rect", {
    x,
    y: y + height / 2 + 0.05,
    w: bar2Width,
    h: height / 2 - 0.05,
    fill: { color: color2 },
    line: { type: "none" }
  });

  // Label 2
  slide.addText(label2, {
    x: x + bar2Width + 0.1,
    y: y + height / 2 + 0.05,
    w: 1,
    h: height / 2 - 0.05,
    fontSize: 10,
    color: "#334155",
    align: "left",
    valign: "middle"
  });
}

