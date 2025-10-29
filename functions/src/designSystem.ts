/**
 * Executive Design System
 * 
 * Professional slide design system inspired by McKinsey/BCG/Bain standards.
 * Defines slide masters, theme tokens, contrast checks, and grid utilities.
 * 
 * Design Principles:
 * - Baseline rhythm: 0.125in (≈12pt) vertical grid for consistent spacing
 * - Margins: 0.6in top/bottom, 0.9in left/right (executive standard)
 * - Grid: 12 cols × 8 rows for flexible layouts
 * - Typography: Aptos (Title 44pt, Subtitle 20-24pt, Body 16-20pt)
 * - Contrast: WCAG AA minimum (4.5:1 text, 3:1 UI)
 * - Color: Professional palettes with semantic meaning
 */

import type PptxGenJS from "pptxgenjs";
import { contrastRatio } from "@plzfixthx/slide-spec";
import * as logger from "firebase-functions/logger";

/* -------------------------------------------------------------------------- */
/*                              Design Constants                               */
/* -------------------------------------------------------------------------- */

/**
 * Baseline rhythm unit (inches)
 * All vertical spacing should be multiples of this value
 */
export const BASELINE_RHYTHM = 0.125; // ≈12pt at 96dpi

/**
 * Executive slide margins (inches)
 * Based on McKinsey/BCG/Bain presentation standards
 */
export const EXECUTIVE_MARGINS = {
  top: 0.6,
  right: 0.9,
  bottom: 0.6,
  left: 0.9,
} as const;

/**
 * Standard grid configuration
 * 12 columns × 8 rows provides flexibility for most layouts
 */
export const STANDARD_GRID = {
  cols: 12,
  rows: 8,
  gutter: 0.125, // inches, matches baseline rhythm
} as const;

/**
 * Professional typography scale (points)
 * Fixed sizes based on consulting firm standards
 */
export const TYPOGRAPHY_SCALE = {
  display: 44, // Main title
  h1: 32, // Section headers
  h2: 24, // Subsection headers
  h3: 20, // Tertiary headers
  body: 16, // Body text
  small: 14, // Small text
  caption: 12, // Captions, footnotes
} as const;

/**
 * Font families with fallbacks
 */
export const FONT_FAMILIES = {
  primary: "Aptos, Calibri, Arial, sans-serif",
  secondary: "Calibri, Arial, sans-serif",
  monospace: "Consolas, Monaco, 'Courier New', monospace",
} as const;

/**
 * WCAG contrast requirements
 */
export const CONTRAST_REQUIREMENTS = {
  textAA: 4.5, // WCAG AA for normal text
  textAAA: 7.0, // WCAG AAA for normal text
  largeTextAA: 3.0, // WCAG AA for large text (18pt+)
  uiAA: 3.0, // WCAG AA for UI components
} as const;

/* -------------------------------------------------------------------------- */
/*                              Slide Master Definitions                       */
/* -------------------------------------------------------------------------- */

export interface SlideMasterConfig {
  title: string;
  background: { fill: string };
  objects?: Array<{
    type: "rect" | "text" | "line";
    options: any;
  }>;
  slideNumber?: {
    x: number;
    y: number;
    fontFace?: string;
    fontSize?: number;
    color?: string;
  };
}

/**
 * Define executive slide master with premium accents
 * 
 * Features:
 * - Left accent bar (0.15in) in primary color
 * - Subtle gradient glaze (top-right)
 * - Consistent margins and baseline grid
 * - Professional typography
 */
export function defineExecutiveMaster(
  _pptx: PptxGenJS,
  primaryColor: string = "#005EB8",
  backgroundColor: string = "#FFFFFF"
): void {
  const masterName = "EXECUTIVE_MASTER";

  // Note: PptxGenJS defineSlideMaster API
  // We'll apply these styles directly to slides for now
  // since PptxGenJS master support is limited

  logger.debug("Executive master defined", {
    masterName,
    primaryColor,
    backgroundColor
  });
}

/**
 * Apply executive master styling to a slide
 * 
 * This applies the executive design system to a slide:
 * - Background color
 * - Left accent bar
 * - Subtle gradient glaze
 * - Grid-aligned spacing
 */
export function applyExecutiveMaster(
  slide: PptxGenJS.Slide,
  pptx: PptxGenJS,
  primaryColor: string = "#005EB8",
  backgroundColor: string = "#FFFFFF"
): void {
  // Set background
  slide.background = { color: backgroundColor };

  // Premium left accent bar (0.15in, with subtle shadow)
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.15,
    h: getSlideDimensions(pptx).height,
    fill: { color: primaryColor },
    line: { type: "none" },
    shadow: { 
      type: "outer", 
      blur: 4, 
      offset: 2, 
      angle: 90, 
      color: "#000000", 
      opacity: 0.08 
    },
  });

  // Subtle gradient glaze (top-right, 12% opacity)
  const dims = getSlideDimensions(pptx);
  slide.addShape(pptx.ShapeType.rect, {
    x: dims.width - 4,
    y: 0,
    w: 4,
    h: 1.2,
    fill: {
      color: primaryColor,
      transparency: 88, // 12% opacity
    } as any,
    line: { type: "none" },
  });
}

/* -------------------------------------------------------------------------- */
/*                              Grid Utilities                                 */
/* -------------------------------------------------------------------------- */

export interface GridConfig {
  cols: number;
  rows: number;
  gutter: number; // inches
  margin: {
    t: number; // top (inches)
    r: number; // right (inches)
    b: number; // bottom (inches)
    l: number; // left (inches)
  };
}

export interface GridGeometry {
  originX: number; // inches
  originY: number; // inches
  colWidth: number; // inches
  rowHeight: number; // inches
  gutter: number; // inches
}

export interface GridRect {
  x: number; // inches
  y: number; // inches
  w: number; // inches
  h: number; // inches
}

/**
 * Get slide dimensions based on aspect ratio
 */
export function getSlideDimensions(
  _pptx: PptxGenJS,
  aspectRatio: "16:9" | "4:3" = "16:9"
): { width: number; height: number } {
  if (aspectRatio === "4:3") {
    return { width: 10, height: 7.5 };
  }
  return { width: 10, height: 5.625 };
}

/**
 * Compute grid geometry from configuration
 *
 * Calculates the actual dimensions and positions for grid cells
 * based on slide dimensions, margins, and gutter spacing.
 */
export function computeGrid(
  gridConfig: GridConfig,
  slideDims: { width: number; height: number }
): GridGeometry {
  const { cols, rows, gutter, margin } = gridConfig;

  // Calculate inner area (excluding margins)
  const innerWidth = Math.max(0, slideDims.width - margin.l - margin.r);
  const innerHeight = Math.max(0, slideDims.height - margin.t - margin.b);

  // Calculate cell dimensions
  const colWidth = (innerWidth - gutter * (cols - 1)) / cols;
  const rowHeight = (innerHeight - gutter * (rows - 1)) / rows;

  return {
    originX: margin.l,
    originY: margin.t,
    colWidth,
    rowHeight,
    gutter,
  };
}

/**
 * Compute grid geometry from design system defaults
 *
 * Uses STANDARD_GRID and EXECUTIVE_MARGINS for consistent,
 * professional slide layouts.
 */
export function computeGridFromDesignSystem(
  slideDims: { width: number; height: number }
): GridGeometry {
  const gridConfig: GridConfig = {
    cols: STANDARD_GRID.cols,
    rows: STANDARD_GRID.rows,
    gutter: STANDARD_GRID.gutter,
    margin: {
      t: EXECUTIVE_MARGINS.top,
      r: EXECUTIVE_MARGINS.right,
      b: EXECUTIVE_MARGINS.bottom,
      l: EXECUTIVE_MARGINS.left,
    },
  };

  return computeGrid(gridConfig, slideDims);
}

/**
 * Get rectangle for a grid region
 * 
 * Converts grid coordinates (col, row, colSpan, rowSpan) to
 * absolute slide coordinates (x, y, w, h) in inches.
 * 
 * @param grid - Grid geometry from computeGrid
 * @param col - Starting column (0-based)
 * @param row - Starting row (0-based)
 * @param colSpan - Number of columns to span
 * @param rowSpan - Number of rows to span
 */
export function gridRect(
  grid: GridGeometry,
  col: number,
  row: number,
  colSpan: number = 1,
  rowSpan: number = 1
): GridRect {
  const x = grid.originX + col * (grid.colWidth + grid.gutter);
  const y = grid.originY + row * (grid.rowHeight + grid.gutter);
  const w = colSpan * grid.colWidth + (colSpan - 1) * grid.gutter;
  const h = rowSpan * grid.rowHeight + (rowSpan - 1) * grid.gutter;
  
  return { x, y, w, h };
}

/**
 * Align position to baseline rhythm
 * 
 * Snaps a vertical position to the nearest baseline grid line
 * for consistent vertical spacing.
 */
export function alignToBaseline(position: number, rhythm: number = BASELINE_RHYTHM): number {
  return Math.round(position / rhythm) * rhythm;
}

/* -------------------------------------------------------------------------- */
/*                              Contrast Utilities                             */
/* -------------------------------------------------------------------------- */

/**
 * Ensure sufficient contrast between foreground and background colors
 * 
 * Returns the foreground color if contrast is sufficient,
 * otherwise returns a high-contrast alternative (black or white).
 * 
 * @param fgColor - Foreground color (hex)
 * @param bgColor - Background color (hex)
 * @param minContrast - Minimum required contrast ratio (default: WCAG AA)
 */
export function ensureContrast(
  fgColor: string,
  bgColor: string,
  minContrast: number = CONTRAST_REQUIREMENTS.textAA
): string {
  const ratio = contrastRatio(fgColor, bgColor);
  
  if (ratio >= minContrast) {
    return fgColor;
  }
  
  // Try black or white for better contrast
  const blackRatio = contrastRatio("#000000", bgColor);
  const whiteRatio = contrastRatio("#FFFFFF", bgColor);
  
  if (blackRatio >= minContrast && blackRatio > whiteRatio) {
    logger.warn("Contrast too low, using black", { 
      original: fgColor, 
      bg: bgColor, 
      ratio: ratio.toFixed(2),
      minContrast 
    });
    return "#000000";
  }
  
  if (whiteRatio >= minContrast) {
    logger.warn("Contrast too low, using white", { 
      original: fgColor, 
      bg: bgColor, 
      ratio: ratio.toFixed(2),
      minContrast 
    });
    return "#FFFFFF";
  }
  
  // If neither works, use the better of the two
  logger.error("Cannot achieve minimum contrast", { 
    fgColor, 
    bgColor, 
    ratio: ratio.toFixed(2),
    minContrast,
    blackRatio: blackRatio.toFixed(2),
    whiteRatio: whiteRatio.toFixed(2),
  });
  
  return blackRatio > whiteRatio ? "#000000" : "#FFFFFF";
}

