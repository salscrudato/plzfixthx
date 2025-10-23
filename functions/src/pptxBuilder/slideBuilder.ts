/**
 * Enhanced Slide Builder
 * Builds professional slides with design tokens and patterns
 */

import PptxGenJS from "pptxgenjs";
import type { SlideSpecV2 } from "../types/SlideSpecV2";
import {
  mapColorPalette,
  mapTypography,
  mapShadows,
  pxToIn,
  getTextOptions,
  getShapeOptions
} from "./designTokenMapper";
import { getRegionsForPattern, validatePatternRegions } from "./patterns";

/**
 * Build a professional slide with design tokens
 */
export async function buildProfessionalSlide(
  pptx: PptxGenJS,
  spec: SlideSpecV2
): Promise<void> {
  const slide = pptx.addSlide();

  // Map design tokens
  const colors = mapColorPalette(spec.styleTokens.palette);
  const typography = mapTypography(spec.styleTokens.typography);
  const shadows = mapShadows(spec.styleTokens.shadows);

  // Get regions based on design pattern
  const regions = getRegionsForPattern(spec.design.pattern, spec);

  if (!validatePatternRegions(regions)) {
    throw new Error("Invalid pattern regions");
  }

  // Apply background
  applyBackground(slide, spec, colors);

  // Render content elements
  renderTitle(slide, spec, regions, typography, colors);
  renderSubtitle(slide, spec, regions, typography, colors);
  renderBullets(slide, spec, regions, typography, colors);
  renderCallouts(slide, spec, regions, typography, colors, shadows);
  renderChart(slide, spec, regions, colors);
  renderImages(slide, spec, regions);
}

/**
 * Apply premium background styling with professional design
 */
function applyBackground(
  slide: any,
  spec: SlideSpecV2,
  colors: any
): void {
  // Premium background with subtle gradient or solid
  const bgColor = colors.background || "#F8FAFC";

  slide.background = {
    fill: bgColor,
    transparency: 0
  };

  // Add sophisticated accent bar for premium feel
  if (spec.design.pattern === "hero" || spec.design.pattern === "minimal") {
    // Add subtle accent line at top for visual interest
    slide.addShape(PptxGenJS.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: 0.08,
      fill: { color: spec.design.colorStrategy.emphasis },
      line: { type: "none" }
    });
  }

  // Add decorative accent bar for data-focused pattern
  if (spec.design.pattern === "data-focused") {
    slide.addShape(PptxGenJS.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.04,
      h: "100%",
      fill: { color: spec.design.colorStrategy.emphasis },
      line: { type: "none" }
    });
  }

  // Add subtle gradient overlay for split pattern
  if (spec.design.pattern === "split") {
    // Left accent
    slide.addShape(PptxGenJS.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.02,
      h: "100%",
      fill: { color: spec.design.colorStrategy.emphasis },
      line: { type: "none" }
    });
  }

  // Add asymmetric pattern accent
  if (spec.design.pattern === "asymmetric") {
    // Diagonal accent element for dynamic feel
    slide.addShape(PptxGenJS.ShapeType.rect, {
      x: 8.5,
      y: 0,
      w: 1.5,
      h: 0.06,
      fill: { color: spec.design.colorStrategy.emphasis },
      line: { type: "none" }
    });
  }

  // Add grid pattern subtle dividers
  if (spec.design.pattern === "grid") {
    // Subtle divider lines for grid structure
    const dividerColor = "#E5E7EB";
    slide.addShape(PptxGenJS.ShapeType.rect, {
      x: 5,
      y: 0.5,
      w: 0.01,
      h: 6.5,
      fill: { color: dividerColor },
      line: { type: "none" }
    });
    slide.addShape(PptxGenJS.ShapeType.rect, {
      x: 0.5,
      y: 3.75,
      w: 9,
      h: 0.01,
      fill: { color: dividerColor },
      line: { type: "none" }
    });
  }
}

/**
 * Render premium title with sophisticated styling
 */
function renderTitle(
  slide: any,
  spec: SlideSpecV2,
  regions: any,
  typography: any,
  colors: any
): void {
  const title = spec.content.title;
  if (!title) return;

  const titleAnchor = spec.layout.anchors.find((a: any) => a.refId === title.id);
  if (!titleAnchor) return;

  const rect = regions[titleAnchor.region];
  if (!rect) return;

  const titleConfig = spec.design.typography.hierarchy.title || {
    size: typography.title.fontSize,
    weight: 700,
    lineHeight: 1.2,
    letterSpacing: 0.5
  };

  // Premium title with enhanced spacing and color
  slide.addText(title.text, {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    fontFace: spec.design.typography.fontPairing.primary,
    fontSize: titleConfig.size,
    bold: titleConfig.weight >= 600,
    color: colors.primary || colors.text,
    align: spec.components?.title?.align || "left",
    valign: "middle",
    wrap: true,
    lineSpacing: titleConfig.lineHeight * 100
  });
}

/**
 * Render subtitle
 */
function renderSubtitle(
  slide: any,
  spec: SlideSpecV2,
  regions: any,
  typography: any,
  colors: any
): void {
  const subtitle = spec.content.subtitle;
  if (!subtitle) return;

  const subtitleAnchor = spec.layout.anchors.find((a: any) => a.refId === subtitle.id);
  if (!subtitleAnchor) return;

  const rect = regions[subtitleAnchor.region];
  if (!rect) return;

  const subtitleConfig = spec.design.typography.hierarchy.subtitle || {
    size: typography.subtitle.fontSize,
    weight: 500,
    lineHeight: 1.4
  };

  slide.addText(subtitle.text, {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    fontFace: spec.design.typography.fontPairing.secondary,
    fontSize: subtitleConfig.size,
    bold: subtitleConfig.weight >= 600,
    color: colors.text,
    align: "left",
    valign: "top",
    wrap: true,
    lineSpacing: subtitleConfig.lineHeight * 100
  });
}

/**
 * Render bullet points
 */
function renderBullets(
  slide: any,
  spec: SlideSpecV2,
  regions: any,
  typography: any,
  colors: any
): void {
  const bullets = spec.content.bullets?.[0];
  if (!bullets) return;

  const bulletAnchor = spec.layout.anchors.find((a: any) => a.refId === bullets.id);
  if (!bulletAnchor) return;

  const rect = regions[bulletAnchor.region];
  if (!rect) return;

  const bodyConfig = spec.design.typography.hierarchy.body || {
    size: typography.body.fontSize,
    weight: 400,
    lineHeight: 1.5
  };

  slide.addText(
    bullets.items.map((item: any) => ({
      text: item.text,
      options: { bullet: true, indentLevel: item.level - 1 }
    })),
    {
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      fontFace: spec.design.typography.fontPairing.secondary,
      fontSize: bodyConfig.size,
      bold: bodyConfig.weight >= 600,
      color: colors.text,
      wrap: true,
      lineSpacing: bodyConfig.lineHeight * 100
    }
  );
}

/**
 * Render callouts
 */
function renderCallouts(
  slide: any,
  spec: SlideSpecV2,
  regions: any,
  typography: any,
  colors: any,
  shadows: any
): void {
  const callout = spec.content.callouts?.[0];
  if (!callout) return;

  const calloutAnchor = spec.layout.anchors.find((a: any) => a.refId === callout.id);
  if (!calloutAnchor) return;

  const rect = regions[calloutAnchor.region];
  if (!rect) return;

  // Determine callout background and border colors based on variant
  const bgColor = getCalloutBackgroundColor(callout.variant, colors);
  const borderColor = getCalloutBorderColor(callout.variant, colors);

  // Add professional callout shape with premium styling
  slide.addShape(PptxGenJS.ShapeType.roundRect, {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    fill: { color: bgColor },
    line: { color: borderColor, width: 2 },
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.08,
      blur: 8,
      offset: 2
    }
  });

  // Add callout text
  const text = `${callout.title ? callout.title + " — " : ""}${callout.text}`;
  slide.addText(text, {
    x: rect.x + 0.15,
    y: rect.y + 0.15,
    w: rect.w - 0.3,
    h: rect.h - 0.3,
    fontFace: spec.design.typography.fontPairing.secondary,
    fontSize: typography.body.fontSize,
    color: colors.text,
    align: "left",
    valign: "middle",
    wrap: true
  });
}

/**
 * Get professional callout background color with premium styling
 */
function getCalloutBackgroundColor(variant: string, colors: any): string {
  switch (variant) {
    case "success":
      return "#ECFDF5"; // Premium light green
    case "warning":
      return "#FFFBEB"; // Premium light amber
    case "danger":
      return "#FEF2F2"; // Premium light red
    case "note":
    default:
      return "#F9FAFB"; // Premium light gray
  }
}

/**
 * Get professional callout border color
 */
function getCalloutBorderColor(variant: string, colors: any): string {
  switch (variant) {
    case "success":
      return "#10B981"; // Emerald
    case "warning":
      return "#F59E0B"; // Amber
    case "danger":
      return "#EF4444"; // Red
    case "note":
    default:
      return "#6B7280"; // Gray
  }
}

/**
 * Render chart with professional styling
 */
function renderChart(
  slide: any,
  spec: SlideSpecV2,
  regions: any,
  colors: any
): void {
  const dataViz = spec.content.dataViz;
  if (!dataViz) return;

  const chartAnchor = spec.layout.anchors.find((a: any) => a.refId === dataViz.id);
  if (!chartAnchor) return;

  const rect = regions[chartAnchor.region];
  if (!rect) return;

  const chartData = dataViz.series.map((s: any) => ({
    name: s.name,
    labels: dataViz.labels,
    values: s.values
  }));

  const chartType =
    dataViz.kind === "pie"
      ? PptxGenJS.ChartType.pie
      : dataViz.kind === "line"
      ? PptxGenJS.ChartType.line
      : PptxGenJS.ChartType.bar;

  // Premium color palette for charts
  const chartColors = [
    colors.primary || "#1E40AF",
    colors.accent || "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#7C3AED"
  ];

  const chartOptions: any = {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    chartColors: chartColors,
    showLegend: true,
    legendPos: dataViz.kind === "pie" ? "r" : "b",
    dataLabelFontSize: 11,
    dataLabelPosition: "ctr",
    showTitle: !!dataViz.title,
    title: dataViz.title || "",
    titleFontSize: 16,
    titleFontBold: true,
    titleFontFace: "Inter, Arial, sans-serif",
    titleColor: colors.text || "#0F172A",
    chartGridLine: { style: "solid", color: "#E2E8F0", size: 0.5 },
    showValue: true
  };

  // Add line smoothing for line charts
  if (dataViz.kind === "line") {
    chartOptions.lineSmooth = true;
  }

  slide.addChart(chartType, chartData, chartOptions);
}

/**
 * Render images
 */
function renderImages(
  slide: any,
  spec: SlideSpecV2,
  regions: any
): void {
  const placeholders = spec.content.imagePlaceholders;
  if (!placeholders) return;

  placeholders.forEach((placeholder: any) => {
    const imageAnchor = spec.layout.anchors.find((a: any) => a.refId === placeholder.id);
    if (!imageAnchor) return;

    const rect = regions[imageAnchor.region];
    if (!rect) return;

    // Add placeholder rectangle
    slide.addShape(PptxGenJS.ShapeType.rect, {
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      fill: { color: "#E5E7EB" },
      line: { color: "#D1D5DB", width: 1 }
    });

    // Add placeholder text
    slide.addText(placeholder.alt, {
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      fontSize: 12,
      color: "#6B7280",
      align: "center",
      valign: "middle"
    });
  });
}

