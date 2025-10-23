/**
 * Design Quality Validation & Metrics
 * Validates design quality against professional standards
 */

import type { SlideSpecV2 } from "@/types/SlideSpecV2";
import { calculateContrastRatio } from "./colorPalettes";

export interface DesignQualityScore {
  contrast: number; // 0-100
  hierarchy: number; // 0-100
  whitespace: number; // 0-100
  colorHarmony: number; // 0-100
  typography: number; // 0-100
  accessibility: number; // 0-100
  overall: number; // 0-100
  issues: string[];
  warnings: string[];
}

/**
 * Validate overall design quality
 */
export function validateDesignQuality(spec: SlideSpecV2): DesignQualityScore {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  const contrast = validateContrast(spec, issues, warnings);
  const hierarchy = validateHierarchy(spec, issues, warnings);
  const whitespace = validateWhitespace(spec, issues, warnings);
  const colorHarmony = validateColorHarmony(spec, issues, warnings);
  const typography = validateTypography(spec, issues, warnings);
  const accessibility = validateAccessibility(spec, issues, warnings);
  
  const overall = Math.round(
    (contrast + hierarchy + whitespace + colorHarmony + typography + accessibility) / 6
  );
  
  return {
    contrast,
    hierarchy,
    whitespace,
    colorHarmony,
    typography,
    accessibility,
    overall,
    issues,
    warnings
  };
}

/**
 * Validate contrast ratios (WCAG AA minimum 4.5:1)
 */
function validateContrast(spec: SlideSpecV2, issues: string[], warnings: string[]): number {
  const palette = spec.styleTokens.palette;
  const textColor = palette.neutral[0];
  const bgColor = palette.neutral[6];
  
  const ratio = calculateContrastRatio(textColor, bgColor);
  
  if (ratio >= 7) {
    return 100; // WCAG AAA
  } else if (ratio >= 4.5) {
    return 85; // WCAG AA
  } else if (ratio >= 3) {
    warnings.push(`Contrast ratio ${ratio.toFixed(1)}:1 is below WCAG AA (4.5:1)`);
    return 50;
  } else {
    issues.push(`Contrast ratio ${ratio.toFixed(1)}:1 is critically low`);
    return 20;
  }
}

/**
 * Validate visual hierarchy
 */
function validateHierarchy(spec: SlideSpecV2, issues: string[], warnings: string[]): number {
  const sizes = spec.styleTokens.typography.sizes;
  const step0 = sizes.step_0;
  const step3 = sizes.step_3;
  
  const ratio = step3 / step0;
  
  if (ratio >= 2) {
    return 100; // Excellent hierarchy
  } else if (ratio >= 1.5) {
    return 80; // Good hierarchy
  } else if (ratio >= 1.2) {
    warnings.push("Typography hierarchy could be more pronounced");
    return 60;
  } else {
    issues.push("Typography hierarchy is too subtle");
    return 40;
  }
}

/**
 * Validate white space distribution
 */
function validateWhitespace(spec: SlideSpecV2, issues: string[], warnings: string[]): number {
  const strategy = spec.design.whitespace.strategy;
  const breathing = spec.design.whitespace.breathingRoom;
  
  if (strategy === "generous" && breathing >= 40) {
    return 100;
  } else if (strategy === "balanced" && breathing >= 25) {
    return 100;
  } else if (strategy === "compact" && breathing >= 15) {
    return 100;
  } else if (breathing >= 20) {
    warnings.push("White space could be optimized for better visual balance");
    return 75;
  } else {
    issues.push("Insufficient white space - slide appears cluttered");
    return 50;
  }
}

/**
 * Validate color harmony
 */
function validateColorHarmony(spec: SlideSpecV2, issues: string[], warnings: string[]): number {
  const distribution = spec.design.colorStrategy.distribution;
  const palette = spec.styleTokens.palette;
  
  // Check if colors are valid hex
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  if (!hexPattern.test(palette.primary) || !hexPattern.test(palette.accent)) {
    issues.push("Invalid color format - must be hex (#RRGGBB)");
    return 40;
  }
  
  // Validate distribution
  const validDistributions = ["monochromatic", "complementary", "analogous", "triadic"];
  if (!validDistributions.includes(distribution)) {
    warnings.push("Unknown color distribution strategy");
    return 70;
  }
  
  return 90; // Good color harmony
}

/**
 * Validate typography consistency
 */
function validateTypography(spec: SlideSpecV2, issues: string[], warnings: string[]): number {
  const hierarchy = spec.design.typography.hierarchy;

  // Check if hierarchy is defined
  if (!hierarchy || Object.keys(hierarchy).length === 0) {
    warnings.push("Typography hierarchy not fully defined");
    return 70;
  }
  
  // Check font sizes are reasonable
  const minSize = 12;
  const maxSize = 72;
  
  for (const [key, config] of Object.entries(hierarchy)) {
    if (config.size < minSize || config.size > maxSize) {
      issues.push(`Typography size for ${key} (${config.size}px) is out of range`);
      return 50;
    }
    
    if (config.lineHeight < 1.2 || config.lineHeight > 2) {
      warnings.push(`Line height for ${key} (${config.lineHeight}) may be suboptimal`);
    }
  }
  
  return 85; // Good typography
}

/**
 * Validate accessibility compliance
 */
function validateAccessibility(spec: SlideSpecV2, issues: string[], warnings: string[]): number {
  let score = 100;
  
  // Check minimum font size
  const bodySize = spec.styleTokens.typography.sizes.step_0;
  if (bodySize < 16) {
    warnings.push(`Body font size (${bodySize}px) is below recommended 16px minimum`);
    score -= 15;
  }
  
  // Check contrast
  const contrast = calculateContrastRatio(
    spec.styleTokens.palette.neutral[0],
    spec.styleTokens.palette.neutral[6]
  );
  if (contrast < 4.5) {
    issues.push("Contrast ratio below WCAG AA minimum (4.5:1)");
    score -= 30;
  }
  
  // Check line height
  const lineHeight = spec.styleTokens.typography.lineHeights.standard;
  if (lineHeight < 1.5) {
    warnings.push("Line height below recommended 1.5 minimum");
    score -= 10;
  }
  
  return Math.max(0, score);
}

/**
 * Get quality score interpretation
 */
export function getQualityInterpretation(score: number): string {
  if (score >= 90) return "Excellent - Professional quality";
  if (score >= 80) return "Very Good - High quality";
  if (score >= 70) return "Good - Acceptable quality";
  if (score >= 60) return "Fair - Needs improvement";
  if (score >= 50) return "Poor - Significant issues";
  return "Critical - Major problems";
}

/**
 * Get quality color indicator
 */
export function getQualityColor(score: number): string {
  if (score >= 90) return "#10B981"; // Green
  if (score >= 80) return "#3B82F6"; // Blue
  if (score >= 70) return "#F59E0B"; // Amber
  if (score >= 60) return "#F97316"; // Orange
  if (score >= 50) return "#EF4444"; // Red
  return "#DC2626"; // Dark Red
}

/**
 * Format quality report
 */
export function formatQualityReport(score: DesignQualityScore): string {
  let report = `Design Quality Report\n`;
  report += `Overall Score: ${score.overall}/100 (${getQualityInterpretation(score.overall)})\n\n`;
  
  report += `Metrics:\n`;
  report += `  Contrast: ${score.contrast}/100\n`;
  report += `  Hierarchy: ${score.hierarchy}/100\n`;
  report += `  White Space: ${score.whitespace}/100\n`;
  report += `  Color Harmony: ${score.colorHarmony}/100\n`;
  report += `  Typography: ${score.typography}/100\n`;
  report += `  Accessibility: ${score.accessibility}/100\n\n`;
  
  if (score.issues.length > 0) {
    report += `Issues (${score.issues.length}):\n`;
    score.issues.forEach(issue => {
      report += `  ❌ ${issue}\n`;
    });
    report += `\n`;
  }
  
  if (score.warnings.length > 0) {
    report += `Warnings (${score.warnings.length}):\n`;
    score.warnings.forEach(warning => {
      report += `  ⚠️  ${warning}\n`;
    });
  }
  
  return report;
}

