/**
 * Typography Enhancement Module
 * Provides advanced typography utilities for professional slide generation
 */

/* -------------------------------------------------------------------------- */
/*                        Font Pairing Recommendations                        */
/* -------------------------------------------------------------------------- */

export interface FontPair {
  display: string;
  body: string;
  description: string;
}

const PROFESSIONAL_FONT_PAIRS: Record<string, FontPair> = {
  modern: {
    display: "Aptos, Calibri, Arial",
    body: "Aptos, Calibri, Arial",
    description: "Modern, clean, Microsoft Office standard",
  },
  elegant: {
    display: "Georgia, Garamond, serif",
    body: "Calibri, Arial, sans-serif",
    description: "Elegant serif headers with clean body",
  },
  corporate: {
    display: "Aptos, Arial, sans-serif",
    body: "Aptos, Arial, sans-serif",
    description: "Corporate standard, highly readable",
  },
  tech: {
    display: "Aptos, Arial, sans-serif",
    body: "Aptos, Arial, sans-serif",
    description: "Tech-forward, modern sans-serif",
  },
};

/* -------------------------------------------------------------------------- */
/*                      Typography Size Scaling                               */
/* -------------------------------------------------------------------------- */

export interface TypographyScale {
  h1: number;
  h2: number;
  h3: number;
  body: number;
  small: number;
  caption: number;
}

/**
 * Generate a typographic scale based on a base size
 * Uses a 1.25 modular scale (perfect fifth)
 */
export function generateTypographyScale(baseSize: number = 16): TypographyScale {
  const ratio = 1.25; // Perfect fifth
  return {
    h1: Math.round(baseSize * Math.pow(ratio, 4)), // 44px
    h2: Math.round(baseSize * Math.pow(ratio, 3)), // 35px
    h3: Math.round(baseSize * Math.pow(ratio, 2)), // 28px
    body: baseSize, // 16px
    small: Math.round(baseSize * Math.pow(ratio, -1)), // 13px
    caption: Math.round(baseSize * Math.pow(ratio, -2)), // 10px
  };
}

/* -------------------------------------------------------------------------- */
/*                      Line Height Recommendations                           */
/* -------------------------------------------------------------------------- */

export interface LineHeightGuide {
  display: number;
  heading: number;
  body: number;
  compact: number;
}

export const LINE_HEIGHT_GUIDE: LineHeightGuide = {
  display: 1.1, // Tight for large headlines
  heading: 1.2, // Tight for subheadings
  body: 1.5, // Standard for body text
  compact: 1.3, // Slightly tight for UI
};

/* -------------------------------------------------------------------------- */
/*                      Letter Spacing Recommendations                        */
/* -------------------------------------------------------------------------- */

export interface LetterSpacingGuide {
  display: number;
  heading: number;
  body: number;
  caption: number;
}

export const LETTER_SPACING_GUIDE: LetterSpacingGuide = {
  display: -0.02, // Negative for large text
  heading: -0.01,
  body: 0,
  caption: 0.01, // Positive for small text
};

/* -------------------------------------------------------------------------- */
/*                      Font Weight Recommendations                           */
/* -------------------------------------------------------------------------- */

export interface FontWeightGuide {
  light: number;
  regular: number;
  medium: number;
  semibold: number;
  bold: number;
}

export const FONT_WEIGHT_GUIDE: FontWeightGuide = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

/* -------------------------------------------------------------------------- */
/*                      Professional Typography Presets                       */
/* -------------------------------------------------------------------------- */

export interface TypographyPreset {
  fonts: FontPair;
  scale: TypographyScale;
  lineHeights: LineHeightGuide;
  letterSpacing: LetterSpacingGuide;
  weights: FontWeightGuide;
}

/**
 * Get a professional typography preset
 */
export function getTypographyPreset(style: string = "modern"): TypographyPreset {
  const fontPair = PROFESSIONAL_FONT_PAIRS[style] || PROFESSIONAL_FONT_PAIRS.modern;
  
  return {
    fonts: fontPair,
    scale: generateTypographyScale(16),
    lineHeights: LINE_HEIGHT_GUIDE,
    letterSpacing: LETTER_SPACING_GUIDE,
    weights: FONT_WEIGHT_GUIDE,
  };
}

/* -------------------------------------------------------------------------- */
/*                      Text Fitting & Optimization                           */
/* -------------------------------------------------------------------------- */

/**
 * Calculate optimal font size for text to fit in a box using binary search
 * Considers text length, box dimensions, and line height
 * Respects minimum size constraints for accessibility
 */
export function calculateOptimalFontSize(
  text: string,
  maxWidth: number,
  maxHeight: number,
  startSize: number = 26,
  minSize: number = 12,
  lineHeight: number = 1.2
): number {
  // Enforce minimum sizes for accessibility
  const MIN_BODY = 11;

  // Determine actual minimum based on context
  const actualMinSize = Math.max(minSize, MIN_BODY);
  const actualStartSize = Math.min(startSize, 44); // Cap at 44pt

  if (actualStartSize <= actualMinSize) {
    return actualMinSize;
  }

  // Binary search for optimal size
  let low = actualMinSize;
  let high = actualStartSize;
  let bestSize = actualMinSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (canFitText(text, maxWidth, maxHeight, mid, lineHeight)) {
      bestSize = mid;
      low = mid + 1; // Try larger
    } else {
      high = mid - 1; // Try smaller
    }
  }

  return bestSize;
}

/**
 * Check if text can fit in box at given font size
 */
function canFitText(
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontSize: number,
  lineHeight: number
): boolean {
  // Estimate character width: ~0.5em per character at given size
  const charWidthIn = (fontSize / 72) * 0.5;
  const lineHeightIn = (fontSize / 72) * lineHeight;

  // Calculate how many characters fit per line
  const charsPerLine = Math.max(1, Math.floor(maxWidth / charWidthIn));

  // Calculate how many lines fit in height
  const maxLines = Math.max(1, Math.floor(maxHeight / lineHeightIn));

  // Calculate total capacity with 5% safety margin
  const capacity = Math.floor(charsPerLine * maxLines * 0.95);

  return text.length <= capacity;
}

/**
 * Truncate text with ellipsis if it doesn't fit
 */
export function truncateWithEllipsis(
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontSize: number,
  lineHeight: number = 1.2
): string {
  if (canFitText(text, maxWidth, maxHeight, fontSize, lineHeight)) {
    return text;
  }

  // Estimate how many characters fit
  const charWidthIn = (fontSize / 72) * 0.5;
  const lineHeightIn = (fontSize / 72) * lineHeight;
  const charsPerLine = Math.max(1, Math.floor(maxWidth / charWidthIn));
  const maxLines = Math.max(1, Math.floor(maxHeight / lineHeightIn));
  const capacity = Math.floor(charsPerLine * maxLines * 0.95);

  // Reserve 3 characters for ellipsis
  const maxChars = Math.max(10, capacity - 3);
  return text.slice(0, maxChars).trim() + "…";
}

/**
 * Truncate text with ellipsis if it exceeds max length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + "...";
}

export default {
  getTypographyPreset,
  generateTypographyScale,
  calculateOptimalFontSize,
  truncateText,
};

