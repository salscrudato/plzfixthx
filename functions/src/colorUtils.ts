/**
 * Color Utility Functions
 * - Contrast ratio calculation (WCAG)
 * - Color manipulation and validation
 * - Nearest compliant color finding
 */

/** Convert hex to RGB */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").slice(0, 6);
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

/** Convert RGB to hex */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

/** Calculate relative luminance (WCAG) */
export function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((x) => x / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Calculate contrast ratio (WCAG) */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Validate hex color format */
export function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Find nearest compliant color from a palette
 * Ensures the color has sufficient contrast with white background
 */
export function nearestCompliantColor(
  targetColor: string,
  palette: string[],
  minContrast: number = 4.5
): string {
  if (!isValidHex(targetColor)) {
    return palette[0] || "#1E40AF";
  }

  // Check if target color is already compliant
  const targetContrast = contrastRatio(targetColor, "#FFFFFF");
  if (targetContrast >= minContrast) {
    return targetColor;
  }

  // Find best compliant color from palette
  let bestColor = palette[0] || "#1E40AF";
  let bestContrast = contrastRatio(bestColor, "#FFFFFF");

  for (const color of palette) {
    if (!isValidHex(color)) continue;
    const contrast = contrastRatio(color, "#FFFFFF");
    if (contrast >= minContrast && contrast > bestContrast) {
      bestColor = color;
      bestContrast = contrast;
    }
  }

  return bestColor;
}

/**
 * Lighten a color by a percentage (0-100)
 */
export function lighten(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex);
  const factor = 1 + percent / 100;
  return rgbToHex(
    Math.min(255, Math.round(r * factor)),
    Math.min(255, Math.round(g * factor)),
    Math.min(255, Math.round(b * factor))
  );
}

/**
 * Darken a color by a percentage (0-100)
 */
export function darken(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex);
  const factor = 1 - percent / 100;
  return rgbToHex(
    Math.max(0, Math.round(r * factor)),
    Math.max(0, Math.round(g * factor)),
    Math.max(0, Math.round(b * factor))
  );
}

/**
 * Mix two colors by percentage
 */
export function mix(hex1: string, hex2: string, percent: number): string {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const factor = percent / 100;
  return rgbToHex(
    Math.round(r1 * (1 - factor) + r2 * factor),
    Math.round(g1 * (1 - factor) + g2 * factor),
    Math.round(b1 * (1 - factor) + b2 * factor)
  );
}

