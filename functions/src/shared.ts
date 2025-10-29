/**
 * Shared Backend Utilities Module
 * ================================
 * Centralized utilities for Cloud Functions layer.
 * Includes: color utilities, typography helpers, layout calculations, and error mapping.
 * All functions are pure and side-effect free.
 */

/* -------------------------------------------------------------------------- */
/*                            Color Utilities                                 */
/* -------------------------------------------------------------------------- */

/**
 * Convert hex color to RGB tuple
 * @param hex - Hex color string (e.g., "#FF0000")
 * @returns [r, g, b] tuple with values 0-255
 */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").slice(0, 6);
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return [r, g, b];
}

/**
 * Convert RGB to hex color
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number): string => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Calculate relative luminance per WCAG 2.2
 * @param hex - Hex color string
 * @returns Luminance value (0-1)
 */
export function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((x) => x / 255);
  const lin = (c: number): number => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Calculate contrast ratio per WCAG 2.2
 * @param hex1 - First hex color
 * @param hex2 - Second hex color
 * @returns Contrast ratio (1-21)
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Validate hex color format
 * @param color - Color string to validate
 * @returns True if valid 6-digit hex
 */
export function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Convert opacity (0-1) to PPTX transparency (0-100)
 * @param opacity - Opacity value (0-1)
 * @returns PPTX transparency value (0-100)
 */
export function opacityToTransparency(opacity: number): number {
  return Math.round((1 - Math.max(0, Math.min(1, opacity))) * 100);
}

/**
 * Convert PPTX transparency (0-100) to opacity (0-1)
 * @param transparency - PPTX transparency value (0-100)
 * @returns Opacity value (0-1)
 */
export function transparencyToOpacity(transparency: number): number {
  return 1 - Math.max(0, Math.min(100, transparency)) / 100;
}

/**
 * Add alpha transparency to hex color (for CSS/frontend use)
 * @param hex - Hex color string
 * @param alpha - Alpha value (0-1)
 * @returns Hex color with alpha (8-digit)
 */
export function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const [r, g, b] = clean.split("").map((c) => c + c);
    return `#${r}${g}${b}${a}`;
  }
  if (clean.length === 6) return `#${clean}${a}`;
  return hex;
}

/* -------------------------------------------------------------------------- */
/*                          Typography Helpers                                */
/* -------------------------------------------------------------------------- */

/**
 * Pixel to inch conversion (96 DPI standard)
 */
export const PX_PER_INCH = 96;

/**
 * Convert pixels to inches
 * @param px - Pixel value
 * @returns Inch value
 */
export function pxToIn(px: number): number {
  return px / PX_PER_INCH;
}

/**
 * Convert inches to pixels
 * @param inches - Inch value
 * @returns Pixel value
 */
export function inToPx(inches: number): number {
  return inches * PX_PER_INCH;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateWithEllipsis(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Calculate optimal font size based on available space
 * @param text - Text to measure
 * @param maxWidth - Maximum width in pixels
 * @param baseFontSize - Base font size
 * @returns Optimal font size
 */
export function calculateOptimalFontSize(
  text: string,
  maxWidth: number,
  baseFontSize: number = 16
): number {
  const charWidth = baseFontSize * 0.6; // Approximate character width
  const estimatedWidth = text.length * charWidth;
  if (estimatedWidth <= maxWidth) return baseFontSize;
  return Math.max(8, Math.floor((maxWidth / estimatedWidth) * baseFontSize));
}

/* -------------------------------------------------------------------------- */
/*                          Error Mapping                                     */
/* -------------------------------------------------------------------------- */

/**
 * Map API errors to user-friendly messages
 * @param error - Error object or message
 * @returns User-friendly error message
 */
export function mapErrorToMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    if (error.message.includes("network")) {
      return "Network error. Please check your connection.";
    }
    if (error.message.includes("401") || error.message.includes("unauthorized")) {
      return "Authentication failed. Please refresh and try again.";
    }
    if (error.message.includes("429") || error.message.includes("rate limit")) {
      return "Too many requests. Please wait a moment and try again.";
    }
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}

/* -------------------------------------------------------------------------- */
/*                          Layout Calculations                               */
/* -------------------------------------------------------------------------- */

/**
 * Calculate grid cell dimensions
 * @param totalWidth - Total width in inches
 * @param totalHeight - Total height in inches
 * @param cols - Number of columns
 * @param rows - Number of rows
 * @param gutter - Gutter size in inches
 * @param margin - Margin object {t, r, b, l} in inches
 * @returns Cell dimensions {width, height} in inches
 */
export function calculateCellDimensions(
  totalWidth: number,
  totalHeight: number,
  cols: number,
  rows: number,
  gutter: number,
  margin: { t: number; r: number; b: number; l: number }
): { width: number; height: number } {
  const availableWidth = totalWidth - margin.l - margin.r - gutter * (cols - 1);
  const availableHeight = totalHeight - margin.t - margin.b - gutter * (rows - 1);
  return {
    width: availableWidth / cols,
    height: availableHeight / rows,
  };
}

/**
 * Calculate region position in grid
 * @param rowStart - Starting row (1-indexed)
 * @param colStart - Starting column (1-indexed)
 * @param rowSpan - Number of rows to span
 * @param colSpan - Number of columns to span
 * @param cellWidth - Width of each cell in inches
 * @param cellHeight - Height of each cell in inches
 * @param gutter - Gutter size in inches
 * @param margin - Margin object in inches
 * @returns Position {x, y, width, height} in inches
 */
export function calculateRegionPosition(
  rowStart: number,
  colStart: number,
  rowSpan: number,
  colSpan: number,
  cellWidth: number,
  cellHeight: number,
  gutter: number,
  margin: { t: number; r: number; b: number; l: number }
): { x: number; y: number; width: number; height: number } {
  const x = margin.l + (colStart - 1) * (cellWidth + gutter);
  const y = margin.t + (rowStart - 1) * (cellHeight + gutter);
  const width = colSpan * cellWidth + (colSpan - 1) * gutter;
  const height = rowSpan * cellHeight + (rowSpan - 1) * gutter;
  return { x, y, width, height };
}

