/**
 * Hybrid Slide Builder
 * Combines SVG backgrounds with PptxGenJS editable content
 * 
 * This approach gives us:
 * - Professional, Apple/Tesla-quality visual design (SVG)
 * - Editable, accessible content (PptxGenJS)
 * - Small file sizes
 * - Innovation and creativity
 */

import PptxGenJS from "pptxgenjs";
import { SlideSpecV1 } from "../types/SlideSpecV1";
import { generateBackgroundForSlide, svgToPngDataUrl } from "../svgGenerator";

const SLIDE_WIDTH = 10; // inches
const SLIDE_HEIGHT = 5.625; // inches (16:9 aspect ratio)

/**
 * Build slide using hybrid approach
 */
export async function buildHybridSlide(pptx: PptxGenJS, spec: SlideSpecV1): Promise<void> {
  const slide = pptx.addSlide();

  try {
    // Step 1: Generate SVG background with professional design
    const svgBackground = generateBackgroundForSlide(spec);

    // Step 2: Convert SVG to PNG and add as slide background
    const backgroundDataUrl = await svgToPngDataUrl(svgBackground, 1920, 1080);
    slide.background = { data: backgroundDataUrl };

    // Step 3: Add editable content on top using PptxGenJS
    await addEditableContent(slide, spec);
  } catch (error) {
    console.error("Error building hybrid slide:", error);
    // Fallback: use solid color background
    const bgColor = spec.styleTokens?.palette?.neutral?.[8] || "F8FAFC";
    slide.background = { color: bgColor.replace("#", "") };
    await addEditableContent(slide, spec);
  }
}

/**
 * Add editable content (text, bullets, metrics) on top of SVG background
 * Enhanced with better typography and spacing
 */
async function addEditableContent(slide: any, spec: SlideSpecV1): Promise<void> {
  const tokens = spec.styleTokens;
  const palette = tokens?.palette;
  const typography = tokens?.typography;

  // Colors - enhanced contrast
  const textColor = palette?.neutral?.[0] || "#0F172A";
  const subtitleColor = palette?.neutral?.[2] || "#64748B";
  const primaryColor = palette?.primary || "#6366F1";
  const accentColor = palette?.accent || "#10B981";

  // Typography - refined sizes
  const titleSize = typography?.sizes?.step_3 || 40;
  const subtitleSize = typography?.sizes?.step_1 || 20;
  const bodySize = typography?.sizes?.step_0 || 18;

  let currentY = 0.7; // Start position - slightly higher

  // Add Title with enhanced styling
  if (spec.content.title) {
    slide.addText(spec.content.title.text, {
      x: 0.7,
      y: currentY,
      w: SLIDE_WIDTH - 1.4,
      h: 1.0,
      fontSize: titleSize,
      bold: true,
      color: textColor.replace("#", ""),
      fontFace: typography?.fonts?.sans || "Aptos",
      align: "left",
      valign: "top",
      lineSpacing: 110, // Slightly tighter line spacing for titles
    });

    // Add subtle accent line under title
    slide.addShape("rect", {
      x: 0.7,
      y: currentY + 0.85,
      w: 2.5,
      h: 0.04,
      fill: { color: primaryColor.replace("#", "") },
      line: { type: "none" },
    });

    currentY += 1.3;
  }

  // Add Subtitle with refined styling
  if (spec.content.subtitle) {
    slide.addText(spec.content.subtitle.text, {
      x: 0.7,
      y: currentY,
      w: SLIDE_WIDTH - 1.4,
      h: 0.6,
      fontSize: subtitleSize,
      color: subtitleColor.replace("#", ""),
      fontFace: typography?.fonts?.sans || "Aptos",
      align: "left",
      valign: "top",
      lineSpacing: 130,
    });
    currentY += 0.9;
  }

  // Add Content with enhanced styling
  await addContent(slide, spec.content, currentY, {
    textColor,
    subtitleColor,
    primaryColor,
    accentColor,
    bodySize,
    palette,
    fontFace: typography?.fonts?.sans || "Aptos",
  });
}

/**
 * Add content (bullets, dataViz, etc.)
 */
async function addContent(
  slide: any,
  content: SlideSpecV1["content"],
  startY: number,
  colors: any
): Promise<void> {
  if (!content) return;

  let currentY = startY;

  // Bullets - Enhanced with better spacing and styling
  if (content.bullets && content.bullets.length > 0) {
    const allBulletItems: any[] = [];

    content.bullets.forEach((bulletGroup) => {
      bulletGroup.items.forEach((item) => {
        allBulletItems.push({
          text: item.text,
          options: {
            bullet: {
              code: "2022", // Bullet character
              color: colors.primaryColor.replace("#", ""),
            },
            indentLevel: item.level - 1,
            color: colors.textColor.replace("#", ""),
            fontSize: colors.bodySize,
            fontFace: colors.fontFace,
            paraSpaceBefore: 0,
            paraSpaceAfter: 4, // Reduced spacing between bullets
          },
        });
      });
    });

    slide.addText(allBulletItems, {
      x: 0.9,
      y: currentY,
      w: SLIDE_WIDTH - 1.8,
      h: SLIDE_HEIGHT - currentY - 0.6,
      fontSize: colors.bodySize,
      color: colors.textColor.replace("#", ""),
      fontFace: colors.fontFace,
      valign: "top",
      lineSpacing: 120, // Tighter line spacing
    });
  }

  // Data Visualization (chart)
  if (content.dataViz) {
    await addDataViz(slide, content.dataViz, currentY, colors);
  }

  // Callouts - Enhanced with better visual design
  if (content.callouts && content.callouts.length > 0) {
    content.callouts.forEach((callout, index) => {
      const y = currentY + index * 0.9;
      const calloutColor =
        callout.variant === "success" ? "#10B981" :
        callout.variant === "warning" ? "#F59E0B" :
        callout.variant === "danger" ? "#EF4444" :
        colors.primaryColor;

      const bgColor =
        callout.variant === "success" ? "#D1FAE5" :
        callout.variant === "warning" ? "#FEF3C7" :
        callout.variant === "danger" ? "#FEE2E2" :
        "#EEF2FF";

      // Add callout background with rounded corners
      slide.addShape("roundRect", {
        x: 0.9,
        y,
        w: SLIDE_WIDTH - 1.8,
        h: 0.7,
        fill: { color: bgColor.replace("#", "") },
        line: {
          color: calloutColor.replace("#", ""),
          width: 2,
        },
      });

      // Add left accent bar
      slide.addShape("rect", {
        x: 0.9,
        y,
        w: 0.08,
        h: 0.7,
        fill: { color: calloutColor.replace("#", "") },
        line: { type: "none" },
      });

      // Add callout text
      const displayText = callout.title ? `${callout.title}: ${callout.text}` : callout.text;
      slide.addText(displayText, {
        x: 1.1,
        y: y + 0.1,
        w: SLIDE_WIDTH - 2.2,
        h: 0.5,
        fontSize: colors.bodySize - 1,
        color: colors.textColor.replace("#", ""),
        fontFace: colors.fontFace,
        align: "left",
        valign: "middle",
        bold: !!callout.title,
      });
    });
  }
}

/**
 * Add data visualization (chart) to slide with enhanced styling
 */
async function addDataViz(slide: any, dataViz: any, startY: number, colors: any): Promise<void> {
  if (!dataViz || !dataViz.labels || dataViz.labels.length === 0) return;

  const chartKind = dataViz.kind || "bar";
  const chartWidth = SLIDE_WIDTH - 1.8;
  const chartHeight = SLIDE_HEIGHT - startY - 0.6;

  try {
    // Prepare chart data for PptxGenJS
    const chartDataFormatted = dataViz.series.map((series: any) => ({
      name: series.name,
      labels: dataViz.labels,
      values: series.values,
    }));

    // Map chart kind to PptxGenJS chart type
    const chartTypeMap: any = {
      bar: "bar",
      line: "line",
      pie: "pie",
      area: "area",
      scatter: "scatter",
      doughnut: "doughnut",
    };

    const chartType = chartTypeMap[chartKind] || "bar";

    // Enhanced chart colors - use a professional palette
    const chartColors = [
      colors.primaryColor.replace("#", ""),
      colors.accentColor.replace("#", ""),
      "#8B5CF6", // Purple
      "#F59E0B", // Amber
      "#10B981", // Emerald
      "#EF4444", // Red
    ];

    slide.addChart(chartType, chartDataFormatted, {
      x: 0.9,
      y: startY,
      w: chartWidth,
      h: chartHeight,
      showTitle: !!dataViz.title,
      title: dataViz.title || "",
      titleFontSize: 16,
      titleColor: colors.textColor.replace("#", ""),
      titleFontFace: colors.fontFace,
      showLegend: dataViz.series.length > 1,
      legendPos: "r", // Right position for legend
      legendFontSize: 11,
      legendColor: colors.subtitleColor?.replace("#", "") || colors.textColor.replace("#", ""),
      showValue: chartKind !== "line", // Show values except for line charts
      dataLabelFontSize: 10,
      dataLabelColor: colors.textColor.replace("#", ""),
      catAxisLabelColor: colors.subtitleColor?.replace("#", "") || colors.textColor.replace("#", ""),
      catAxisLabelFontSize: 11,
      valAxisLabelColor: colors.subtitleColor?.replace("#", "") || colors.textColor.replace("#", ""),
      valAxisLabelFontSize: 11,
      chartColors: chartColors,
      border: { pt: 1, color: colors.palette?.neutral?.[5]?.replace("#", "") || "E2E8F0" },
      plotArea: {
        fill: { color: "FFFFFF", transparency: 0 },
      },
    });
  } catch (error) {
    console.error("Error adding data visualization:", error);
  }
}

/**
 * Build multiple slides (for future use)
 */
export async function buildHybridSlides(pptx: PptxGenJS, specs: SlideSpecV1[]): Promise<void> {
  for (const spec of specs) {
    await buildHybridSlide(pptx, spec);
  }
}

