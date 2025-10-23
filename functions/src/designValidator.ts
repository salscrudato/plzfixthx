/**
 * Design Validator
 * Validates design specifications against professional standards
 */

import type { SlideSpecV2 } from "./types/SlideSpecV2";

export interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: "critical" | "high" | "medium";
}

export interface ValidationWarning {
  field: string;
  message: string;
}

/**
 * Validate complete slide specification
 */
export function validateSlideSpec(spec: SlideSpecV2): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const recommendations: string[] = [];

  // Validate structure
  validateStructure(spec, errors);

  // Validate colors
  validateColors(spec, errors, warnings);

  // Validate typography
  validateTypography(spec, errors, warnings);

  // Validate layout
  validateLayout(spec, errors, warnings);

  // Validate design pattern
  validateDesignPattern(spec, errors, warnings);

  // Validate accessibility
  validateAccessibility(spec, errors, warnings, recommendations);

  // Validate content
  validateContent(spec, errors, warnings);

  const score = calculateValidationScore(errors, warnings);

  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    recommendations
  };
}

/**
 * Validate basic structure
 */
function validateStructure(spec: SlideSpecV2, errors: ValidationError[]): void {
  if (!spec.meta) {
    errors.push({
      field: "meta",
      message: "Missing meta information",
      severity: "critical"
    });
  }

  if (!spec.content) {
    errors.push({
      field: "content",
      message: "Missing content",
      severity: "critical"
    });
  }

  if (!spec.layout) {
    errors.push({
      field: "layout",
      message: "Missing layout configuration",
      severity: "critical"
    });
  }

  if (!spec.styleTokens) {
    errors.push({
      field: "styleTokens",
      message: "Missing style tokens",
      severity: "critical"
    });
  }

  if (!spec.design) {
    errors.push({
      field: "design",
      message: "Missing design configuration",
      severity: "high"
    });
  }
}

/**
 * Validate colors
 */
function validateColors(
  spec: SlideSpecV2,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  const palette = spec.styleTokens.palette;

  if (!hexPattern.test(palette.primary)) {
    errors.push({
      field: "palette.primary",
      message: "Invalid primary color format (must be #RRGGBB)",
      severity: "high"
    });
  }

  if (!hexPattern.test(palette.accent)) {
    errors.push({
      field: "palette.accent",
      message: "Invalid accent color format (must be #RRGGBB)",
      severity: "high"
    });
  }

  if (!Array.isArray(palette.neutral) || palette.neutral.length < 5) {
    errors.push({
      field: "palette.neutral",
      message: "Neutral palette must have at least 5 colors",
      severity: "high"
    });
  }

  palette.neutral?.forEach((color: string, idx: number) => {
    if (!hexPattern.test(color)) {
      warnings.push({
        field: `palette.neutral[${idx}]`,
        message: `Invalid neutral color format at index ${idx}`
      });
    }
  });
}

/**
 * Validate typography
 */
function validateTypography(
  spec: SlideSpecV2,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const typography = spec.styleTokens.typography;

  if (!typography.fonts || !typography.fonts.sans) {
    errors.push({
      field: "typography.fonts",
      message: "Missing sans-serif font definition",
      severity: "high"
    });
  }

  if (!typography.sizes) {
    errors.push({
      field: "typography.sizes",
      message: "Missing typography sizes",
      severity: "high"
    });
  }

  if (!typography.weights) {
    errors.push({
      field: "typography.weights",
      message: "Missing typography weights",
      severity: "high"
    });
  }

  // Check size hierarchy
  const sizes = typography.sizes;
  if (sizes.step_3 && sizes.step_0 && sizes.step_3 <= sizes.step_0) {
    warnings.push({
      field: "typography.sizes",
      message: "Title size should be larger than body size"
    });
  }

  // Check line heights
  const lineHeights = typography.lineHeights;
  if (lineHeights.standard && (lineHeights.standard < 1.4 || lineHeights.standard > 2)) {
    warnings.push({
      field: "typography.lineHeights",
      message: "Standard line height should be between 1.4 and 2"
    });
  }
}

/**
 * Validate layout
 */
function validateLayout(
  spec: SlideSpecV2,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const layout = spec.layout;

  if (!layout.grid) {
    errors.push({
      field: "layout.grid",
      message: "Missing grid configuration",
      severity: "high"
    });
    return;
  }

  if (!layout.regions || layout.regions.length === 0) {
    errors.push({
      field: "layout.regions",
      message: "No layout regions defined",
      severity: "high"
    });
  }

  if (!layout.anchors || layout.anchors.length === 0) {
    warnings.push({
      field: "layout.anchors",
      message: "No content anchors defined"
    });
  }
}

/**
 * Validate design pattern
 */
function validateDesignPattern(
  spec: SlideSpecV2,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const validPatterns = ["hero", "split", "asymmetric", "grid", "minimal", "data-focused"];

  if (!spec.design.pattern || !validPatterns.includes(spec.design.pattern)) {
    errors.push({
      field: "design.pattern",
      message: `Invalid design pattern. Must be one of: ${validPatterns.join(", ")}`,
      severity: "high"
    });
  }

  if (!spec.design.visualHierarchy) {
    warnings.push({
      field: "design.visualHierarchy",
      message: "Visual hierarchy not defined"
    });
  }

  if (!spec.design.whitespace) {
    warnings.push({
      field: "design.whitespace",
      message: "Whitespace strategy not defined"
    });
  }
}

/**
 * Validate accessibility
 */
function validateAccessibility(
  spec: SlideSpecV2,
  errors: ValidationError[],
  warnings: ValidationWarning[],
  recommendations: string[]
): void {
  const sizes = spec.styleTokens.typography.sizes;

  if (sizes.step_0 < 14) {
    warnings.push({
      field: "typography.sizes.step_0",
      message: "Body font size is below recommended 14px minimum"
    });
  }

  if (sizes.step_0 < 12) {
    errors.push({
      field: "typography.sizes.step_0",
      message: "Body font size is below accessibility minimum of 12px",
      severity: "medium"
    });
  }

  const lineHeight = spec.styleTokens.typography.lineHeights.standard;
  if (lineHeight < 1.5) {
    recommendations.push("Increase line height to at least 1.5 for better readability");
  }

  recommendations.push("Ensure all text has sufficient contrast (WCAG AA: 4.5:1 minimum)");
  recommendations.push("Test with screen readers for semantic structure");
}

/**
 * Validate content
 */
function validateContent(
  spec: SlideSpecV2,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const content = spec.content;

  if (!content.title || !content.title.text) {
    warnings.push({
      field: "content.title",
      message: "No title text provided"
    });
  }

  if (content.title?.text && content.title.text.length > 100) {
    warnings.push({
      field: "content.title",
      message: "Title is very long (>100 characters)"
    });
  }

  if (content.bullets && content.bullets[0]) {
    const bulletCount = content.bullets[0].items.length;
    if (bulletCount > 6) {
      warnings.push({
        field: "content.bullets",
        message: `Too many bullet points (${bulletCount}). Recommended maximum is 6.`
      });
    }
  }
}

/**
 * Calculate validation score
 */
function calculateValidationScore(
  errors: ValidationError[],
  warnings: ValidationWarning[]
): number {
  let score = 100;

  // Deduct for errors
  const criticalErrors = errors.filter(e => e.severity === "critical").length;
  const highErrors = errors.filter(e => e.severity === "high").length;
  const mediumErrors = errors.filter(e => e.severity === "medium").length;

  score -= criticalErrors * 20;
  score -= highErrors * 10;
  score -= mediumErrors * 5;

  // Deduct for warnings
  score -= warnings.length * 2;

  return Math.max(0, score);
}

/**
 * Get validation summary
 */
export function getValidationSummary(result: ValidationResult): string {
  let summary = `Validation Score: ${result.score}/100\n`;
  summary += `Status: ${result.isValid ? "✓ Valid" : "✗ Invalid"}\n\n`;

  if (result.errors.length > 0) {
    summary += `Errors (${result.errors.length}):\n`;
    result.errors.forEach(error => {
      summary += `  [${error.severity.toUpperCase()}] ${error.field}: ${error.message}\n`;
    });
    summary += "\n";
  }

  if (result.warnings.length > 0) {
    summary += `Warnings (${result.warnings.length}):\n`;
    result.warnings.forEach(warning => {
      summary += `  ${warning.field}: ${warning.message}\n`;
    });
    summary += "\n";
  }

  if (result.recommendations.length > 0) {
    summary += `Recommendations:\n`;
    result.recommendations.forEach(rec => {
      summary += `  • ${rec}\n`;
    });
  }

  return summary;
}

