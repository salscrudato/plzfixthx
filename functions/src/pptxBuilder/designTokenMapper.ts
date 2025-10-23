/**
 * Design Token Mapper
 * Maps design tokens to PptxGenJS options for consistent styling
 */

export interface MappedColors {
  primary: string;
  accent: string;
  neutral: string[];
  text: string;
  background: string;
}

export interface MappedTypography {
  title: {
    fontFace: string;
    fontSize: number;
    bold: boolean;
    lineHeight: number;
    color?: string;
  };
  subtitle: {
    fontFace: string;
    fontSize: number;
    bold: boolean;
    lineHeight: number;
    color?: string;
  };
  body: {
    fontFace: string;
    fontSize: number;
    bold: boolean;
    lineHeight: number;
    color?: string;
  };
  caption: {
    fontFace: string;
    fontSize: number;
    bold: boolean;
    lineHeight: number;
    color?: string;
  };
}

export interface MappedShadows {
  sm: {
    type: "outer" | "inner";
    blur: number;
    offset: number;
    opacity: number;
  };
  md: {
    type: "outer" | "inner";
    blur: number;
    offset: number;
    opacity: number;
  };
  lg: {
    type: "outer" | "inner";
    blur: number;
    offset: number;
    opacity: number;
  };
}

/**
 * Map color palette to PptxGenJS format with premium color standards
 */
export function mapColorPalette(palette: any): MappedColors {
  // Premium neutral palette from dark to light
  const premiumNeutral = palette.neutral || [
    "#0F172A", // Charcoal - text
    "#1E293B", // Dark slate
    "#334155", // Slate
    "#64748B", // Medium slate
    "#94A3B8", // Light slate
    "#CBD5E1", // Lighter slate
    "#F8FAFC"  // Almost white - background
  ];

  return {
    primary: palette.primary || "#1E40AF", // Premium navy blue
    accent: palette.accent || "#10B981",   // Premium emerald
    neutral: premiumNeutral,
    text: premiumNeutral[0],
    background: premiumNeutral[6]
  };
}

/**
 * Map typography tokens to PptxGenJS format with premium standards
 */
export function mapTypography(tokens: any): MappedTypography {
  // Premium font pairings for professional presentations
  const fonts = tokens.fonts || {
    sans: "Inter, Arial, sans-serif",
    serif: "Georgia, serif",
    mono: "Courier New, monospace"
  };

  const sizes = tokens.sizes || {
    step_4: 56,   // Hero title - larger for impact
    step_3: 44,   // Premium title size - increased
    step_2: 32,   // Subtitle - more prominent
    step_1: 24,   // Secondary - better hierarchy
    step_0: 18,   // Body - more readable
    "step_-1": 16, // Caption - clearer
    "step_-2": 14  // Small - still legible
  };

  const weights = tokens.weights || {
    bold: 700,
    semibold: 600,
    medium: 500,
    regular: 400,
    light: 300
  };

  const lineHeights = tokens.lineHeights || {
    tight: 1.15,    // Slightly more breathing room
    compact: 1.25,  // Better readability
    standard: 1.6,  // Optimal for body text
    relaxed: 1.8    // Maximum comfort
  };

  return {
    title: {
      fontFace: fonts.sans,
      fontSize: sizes.step_3,
      bold: true,
      lineHeight: lineHeights.compact,
      color: "#0F172A"
    },
    subtitle: {
      fontFace: fonts.sans,
      fontSize: sizes.step_2,
      bold: false,
      lineHeight: 1.4,
      color: "#334155"
    },
    body: {
      fontFace: fonts.sans,
      fontSize: sizes.step_0,
      bold: false,
      lineHeight: lineHeights.standard,
      color: "#1E293B"
    },
    caption: {
      fontFace: fonts.sans,
      fontSize: sizes["step_-1"],
      bold: false,
      lineHeight: lineHeights.standard,
      color: "#64748B"
    }
  };
}

/**
 * Map shadows to PptxGenJS format with premium depth
 */
export function mapShadows(tokens: any): MappedShadows {
  return {
    sm: {
      type: "outer",
      blur: 4,
      offset: 2,
      opacity: 0.08  // Subtle, premium
    },
    md: {
      type: "outer",
      blur: 12,
      offset: 4,
      opacity: 0.12  // Professional depth
    },
    lg: {
      type: "outer",
      blur: 32,
      offset: 8,
      opacity: 0.16  // Elevated, sophisticated
    }
  };
}

/**
 * Map spacing tokens with premium standards
 */
export function mapSpacing(tokens: any): Record<string, number> {
  const base = tokens.base || 4;
  const steps = tokens.steps || [0, 4, 8, 12, 16, 24, 32];

  return {
    xs: steps[0] || 0,
    sm: steps[1] || 4,
    md: steps[2] || 8,
    lg: steps[3] || 12,
    xl: steps[4] || 16,
    "2xl": steps[5] || 24,
    "3xl": steps[6] || 32,
    "4xl": 48,  // Premium breathing room
    "5xl": 64   // Luxury spacing
  };
}

/**
 * Map border radius tokens with premium standards
 */
export function mapRadii(tokens: any): Record<string, number> {
  const radii = tokens.radii || { sm: 4, md: 8, lg: 12 };

  return {
    sm: radii.sm || 4,      // Subtle rounding
    md: radii.md || 8,      // Standard
    lg: radii.lg || 12,     // Generous
    xl: (radii.lg || 12) * 1.5,  // Extra generous
    "2xl": (radii.lg || 12) * 2,  // Premium
    full: 9999              // Fully rounded
  };
}

/**
 * Convert pixels to inches (for PptxGenJS)
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
 * Get text options from typography config
 */
export function getTextOptions(
  typography: MappedTypography,
  colors: MappedColors,
  level: "title" | "subtitle" | "body" | "caption" = "body"
) {
  const config = typography[level];

  return {
    fontFace: config.fontFace,
    fontSize: config.fontSize,
    bold: config.bold,
    color: colors.text,
    align: "left" as const,
    valign: "middle" as const,
    wrap: true,
    lineSpacing: config.lineHeight * 100
  };
}

/**
 * Get shape options with shadow
 */
export function getShapeOptions(
  colors: MappedColors,
  shadows: MappedShadows,
  shadowLevel: "sm" | "md" | "lg" = "md"
) {
  const shadow = shadows[shadowLevel];

  return {
    fill: { color: colors.background },
    line: { color: colors.accent, width: 1 },
    shadow: {
      type: shadow.type,
      color: "000000",
      opacity: shadow.opacity,
      blur: shadow.blur,
      offset: shadow.offset
    }
  };
}

/**
 * Get advanced typography configuration for premium presentations
 */
export function getAdvancedTypography(theme: string = "professional"): any {
  const typographyThemes: Record<string, any> = {
    professional: {
      fontPairing: {
        primary: "Inter, Arial, sans-serif",
        secondary: "Inter, Arial, sans-serif"
      },
      hierarchy: {
        hero: { size: 56, weight: 700, lineHeight: 1.1, letterSpacing: -0.5 },
        title: { size: 40, weight: 700, lineHeight: 1.2, letterSpacing: 0 },
        subtitle: { size: 28, weight: 500, lineHeight: 1.4, letterSpacing: 0.2 },
        body: { size: 16, weight: 400, lineHeight: 1.5, letterSpacing: 0 },
        caption: { size: 14, weight: 400, lineHeight: 1.5, letterSpacing: 0.1 }
      }
    },
    elegant: {
      fontPairing: {
        primary: "Georgia, serif",
        secondary: "Inter, Arial, sans-serif"
      },
      hierarchy: {
        hero: { size: 52, weight: 700, lineHeight: 1.15, letterSpacing: -0.3 },
        title: { size: 36, weight: 700, lineHeight: 1.25, letterSpacing: 0 },
        subtitle: { size: 24, weight: 400, lineHeight: 1.5, letterSpacing: 0.1 },
        body: { size: 16, weight: 400, lineHeight: 1.6, letterSpacing: 0 },
        caption: { size: 13, weight: 400, lineHeight: 1.5, letterSpacing: 0.05 }
      }
    },
    modern: {
      fontPairing: {
        primary: "Inter, Arial, sans-serif",
        secondary: "Inter, Arial, sans-serif"
      },
      hierarchy: {
        hero: { size: 60, weight: 800, lineHeight: 1.0, letterSpacing: -1 },
        title: { size: 44, weight: 700, lineHeight: 1.15, letterSpacing: -0.5 },
        subtitle: { size: 32, weight: 600, lineHeight: 1.3, letterSpacing: 0 },
        body: { size: 16, weight: 400, lineHeight: 1.5, letterSpacing: 0 },
        caption: { size: 14, weight: 500, lineHeight: 1.4, letterSpacing: 0.2 }
      }
    }
  };

  return typographyThemes[theme] || typographyThemes.professional;
}

/**
 * Validate design tokens
 */
export function validateDesignTokens(tokens: any): boolean {
  if (!tokens.palette || !tokens.typography) {
    return false;
  }

  const palette = tokens.palette;
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;

  if (!hexPattern.test(palette.primary) || !hexPattern.test(palette.accent)) {
    return false;
  }

  if (!Array.isArray(palette.neutral) || palette.neutral.length < 5) {
    return false;
  }

  return true;
}

/**
 * Get complete design token map
 */
export function getCompleteTokenMap(tokens: any) {
  return {
    colors: mapColorPalette(tokens.palette),
    typography: mapTypography(tokens.typography),
    shadows: mapShadows(tokens.shadows),
    spacing: mapSpacing(tokens.spacing),
    radii: mapRadii(tokens.radii)
  };
}

