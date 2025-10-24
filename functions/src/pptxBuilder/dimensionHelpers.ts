/**
 * Dimension and Spacing Helpers
 * Centralized utilities for consistent slide dimensions and spacing
 * Supports both 16:9 and 4:3 aspect ratios
 */

import type { SlideSpecV1 } from "../types/SlideSpecV1";

/**
 * Slide dimensions by aspect ratio
 */
export interface SlideDims {
  wIn: number;  // width in inches
  hIn: number;  // height in inches
}

/**
 * Get slide dimensions based on aspect ratio
 */
export function getSlideDims(ar: "16:9" | "4:3"): SlideDims {
  if (ar === "4:3") {
    return { wIn: 10, hIn: 7.5 };
  }
  return { wIn: 10, hIn: 5.625 }; // 16:9 default
}

/**
 * Get slide dimensions from spec
 */
export function getSlideDimsFromSpec(spec: SlideSpecV1): SlideDims {
  return getSlideDims(spec.meta.aspectRatio);
}

/**
 * Convert pixels to inches
 */
export function pxToIn(px: number): number {
  return (px * 0.75) / 72;
}

/**
 * Convert inches to pixels
 */
export function inToPx(inches: number): number {
  return (inches * 72) / 0.75;
}

/**
 * Convert points to inches
 */
export function ptToIn(points: number): number {
  return points / 72;
}

/**
 * Convert inches to points
 */
export function inToPt(inches: number): number {
  return inches * 72;
}

/**
 * Calculate grid cell dimensions
 */
export interface GridCalcResult {
  cellWidth: number;
  cellHeight: number;
  gridWidth: number;
  gridHeight: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  gutterIn: number;
}

/**
 * Calculate grid dimensions from spec
 */
export function calculateGridDimensions(
  spec: SlideSpecV1,
  slideDims: SlideDims
): GridCalcResult {
  const { rows, cols, gutter, margin } = spec.layout.grid;
  
  const marginTop = pxToIn(margin.t);
  const marginRight = pxToIn(margin.r);
  const marginBottom = pxToIn(margin.b);
  const marginLeft = pxToIn(margin.l);
  const gutterIn = pxToIn(gutter);

  const gridWidth = slideDims.wIn - marginLeft - marginRight;
  const gridHeight = slideDims.hIn - marginTop - marginBottom;
  
  const cellWidth = (gridWidth - (cols - 1) * gutterIn) / cols;
  const cellHeight = (gridHeight - (rows - 1) * gutterIn) / rows;

  return {
    cellWidth,
    cellHeight,
    gridWidth,
    gridHeight,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    gutterIn
  };
}

/**
 * Calculate region bounds from grid
 */
export interface RegionBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Calculate region bounds
 */
export function calculateRegionBounds(
  region: any,
  gridCalc: GridCalcResult
): RegionBounds {
  const x = gridCalc.marginLeft + (region.colStart - 1) * (gridCalc.cellWidth + gridCalc.gutterIn);
  const y = gridCalc.marginTop + (region.rowStart - 1) * (gridCalc.cellHeight + gridCalc.gutterIn);
  const w = region.colSpan * gridCalc.cellWidth + (region.colSpan - 1) * gridCalc.gutterIn;
  const h = region.rowSpan * gridCalc.cellHeight + (region.rowSpan - 1) * gridCalc.gutterIn;

  return { x, y, w, h };
}

/**
 * Calculate all region bounds
 */
export function calculateAllRegionBounds(
  spec: SlideSpecV1,
  gridCalc: GridCalcResult
): Record<string, RegionBounds> {
  const regions: Record<string, RegionBounds> = {};
  
  spec.layout.regions.forEach((region) => {
    regions[region.name] = calculateRegionBounds(region, gridCalc);
  });

  return regions;
}

/**
 * Fit text within bounds with ellipsis
 */
export function fitText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFace: string = "Aptos"
): { text: string; truncated: boolean } {
  // Rough estimate: average character width is ~0.5 * fontSize in points
  const charWidthIn = (fontSize * 0.5) / 72;
  const maxChars = Math.floor(maxWidth / charWidthIn);

  if (text.length <= maxChars) {
    return { text, truncated: false };
  }

  return {
    text: text.substring(0, Math.max(0, maxChars - 3)) + "...",
    truncated: true
  };
}

/**
 * Calculate text height for wrapping
 */
export function calculateTextHeight(
  text: string,
  width: number,
  fontSize: number,
  fontFace: string = "Aptos"
): number {
  // Rough estimate: average character width is ~0.5 * fontSize in points
  const charWidthIn = (fontSize * 0.5) / 72;
  const charsPerLine = Math.floor(width / charWidthIn);
  const lines = Math.ceil(text.length / charsPerLine);
  
  // Line height is typically 1.2-1.5x font size
  const lineHeightIn = (fontSize * 1.3) / 72;
  
  return lines * lineHeightIn;
}

/**
 * Ensure WCAG contrast ratio >= 4.5:1
 */
export function ensureContrast(
  foreground: string,
  background: string,
  minRatio: number = 4.5
): { foreground: string; background: string; ratio: number; compliant: boolean } {
  // Parse hex colors
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return {
      foreground,
      background,
      ratio: 0,
      compliant: false
    };
  }

  // Calculate relative luminance
  const fgLum = getRelativeLuminance(fgRgb);
  const bgLum = getRelativeLuminance(bgRgb);

  // Calculate contrast ratio
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  // If not compliant, adjust background
  let finalBg = background;
  if (ratio < minRatio) {
    // Adjust background to be lighter or darker based on foreground luminance
    finalBg = fgLum > 0.5
      ? "#FFFFFF"  // Use white background for dark text
      : "#000000"; // Use black background for light text

    // Recalculate with adjusted background
    const adjustedBgRgb = hexToRgb(finalBg);
    if (adjustedBgRgb) {
      const adjustedBgLum = getRelativeLuminance(adjustedBgRgb);
      const adjustedLighter = Math.max(fgLum, adjustedBgLum);
      const adjustedDarker = Math.min(fgLum, adjustedBgLum);
      const adjustedRatio = (adjustedLighter + 0.05) / (adjustedDarker + 0.05);

      return {
        foreground,
        background: finalBg,
        ratio: adjustedRatio,
        compliant: adjustedRatio >= minRatio
      };
    }
  }

  return {
    foreground,
    background: finalBg,
    ratio,
    compliant: ratio >= minRatio
  };
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

/**
 * Get relative luminance for contrast calculation
 */
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Validate bullet count
 */
export function validateBulletCount(
  bullets: any[] | undefined,
  maxBullets: number = 6
): { valid: boolean; count: number; message: string } {
  const count = bullets?.reduce((sum, b) => sum + (b.items?.length || 0), 0) || 0;

  return {
    valid: count <= maxBullets,
    count,
    message: count <= maxBullets
      ? `${count} bullets (OK)`
      : `${count} bullets exceeds max of ${maxBullets}`
  };
}

/**
 * Validate dataViz series
 */
export function validateDataVizSeries(
  dataViz: any | undefined
): { valid: boolean; message: string } {
  if (!dataViz) {
    return { valid: true, message: "No dataViz" };
  }

  const { labels, series } = dataViz;
  const labelsLen = labels?.length || 0;
  const seriesLen = series?.length || 0;

  // Empty series is invalid
  if (seriesLen === 0) {
    return { valid: false, message: "No series data provided" };
  }

  for (const s of series || []) {
    if (s.values?.length !== labelsLen) {
      return {
        valid: false,
        message: `Series "${s.name}" has ${s.values?.length} values but ${labelsLen} labels`
      };
    }
  }

  return { valid: true, message: "DataViz series valid" };
}

