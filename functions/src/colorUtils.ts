/**
 * Color Utility Functions
 * - Contrast ratio calculation (WCAG)
 * - Color manipulation and validation
 * - Nearest compliant color finding
 *
 * Note: Core color utilities are in @plzfixthx/slide-spec to avoid duplication
 */

export { hexToRgb, rgbToHex, getLuminance, contrastRatio, isValidHex } from "@plzfixthx/slide-spec";
import { hexToRgb, rgbToHex, contrastRatio, isValidHex } from "@plzfixthx/slide-spec";

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

