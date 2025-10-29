/**
 * Style Synchronization
 * ====================
 * Ensures React preview matches PPTX output pixel-for-pixel through unified style definitions.
 */

import type { SlideSpecV1 } from "@/types/SlideSpecV1";
import { PX_PER_INCH } from "./shared";

/* -------------------------------------------------------------------------- */
/*                            Unit Conversions                                */
/* -------------------------------------------------------------------------- */

/**
 * Convert pixels to inches
 */
export function pxToInches(px: number): number {
  return px / PX_PER_INCH;
}

/**
 * Convert inches to pixels
 */
export function inchesToPx(inches: number): number {
  return inches * PX_PER_INCH;
}

/**
 * Convert inches to CSS string
 */
export function inchesToCss(inches: number): string {
  return `${inches}in`;
}

/* -------------------------------------------------------------------------- */
/*                            Typography Sync                                 */
/* -------------------------------------------------------------------------- */

export interface TypographySync {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  fontFamily: string;
}

/**
 * Get synchronized typography for title
 */
export function getTitleTypography(spec: SlideSpecV1): TypographySync {
  const t = spec.styleTokens?.typography;
  return {
    fontSize: t?.sizes.step_3 ?? 44,
    fontWeight: t?.weights.bold ?? 700,
    lineHeight: t?.lineHeights.compact ?? 1.2,
    letterSpacing: "0.5px",
    fontFamily: t?.fonts.sans ?? "Aptos, Calibri, Arial, sans-serif",
  };
}

/**
 * Get synchronized typography for subtitle
 */
export function getSubtitleTypography(spec: SlideSpecV1): TypographySync {
  const t = spec.styleTokens?.typography;
  return {
    fontSize: t?.sizes.step_1 ?? 20,
    fontWeight: t?.weights.medium ?? 500,
    lineHeight: t?.lineHeights.standard ?? 1.5,
    letterSpacing: "0.2px",
    fontFamily: t?.fonts.sans ?? "Aptos, Calibri, Arial, sans-serif",
  };
}

/**
 * Get synchronized typography for body text
 */
export function getBodyTypography(spec: SlideSpecV1): TypographySync {
  const t = spec.styleTokens?.typography;
  return {
    fontSize: t?.sizes.step_0 ?? 16,
    fontWeight: t?.weights.regular ?? 400,
    lineHeight: t?.lineHeights.standard ?? 1.5,
    letterSpacing: "0px",
    fontFamily: t?.fonts.sans ?? "Aptos, Calibri, Arial, sans-serif",
  };
}

/* -------------------------------------------------------------------------- */
/*                            Color Sync                                      */
/* -------------------------------------------------------------------------- */

/**
 * Get synchronized color palette
 */
export function getPaletteSync(spec: SlideSpecV1) {
  const palette = spec.styleTokens?.palette;
  return {
    primary: palette?.primary ?? "#6366F1",
    accent: palette?.accent ?? "#EC4899",
    neutral: palette?.neutral ?? [
      "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
      "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC",
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*                            Layout Sync                                     */
/* -------------------------------------------------------------------------- */

/**
 * Get synchronized layout dimensions
 */
export function getLayoutSync(spec: SlideSpecV1) {
  const layout = spec.layout;
  const grid = layout.grid;

  return {
    gridRows: grid.rows,
    gridCols: grid.cols,
    gutterPx: grid.gutter,
    marginTop: grid.margin.t,
    marginRight: grid.margin.r,
    marginBottom: grid.margin.b,
    marginLeft: grid.margin.l,
  };
}

/**
 * Get region dimensions in pixels
 */
export function getRegionDimensions(
  spec: SlideSpecV1,
  region: SlideSpecV1["layout"]["regions"][number],
  slideWidthPx: number,
  slideHeightPx: number
) {
  const layout = spec.layout;
  const grid = layout.grid;

  // Calculate cell dimensions
  const totalGutterWidth = (grid.cols - 1) * grid.gutter;
  const availableWidth = slideWidthPx - grid.margin.l - grid.margin.r - totalGutterWidth;
  const cellWidth = availableWidth / grid.cols;

  const totalGutterHeight = (grid.rows - 1) * grid.gutter;
  const availableHeight = slideHeightPx - grid.margin.t - grid.margin.b - totalGutterHeight;
  const cellHeight = availableHeight / grid.rows;

  // Calculate region position and size
  const x = grid.margin.l + (region.colStart - 1) * (cellWidth + grid.gutter);
  const y = grid.margin.t + (region.rowStart - 1) * (cellHeight + grid.gutter);
  const width = region.colSpan * cellWidth + (region.colSpan - 1) * grid.gutter;
  const height = region.rowSpan * cellHeight + (region.rowSpan - 1) * grid.gutter;

  return { x, y, width, height };
}

/* -------------------------------------------------------------------------- */
/*                            Accent Sync                                     */
/* -------------------------------------------------------------------------- */

/**
 * Get synchronized accent styles
 */
export function getAccentSync(spec: SlideSpecV1) {
  const palette = getPaletteSync(spec);

  return {
    // Left accent bar
    leftBar: {
      width: inchesToPx(0.12),
      height: "100%",
      background: palette.primary,
      boxShadow: "3px 0 12px rgba(0,0,0,0.15)",
    },
    // Top-right glaze
    topRightGlaze: {
      width: inchesToPx(3.0),
      height: inchesToPx(1.0),
      background: `${palette.accent}1a`, // 10% opacity
      borderRadius: 12,
    },
    // Bottom accent block
    bottomBlock: {
      width: inchesToPx(2.5),
      height: inchesToPx(0.6),
      background: `${palette.primary}0f`, // 6% opacity
      borderRadius: 8,
    },
    // Vertical accent line
    verticalLine: {
      width: inchesToPx(0.04),
      height: `calc(100% - ${inchesToPx(0.16)}px)`,
      background: `${palette.accent}1f`, // 12% opacity
      borderRadius: 2,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                            Responsive Sync                                 */
/* -------------------------------------------------------------------------- */

/**
 * Get responsive slide dimensions
 */
export function getResponsiveSlideDimensions(
  aspectRatio: "16:9" | "4:3",
  containerWidth: number
) {
  const ratio = aspectRatio === "16:9" ? 16 / 9 : 4 / 3;
  const width = containerWidth;
  const height = width / ratio;

  return { width, height };
}

/**
 * Calculate optimal font size for responsive rendering
 */
export function getResponsiveFontSize(
  baseFontSize: number,
  containerWidth: number
): number {
  // Scale font size based on container width (320px to 1920px range)
  const scale = Math.max(0.75, Math.min(1.25, containerWidth / 1024));
  return Math.round(baseFontSize * scale);
}

/* -------------------------------------------------------------------------- */
/*                            Style Validation                                */
/* -------------------------------------------------------------------------- */

/**
 * Validate that preview styles match PPTX output
 */
export function validateStyleSync(spec: SlideSpecV1): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check typography
  const title = getTitleTypography(spec);
  if (title.fontSize < 20 || title.fontSize > 60) {
    issues.push(`Title font size ${title.fontSize}px is outside recommended range (20-60px)`);
  }

  // Check colors
  const palette = getPaletteSync(spec);
  if (!isValidHexColor(palette.primary)) {
    issues.push(`Primary color ${palette.primary} is not a valid hex color`);
  }
  if (!isValidHexColor(palette.accent)) {
    issues.push(`Accent color ${palette.accent} is not a valid hex color`);
  }

  // Check layout
  const layout = getLayoutSync(spec);
  if (layout.gridRows < 3 || layout.gridRows > 12) {
    issues.push(`Grid rows ${layout.gridRows} is outside recommended range (3-12)`);
  }
  if (layout.gridCols < 3 || layout.gridCols > 12) {
    issues.push(`Grid cols ${layout.gridCols} is outside recommended range (3-12)`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Check if string is valid hex color
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}([0-9A-F]{2})?$/i.test(color);
}

/* -------------------------------------------------------------------------- */
/*                            Debug Utilities                                 */
/* -------------------------------------------------------------------------- */

/**
 * Log style sync information for debugging
 */
export function logStyleSync(spec: SlideSpecV1): void {
  console.group("Style Synchronization Debug");
  console.log("Typography:", {
    title: getTitleTypography(spec),
    subtitle: getSubtitleTypography(spec),
    body: getBodyTypography(spec),
  });
  console.log("Palette:", getPaletteSync(spec));
  console.log("Layout:", getLayoutSync(spec));
  console.log("Accents:", getAccentSync(spec));
  const validation = validateStyleSync(spec);
  console.log("Validation:", validation);
  console.groupEnd();
}

