/**
 * Coordinate Mapper
 * =================
 * Unified coordinate system for pixel-perfect PPTX generation matching preview.
 * Handles px↔in conversions, grid calculations, and region positioning.
 */

import type { SlideSpecV1 } from "@plzfixthx/slide-spec";

/* -------------------------------------------------------------------------- */
/*                            Constants                                       */
/* -------------------------------------------------------------------------- */

export const PX_PER_INCH = 96; // CSS standard (96 DPI)
export const SLIDE_WIDTH_IN = 10; // Standard 16:9 slide width
export const SLIDE_HEIGHT_16_9_IN = 5.625; // 16:9 aspect ratio
export const SLIDE_HEIGHT_4_3_IN = 7.5; // 4:3 aspect ratio

/* -------------------------------------------------------------------------- */
/*                            Unit Conversions                                */
/* -------------------------------------------------------------------------- */

/**
 * Convert pixels to inches
 */
export function pxToIn(px: number): number {
  return px / PX_PER_INCH;
}

/**
 * Convert inches to pixels
 */
export function inToPx(inches: number): number {
  return inches * PX_PER_INCH;
}

/**
 * Convert pixels to points (1 point = 1/72 inch)
 */
export function pxToPoints(px: number): number {
  return (px / PX_PER_INCH) * 72;
}

/**
 * Convert points to pixels
 */
export function pointsToPx(points: number): number {
  return (points / 72) * PX_PER_INCH;
}

/* -------------------------------------------------------------------------- */
/*                            Slide Dimensions                                */
/* -------------------------------------------------------------------------- */

/**
 * Get slide dimensions in inches
 */
export function getSlideDimensionsIn(aspectRatio: "16:9" | "4:3") {
  const width = SLIDE_WIDTH_IN;
  const height = aspectRatio === "16:9" ? SLIDE_HEIGHT_16_9_IN : SLIDE_HEIGHT_4_3_IN;
  return { width, height };
}

/**
 * Get slide dimensions in pixels
 */
export function getSlideDimensionsPx(aspectRatio: "16:9" | "4:3") {
  const { width, height } = getSlideDimensionsIn(aspectRatio);
  return {
    width: inToPx(width),
    height: inToPx(height),
  };
}

/* -------------------------------------------------------------------------- */
/*                            Grid Calculations                               */
/* -------------------------------------------------------------------------- */

export interface GridDimensions {
  cellWidthIn: number;
  cellHeightIn: number;
  cellWidthPx: number;
  cellHeightPx: number;
  totalWidthIn: number;
  totalHeightIn: number;
}

/**
 * Calculate grid cell dimensions
 */
export function calculateGridDimensions(
  spec: SlideSpecV1
): GridDimensions {
  const { width: slideWidthIn, height: slideHeightIn } = getSlideDimensionsIn(spec.meta.aspectRatio);
  const grid = spec.layout.grid;

  // Calculate available space after margins
  const availableWidthIn = slideWidthIn - grid.margin.l - grid.margin.r;
  const availableHeightIn = slideHeightIn - grid.margin.t - grid.margin.b;

  // Calculate gutter space
  const totalGutterWidthIn = pxToIn(grid.gutter * (grid.cols - 1));
  const totalGutterHeightIn = pxToIn(grid.gutter * (grid.rows - 1));

  // Calculate cell dimensions
  const cellWidthIn = (availableWidthIn - totalGutterWidthIn) / grid.cols;
  const cellHeightIn = (availableHeightIn - totalGutterHeightIn) / grid.rows;

  return {
    cellWidthIn,
    cellHeightIn,
    cellWidthPx: inToPx(cellWidthIn),
    cellHeightPx: inToPx(cellHeightIn),
    totalWidthIn: slideWidthIn,
    totalHeightIn: slideHeightIn,
  };
}

/* -------------------------------------------------------------------------- */
/*                            Region Positioning                              */
/* -------------------------------------------------------------------------- */

export interface RegionPosition {
  xIn: number;
  yIn: number;
  widthIn: number;
  heightIn: number;
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
}

/**
 * Calculate region position and dimensions
 */
export function calculateRegionPosition(
  spec: SlideSpecV1,
  region: SlideSpecV1["layout"]["regions"][number]
): RegionPosition {
  const grid = spec.layout.grid;
  const dims = calculateGridDimensions(spec);

  // Calculate position in inches
  const xIn = pxToIn(grid.margin.l) + (region.colStart - 1) * (dims.cellWidthIn + pxToIn(grid.gutter));
  const yIn = pxToIn(grid.margin.t) + (region.rowStart - 1) * (dims.cellHeightIn + pxToIn(grid.gutter));

  // Calculate size in inches
  const widthIn = region.colSpan * dims.cellWidthIn + (region.colSpan - 1) * pxToIn(grid.gutter);
  const heightIn = region.rowSpan * dims.cellHeightIn + (region.rowSpan - 1) * pxToIn(grid.gutter);

  return {
    xIn,
    yIn,
    widthIn,
    heightIn,
    xPx: inToPx(xIn),
    yPx: inToPx(yIn),
    widthPx: inToPx(widthIn),
    heightPx: inToPx(heightIn),
  };
}

/* -------------------------------------------------------------------------- */
/*                            Accent Positioning                              */
/* -------------------------------------------------------------------------- */

export interface AccentDimensions {
  leftBarWidthIn: number;
  topRightGlazeWidthIn: number;
  topRightGlazeHeightIn: number;
  bottomBlockWidthIn: number;
  bottomBlockHeightIn: number;
  verticalLineWidthIn: number;
}

/**
 * Get accent dimensions in inches
 */
export function getAccentDimensions(): AccentDimensions {
  return {
    leftBarWidthIn: 0.12,
    topRightGlazeWidthIn: 3.0,
    topRightGlazeHeightIn: 1.0,
    bottomBlockWidthIn: 2.5,
    bottomBlockHeightIn: 0.6,
    verticalLineWidthIn: 0.04,
  };
}

/* -------------------------------------------------------------------------- */
/*                            Typography Positioning                          */
/* -------------------------------------------------------------------------- */

export interface TextPosition {
  xIn: number;
  yIn: number;
  widthIn: number;
  heightIn: number;
  fontSizePt: number;
}

/**
 * Calculate text position for title
 */
export function calculateTitlePosition(): TextPosition {
  return {
    xIn: 0.5,
    yIn: 1.8,
    widthIn: 9.0,
    heightIn: 1.2,
    fontSizePt: 26,
  };
}

/**
 * Calculate text position for subtitle
 */
export function calculateSubtitlePosition(): TextPosition {
  return {
    xIn: 0.5,
    yIn: 3.1,
    widthIn: 9.0,
    heightIn: 1.5,
    fontSizePt: 16,
  };
}

/* -------------------------------------------------------------------------- */
/*                            Validation                                      */
/* -------------------------------------------------------------------------- */

/**
 * Validate coordinate mappings
 */
export function validateCoordinates(spec: SlideSpecV1): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const dims = calculateGridDimensions(spec);

  // Check cell dimensions are positive
  if (dims.cellWidthIn <= 0) {
    issues.push(`Cell width ${dims.cellWidthIn}in is not positive`);
  }
  if (dims.cellHeightIn <= 0) {
    issues.push(`Cell height ${dims.cellHeightIn}in is not positive`);
  }

  // Check regions fit within grid
  for (const region of spec.layout.regions) {
    if (region.colStart + region.colSpan - 1 > spec.layout.grid.cols) {
      issues.push(`Region exceeds grid columns: ${region.name}`);
    }
    if (region.rowStart + region.rowSpan - 1 > spec.layout.grid.rows) {
      issues.push(`Region exceeds grid rows: ${region.name}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/* -------------------------------------------------------------------------- */
/*                            Debug Utilities                                 */
/* -------------------------------------------------------------------------- */

/**
 * Log coordinate mappings for debugging
 */
export function logCoordinateMappings(spec: SlideSpecV1): void {
  console.group("Coordinate Mappings");
  console.log("Slide Dimensions:", getSlideDimensionsIn(spec.meta.aspectRatio));
  console.log("Grid Dimensions:", calculateGridDimensions(spec));
  console.log("Regions:");
  for (const region of spec.layout.regions) {
    console.log(`  ${region.name}:`, calculateRegionPosition(spec, region));
  }
  console.log("Accents:", getAccentDimensions());
  console.log("Validation:", validateCoordinates(spec));
  console.groupEnd();
}

