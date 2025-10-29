/**
 * Typography Enhancement Module
 * Provides advanced typography utilities for professional slide generation
 * Enhanced with WCAG compliance, golden ratio scaling, and consulting firm presets (McKinsey, BCG, Bain)
 */



/* -------------------------------------------------------------------------- */
/*                        Font Pairing Recommendations                        */
/* -------------------------------------------------------------------------- */

export interface FontPair {
  display: string;
  body: string;
  description: string;
  fallback: string; // Enhanced with explicit fallback chain
}

const PROFESSIONAL_FONT_PAIRS: Record<string, FontPair> = {
  modern: {
    display: "Aptos, Calibri, Arial, sans-serif",
    body: "Aptos, Calibri, Arial, sans-serif",
    description: "Modern, clean, Microsoft Office standard for 2025",
    fallback: "Arial, sans-serif",
  },
  elegant: {
    display: "Georgia, Garamond, serif",
    body: "Calibri, Arial, sans-serif",
    description: "Elegant serif headers with clean body",
    fallback: "serif",
  },
  corporate: {
    display: "Montserrat, Aptos, Arial, sans-serif",
    body: "Montserrat, Aptos, Arial, sans-serif",
    description: "Corporate standard, highly readable with modern sans-serif",
    fallback: "Arial, sans-serif",
  },
  tech: {
    display: "Aptos, Arial, sans-serif",
    body: "Aptos, Arial, sans-serif",
    description: "Tech-forward, modern sans-serif",
    fallback: "sans-serif",
  },
  mckinsey: {
    display: "Bower, Georgia, serif", // McKinsey's bespoke with fallbacks
    body: "Arial, sans-serif",
    description: "McKinsey-inspired: Serif for impact, sans for clarity",
    fallback: "serif",
  },
  bcg: {
    display: "Helvetica Neue, Arial, sans-serif",
    body: "Helvetica Neue, Arial, sans-serif",
    description: "BCG-style: Clean, professional sans-serif",
    fallback: "sans-serif",
  },
  bain: {
    display: "EB Garamond, Georgia, serif",
    body: "Open Sans, Arial, sans-serif",
    description: "Bain-inspired: Balanced serif-sans for readability",
    fallback: "serif",
  },
  strategy: {
    display: "Libre Baskerville, Georgia, serif",
    body: "Lato, Arial, sans-serif",
    description: "Strategy consulting: Elegant and approachable",
    fallback: "serif",
  },
};

/* -------------------------------------------------------------------------- */
/*                      Typography Size Scaling                               */
/* -------------------------------------------------------------------------- */

export interface TypographyScale {
  h1: number; // Title
  h2: number; // Subtitle
  h3: number; // Section headers
  body: number; // Main content
  small: number; // Footnotes
  caption: number; // Labels
}

/**
 * Generate a typographic scale based on professional consulting standards
 * Fixed sizes for consistency and professional appearance
 * Based on McKinsey/BCG/Bain presentation standards
 */
export function generateTypographyScale(
  _baseSize: number = 12, // Professional standard for body text (unused - kept for API compatibility)
  _ratio: number = 1.0 // Not used - we use fixed professional sizes (kept for API compatibility)
): TypographyScale {
  // Professional consulting firm standards (fixed sizes)
  return {
    h1: 26, // Title/Header - consulting standard
    h2: 16, // Subtitle - consulting standard
    h3: 14, // Section headers
    body: 12, // Body text and bullets - consulting standard
    small: 10, // Small text/footnotes
    caption: 8, // Captions and labels (minimum readable)
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
  display: 1.2, // Professional spacing for titles (26pt → 32pt line height)
  heading: 1.25, // Professional spacing for subtitles (16pt → 20pt line height)
  body: 1.5, // Professional spacing for body text (12pt → 18pt line height)
  compact: 1.4, // Slightly tighter for dense content
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
  display: -0.02, // Negative for large text (tracking)
  heading: -0.01,
  body: 0.00, // Neutral for body
  caption: 0.12, // WCAG min 0.12x for small text
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
  black: number; // Added for emphasis in charts/labels
}

export const FONT_WEIGHT_GUIDE: FontWeightGuide = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
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
  verticalRhythm?: number; // Added for consistent spacing
}

/**
 * Get a professional typography preset with consulting-inspired options
 */
export function getTypographyPreset(style: string = "modern"): TypographyPreset {
  const fontPair = PROFESSIONAL_FONT_PAIRS[style] || PROFESSIONAL_FONT_PAIRS.modern;
  const scale = generateTypographyScale(24, style === "elegant" ? 1.25 : 1.618); // Vary ratio by style
  
  return {
    fonts: fontPair,
    scale,
    lineHeights: LINE_HEIGHT_GUIDE,
    letterSpacing: LETTER_SPACING_GUIDE,
    weights: FONT_WEIGHT_GUIDE,
    verticalRhythm: scale.body * LINE_HEIGHT_GUIDE.body, // For baseline grid
  };
}

/* -------------------------------------------------------------------------- */
/*                      Text Fitting & Optimization                           */
/* -------------------------------------------------------------------------- */

/**
 * Calculate optimal font size for text to fit in a box using binary search
 * Enhanced with accurate width estimation, wrapping simulation, WCAG mins
 * Accounts for font metrics (avg char width ~0.6em for sans-serif)
 */
export function calculateOptimalFontSize(
  text: string,
  maxWidth: number, // in inches
  maxHeight: number, // in inches
  startSize: number = 36, // pt
  minSize: number = 18, // WCAG min for presentations
  lineHeight: number = 1.5,
  charWidthFactor: number = 0.6 // Avg for sans-serif
): number {
  // WCAG mins: body >=18pt, titles >=24pt
  const actualMinSize = Math.max(minSize, 18);
  const actualStartSize = Math.min(startSize, 72); // Cap to avoid overflow

  if (actualStartSize <= actualMinSize) return actualMinSize;

  let low = actualMinSize;
  let high = actualStartSize;
  let bestSize = actualMinSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (canFitText(text, maxWidth, maxHeight, mid, lineHeight, charWidthFactor)) {
      bestSize = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestSize;
}

/**
 * Check if text can fit in box at given font size
 * Simulates word wrapping for accuracy
 */
function canFitText(
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontSize: number,
  lineHeight: number,
  charWidthFactor: number = 0.6
): boolean {
  const words = text.split(/\s+/);
  const charWidthIn = (fontSize / 72) * charWidthFactor; // pt to inches
  const lineHeightIn = (fontSize / 72) * lineHeight;
  
  const charsPerLine = Math.floor(maxWidth / charWidthIn);
  const maxLines = Math.floor(maxHeight / lineHeightIn);
  
  let currentLineLength = 0;
  let linesUsed = 1;

  for (const word of words) {
    const wordLength = word.length + 1; // +1 for space
    if (currentLineLength + wordLength > charsPerLine) {
      linesUsed++;
      currentLineLength = wordLength;
      if (linesUsed > maxLines) return false;
    } else {
      currentLineLength += wordLength;
    }
  }

  return true;
}

/**
 * Truncate text with ellipsis if it doesn't fit
 * Enhanced to truncate at word boundaries, preserve meaning
 */
export function truncateWithEllipsis(
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontSize: number,
  lineHeight: number = 1.5,
  charWidthFactor: number = 0.6
): string {
  if (canFitText(text, maxWidth, maxHeight, fontSize, lineHeight, charWidthFactor)) {
    return text;
  }

  const words = text.split(/\s+/);
  let truncated = "";
  let fits = true;

  for (const word of words) {
    const test = truncated ? `${truncated} ${word}` : word;
    if (!canFitText(test, maxWidth, maxHeight, fontSize, lineHeight, charWidthFactor)) {
      fits = false;
      break;
    }
    truncated = test;
  }

  return fits ? text : `${truncated.trim()}…`;
}

/**
 * Truncate text with ellipsis if it exceeds max length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + "...";
}

/**
 * Calculate vertical rhythm unit for consistent spacing
 */
export function calculateVerticalRhythm(baseSize: number, lineHeight: number): number {
  return baseSize * lineHeight;
}

export default {
  getTypographyPreset,
  generateTypographyScale,
  calculateOptimalFontSize,
  truncateText,
  truncateWithEllipsis,
  calculateVerticalRhythm,
};