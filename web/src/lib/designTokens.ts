/**
 * Design Tokens & WCAG Compliance
 * ================================
 * Unified design system with WCAG 2.2 AA contrast compliance.
 */

import { contrastRatio } from "@plzfixthx/slide-spec";

/* -------------------------------------------------------------------------- */
/*                            WCAG Standards                                  */
/* -------------------------------------------------------------------------- */

export const WCAG_LEVELS = {
  AA_NORMAL: 4.5, // Normal text (14px+)
  AA_LARGE: 3, // Large text (18px+ or 14px+ bold)
  AAA_NORMAL: 7, // Enhanced normal text
  AAA_LARGE: 4.5, // Enhanced large text
} as const;

/* -------------------------------------------------------------------------- */
/*                            Color Palette                                   */
/* -------------------------------------------------------------------------- */

export const COLOR_PALETTES = {
  professional: {
    primary: "#6366F1", // Indigo
    accent: "#EC4899", // Pink
    neutral: [
      "#0F172A", // slate-900
      "#1E293B", // slate-800
      "#334155", // slate-700
      "#475569", // slate-600
      "#64748B", // slate-500
      "#94A3B8", // slate-400
      "#CBD5E1", // slate-300
      "#E2E8F0", // slate-200
      "#F8FAFC", // slate-50
    ],
  },
  corporate: {
    primary: "#1E40AF", // Blue
    accent: "#DC2626", // Red
    neutral: [
      "#111827", // gray-900
      "#1F2937", // gray-800
      "#374151", // gray-700
      "#4B5563", // gray-600
      "#6B7280", // gray-500
      "#9CA3AF", // gray-400
      "#D1D5DB", // gray-300
      "#E5E7EB", // gray-200
      "#F9FAFB", // gray-50
    ],
  },
  modern: {
    primary: "#0891B2", // Cyan
    accent: "#F59E0B", // Amber
    neutral: [
      "#0C0A09", // stone-950
      "#1C1917", // stone-900
      "#292524", // stone-800
      "#44403C", // stone-700
      "#57534E", // stone-600
      "#78716C", // stone-500
      "#A89968", // stone-400
      "#D6CDBF", // stone-300
      "#F5F5F4", // stone-50
    ],
  },
} as const;

/* -------------------------------------------------------------------------- */
/*                            Typography Scale                                */
/* -------------------------------------------------------------------------- */

export const TYPOGRAPHY_SCALE = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 44,
  },
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeights: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

/* -------------------------------------------------------------------------- */
/*                            Spacing Scale                                   */
/* -------------------------------------------------------------------------- */

export const SPACING_SCALE = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

/* -------------------------------------------------------------------------- */
/*                            Border Radius                                   */
/* -------------------------------------------------------------------------- */

export const BORDER_RADIUS = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  "3xl": 24,
  full: 9999,
} as const;

/* -------------------------------------------------------------------------- */
/*                            Shadows                                         */
/* -------------------------------------------------------------------------- */

export const SHADOWS = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
} as const;

/* -------------------------------------------------------------------------- */
/*                            WCAG Compliance                                 */
/* -------------------------------------------------------------------------- */

/**
 * Check if color pair meets WCAG AA standard for normal text
 */
export function meetsWCAG_AA_Normal(textColor: string, bgColor: string): boolean {
  const ratio = contrastRatio(textColor, bgColor);
  return ratio >= WCAG_LEVELS.AA_NORMAL;
}

/**
 * Check if color pair meets WCAG AA standard for large text
 */
export function meetsWCAG_AA_Large(textColor: string, bgColor: string): boolean {
  const ratio = contrastRatio(textColor, bgColor);
  return ratio >= WCAG_LEVELS.AA_LARGE;
}

/**
 * Check if color pair meets WCAG AAA standard for normal text
 */
export function meetsWCAG_AAA_Normal(textColor: string, bgColor: string): boolean {
  const ratio = contrastRatio(textColor, bgColor);
  return ratio >= WCAG_LEVELS.AAA_NORMAL;
}

/**
 * Check if color pair meets WCAG AAA standard for large text
 */
export function meetsWCAG_AAA_Large(textColor: string, bgColor: string): boolean {
  const ratio = contrastRatio(textColor, bgColor);
  return ratio >= WCAG_LEVELS.AAA_LARGE;
}

/**
 * Get contrast ratio between two colors
 */
export function getContrastRatio(textColor: string, bgColor: string): number {
  return contrastRatio(textColor, bgColor);
}

/**
 * Validate palette for WCAG compliance
 */
export function validatePaletteCompliance(
  palette: { primary: string; accent: string; neutral: string[] },
  bgColor: string = "#FFFFFF"
): {
  compliant: boolean;
  issues: string[];
  ratios: Record<string, number>;
} {
  const issues: string[] = [];
  const ratios: Record<string, number> = {};

  // Check primary color
  const primaryRatio = contrastRatio(palette.primary, bgColor);
  ratios.primary = primaryRatio;
  if (primaryRatio < WCAG_LEVELS.AA_NORMAL) {
    issues.push(`Primary color contrast ${primaryRatio.toFixed(2)} is below WCAG AA (4.5)`);
  }

  // Check accent color
  const accentRatio = contrastRatio(palette.accent, bgColor);
  ratios.accent = accentRatio;
  if (accentRatio < WCAG_LEVELS.AA_NORMAL) {
    issues.push(`Accent color contrast ${accentRatio.toFixed(2)} is below WCAG AA (4.5)`);
  }

  // Check neutral colors for text
  for (let i = 0; i < Math.min(3, palette.neutral.length); i++) {
    const neutralRatio = contrastRatio(palette.neutral[i], bgColor);
    ratios[`neutral_${i}`] = neutralRatio;
    if (i === 0 && neutralRatio < WCAG_LEVELS.AA_NORMAL) {
      issues.push(`Neutral[${i}] contrast ${neutralRatio.toFixed(2)} is below WCAG AA (4.5)`);
    }
  }

  return {
    compliant: issues.length === 0,
    issues,
    ratios,
  };
}

/* -------------------------------------------------------------------------- */
/*                            Accent Effects                                  */
/* -------------------------------------------------------------------------- */

export const ACCENT_EFFECTS = {
  // Subtle glow
  subtleGlow: (color: string) => `0 0 8px ${color}20`,
  // Medium glow
  mediumGlow: (color: string) => `0 0 16px ${color}40`,
  // Strong glow
  strongGlow: (color: string) => `0 0 24px ${color}60`,
  // Inset shadow
  insetShadow: (color: string) => `inset 0 2px 4px ${color}20`,
} as const;

/* -------------------------------------------------------------------------- */
/*                            Debug Utilities                                 */
/* -------------------------------------------------------------------------- */

/**
 * Log design tokens for debugging
 */
export function logDesignTokens(): void {
  console.group("Design Tokens");
  console.log("Color Palettes:", COLOR_PALETTES);
  console.log("Typography Scale:", TYPOGRAPHY_SCALE);
  console.log("Spacing Scale:", SPACING_SCALE);
  console.log("Border Radius:", BORDER_RADIUS);
  console.log("Shadows:", SHADOWS);
  console.groupEnd();
}

/**
 * Log WCAG compliance for palette
 */
export function logWCAGCompliance(palette: { primary: string; accent: string; neutral: string[] }): void {
  const validation = validatePaletteCompliance(palette);
  console.group("WCAG Compliance");
  console.log("Compliant:", validation.compliant);
  console.log("Contrast Ratios:", validation.ratios);
  if (validation.issues.length > 0) {
    console.warn("Issues:", validation.issues);
  }
  console.groupEnd();
}

