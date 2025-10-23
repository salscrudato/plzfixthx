/**
 * Whitespace Management System
 * Professional spacing, breathing room, and layout optimization
 */

export interface SpacingConfig {
  xs: number;    // Extra small: 0.25"
  sm: number;    // Small: 0.5"
  md: number;    // Medium: 0.75"
  lg: number;    // Large: 1"
  xl: number;    // Extra large: 1.5"
  xxl: number;   // Double extra large: 2"
}

export interface PaddingConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface MarginConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Standard spacing scale
 */
export const SPACING_SCALE: SpacingConfig = {
  xs: 0.25,
  sm: 0.5,
  md: 0.75,
  lg: 1,
  xl: 1.5,
  xxl: 2
};

/**
 * Get spacing value by name
 */
export function getSpacing(size: keyof SpacingConfig): number {
  return SPACING_SCALE[size];
}

/**
 * Create uniform padding
 */
export function createUniformPadding(size: keyof SpacingConfig): PaddingConfig {
  const value = getSpacing(size);
  return {
    top: value,
    right: value,
    bottom: value,
    left: value
  };
}

/**
 * Create uniform margin
 */
export function createUniformMargin(size: keyof SpacingConfig): MarginConfig {
  const value = getSpacing(size);
  return {
    top: value,
    right: value,
    bottom: value,
    left: value
  };
}

/**
 * Create custom padding
 */
export function createCustomPadding(
  top: number,
  right: number,
  bottom: number,
  left: number
): PaddingConfig {
  return { top, right, bottom, left };
}

/**
 * Create custom margin
 */
export function createCustomMargin(
  top: number,
  right: number,
  bottom: number,
  left: number
): MarginConfig {
  return { top, right, bottom, left };
}

/**
 * Calculate content width with padding
 */
export function calculateContentWidth(
  totalWidth: number,
  padding: PaddingConfig
): number {
  return totalWidth - padding.left - padding.right;
}

/**
 * Calculate content height with padding
 */
export function calculateContentHeight(
  totalHeight: number,
  padding: PaddingConfig
): number {
  return totalHeight - padding.top - padding.bottom;
}

/**
 * Get recommended line height for readability
 */
export function getRecommendedLineHeight(fontSize: number): number {
  // Golden ratio: 1.5 for body, 1.2 for headings
  if (fontSize >= 32) {
    return 1.2; // Headings
  } else if (fontSize >= 20) {
    return 1.3; // Subheadings
  } else {
    return 1.5; // Body text
  }
}

/**
 * Get recommended paragraph spacing
 */
export function getRecommendedParagraphSpacing(fontSize: number): number {
  // Spacing between paragraphs should be 1-1.5x line height
  const lineHeight = getRecommendedLineHeight(fontSize);
  return (fontSize / 72) * lineHeight; // Convert to inches
}

/**
 * Calculate optimal vertical rhythm
 */
export function calculateVerticalRhythm(
  baselineHeight: number,
  multiplier: number = 1
): number {
  return baselineHeight * multiplier;
}

/**
 * Get breathing room percentage for slide
 */
export function getBreathingRoomPercentage(contentArea: number, totalArea: number): number {
  const whiteSpace = totalArea - contentArea;
  return (whiteSpace / totalArea) * 100;
}

/**
 * Validate breathing room (should be 20-40% for professional slides)
 */
export function validateBreathingRoom(
  contentArea: number,
  totalArea: number
): { valid: boolean; percentage: number; recommendation: string } {
  const percentage = getBreathingRoomPercentage(contentArea, totalArea);

  let recommendation = "";
  let valid = true;

  if (percentage < 20) {
    recommendation = "Content is too dense. Add more whitespace.";
    valid = false;
  } else if (percentage > 40) {
    recommendation = "Too much whitespace. Consider adding more content.";
    valid = false;
  } else {
    recommendation = "Breathing room is optimal.";
    valid = true;
  }

  return { valid, percentage, recommendation };
}

/**
 * Get margin for different content types
 */
export function getContentMargin(contentType: "title" | "body" | "chart" | "image"): MarginConfig {
  const margins: Record<string, MarginConfig> = {
    title: createCustomMargin(0, 0, 0.5, 0),
    body: createCustomMargin(0.25, 0, 0.25, 0),
    chart: createCustomMargin(0.5, 0, 0.5, 0),
    image: createCustomMargin(0.5, 0, 0.5, 0)
  };

  return margins[contentType] || createUniformMargin("md");
}

/**
 * Get padding for different container types
 */
export function getContainerPadding(containerType: "card" | "box" | "section" | "highlight"): PaddingConfig {
  const paddings: Record<string, PaddingConfig> = {
    card: createCustomPadding(0.5, 0.5, 0.5, 0.5),
    box: createCustomPadding(0.75, 0.75, 0.75, 0.75),
    section: createCustomPadding(1, 1, 1, 1),
    highlight: createCustomPadding(0.5, 0.75, 0.5, 0.75)
  };

  return paddings[containerType] || createUniformPadding("md");
}

/**
 * Calculate grid gap for multi-column layouts
 */
export function calculateGridGap(columnCount: number, totalWidth: number): number {
  // Recommended gap: 0.25" to 0.5" depending on columns
  if (columnCount <= 2) {
    return 0.5;
  } else if (columnCount <= 3) {
    return 0.4;
  } else {
    return 0.25;
  }
}

/**
 * Calculate column width for grid
 */
export function calculateColumnWidth(
  totalWidth: number,
  columnCount: number,
  gap: number
): number {
  const totalGap = gap * (columnCount - 1);
  return (totalWidth - totalGap) / columnCount;
}

/**
 * Get recommended section spacing
 */
export function getRecommendedSectionSpacing(sectionType: "header" | "body" | "footer"): number {
  const spacing: Record<string, number> = {
    header: 0.5,
    body: 0.75,
    footer: 0.5
  };

  return spacing[sectionType] || 0.5;
}

/**
 * Calculate optimal slide margins
 */
export function getOptimalSlideMargins(slideWidth: number, slideHeight: number): MarginConfig {
  // Golden ratio margins: approximately 5-10% of slide dimensions
  const horizontalMargin = slideWidth * 0.05;
  const verticalMargin = slideHeight * 0.067;

  return createCustomMargin(verticalMargin, horizontalMargin, verticalMargin, horizontalMargin);
}

/**
 * Get text box padding for readability
 */
export function getTextBoxPadding(textLength: number): PaddingConfig {
  // Longer text needs more breathing room
  if (textLength > 500) {
    return createCustomPadding(0.75, 0.75, 0.75, 0.75);
  } else if (textLength > 200) {
    return createCustomPadding(0.5, 0.5, 0.5, 0.5);
  } else {
    return createCustomPadding(0.25, 0.25, 0.25, 0.25);
  }
}

/**
 * Calculate list item spacing
 */
export function getListItemSpacing(itemCount: number): number {
  // More items = less spacing to fit on slide
  if (itemCount <= 3) {
    return 0.4;
  } else if (itemCount <= 5) {
    return 0.3;
  } else {
    return 0.2;
  }
}

/**
 * Get recommended spacing between elements
 */
export function getElementSpacing(elementType: "heading-body" | "body-body" | "section-section"): number {
  const spacing: Record<string, number> = {
    "heading-body": 0.3,
    "body-body": 0.2,
    "section-section": 0.75
  };

  return spacing[elementType] || 0.25;
}

/**
 * Validate layout spacing
 */
export function validateLayoutSpacing(
  elements: Array<{ y: number; h: number }>,
  slideHeight: number
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for overlapping elements
  for (let i = 0; i < elements.length - 1; i++) {
    const current = elements[i];
    const next = elements[i + 1];

    if (current.y + current.h > next.y) {
      issues.push(`Elements ${i} and ${i + 1} are overlapping`);
    }
  }

  // Check if content fits on slide
  const lastElement = elements[elements.length - 1];
  if (lastElement.y + lastElement.h > slideHeight) {
    issues.push("Content extends beyond slide height");
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

