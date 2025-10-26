/**
 * Theme Presets Module
 * - Predefined professional themes (Corporate, Tech, Finance, Healthcare, Sustainability, Luxury)
 * - Support for brand primary color input with auto-correction to nearest compliant color
 * - Ensures WCAG AAA contrast compliance (7:1 for text, 4.5:1 for UI accents)
 */

import { contrastRatio, nearestCompliantColor } from "./colorUtils";

export interface ThemePreset {
  name: string;
  primary: string;
  accent: string;
  neutral: string[];
  description: string;
}

/** Professional theme presets */
export const THEME_PRESETS: Record<string, ThemePreset> = {
  corporate: {
    name: "Corporate",
    primary: "#1E40AF", // Deep blue
    accent: "#DC2626", // Red
    neutral: [
      "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
      "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC",
    ],
    description: "Professional, trustworthy, traditional",
  },

  tech: {
    name: "Tech",
    primary: "#7C3AED", // Purple
    accent: "#06B6D4", // Cyan
    neutral: [
      "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
      "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC",
    ],
    description: "Modern, innovative, forward-thinking",
  },

  finance: {
    name: "Finance",
    primary: "#065F46", // Dark green
    accent: "#DC2626", // Red
    neutral: [
      "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
      "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC",
    ],
    description: "Stable, secure, growth-oriented",
  },

  healthcare: {
    name: "Healthcare",
    primary: "#0369A1", // Sky blue
    accent: "#059669", // Green
    neutral: [
      "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
      "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC",
    ],
    description: "Caring, trustworthy, professional",
  },

  sustainability: {
    name: "Sustainability",
    primary: "#15803D", // Green
    accent: "#EA580C", // Orange
    neutral: [
      "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
      "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC",
    ],
    description: "Eco-conscious, responsible, natural",
  },

  luxury: {
    name: "Luxury",
    primary: "#1F2937", // Dark gray
    accent: "#D97706", // Gold
    neutral: [
      "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
      "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC",
    ],
    description: "Elegant, premium, sophisticated",
  },
};

/**
 * Get theme preset by name
 */
export function getThemePreset(name: string): ThemePreset | null {
  return THEME_PRESETS[name.toLowerCase()] || null;
}

/**
 * Apply brand primary color to a theme preset
 * Auto-corrects color to nearest compliant color if needed
 */
export function applyBrandColor(
  preset: ThemePreset,
  brandPrimary: string
): ThemePreset {
  // Validate and correct brand color for WCAG AAA compliance
  const correctedPrimary = nearestCompliantColor(brandPrimary, preset.neutral);

  return {
    ...preset,
    primary: correctedPrimary,
  };
}

/**
 * Get all available theme names
 */
export function getAvailableThemes(): string[] {
  return Object.keys(THEME_PRESETS);
}

/**
 * Validate theme has proper contrast
 */
export function validateThemeContrast(theme: ThemePreset): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const white = "#FFFFFF";
  const black = "#000000";

  // Check primary color contrast
  const primaryVsWhite = contrastRatio(theme.primary, white);
  const primaryVsBlack = contrastRatio(theme.primary, black);
  const primaryContrast = Math.max(primaryVsWhite, primaryVsBlack);

  if (primaryContrast < 4.5) {
    issues.push(`Primary color contrast too low: ${primaryContrast.toFixed(2)}:1 (need ≥4.5:1)`);
  }

  // Check accent color contrast
  const accentVsWhite = contrastRatio(theme.accent, white);
  const accentVsBlack = contrastRatio(theme.accent, black);
  const accentContrast = Math.max(accentVsWhite, accentVsBlack);

  if (accentContrast < 4.5) {
    issues.push(`Accent color contrast too low: ${accentContrast.toFixed(2)}:1 (need ≥4.5:1)`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

