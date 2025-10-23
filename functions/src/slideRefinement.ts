/**
 * Slide Refinement & Iterative Improvement
 * A/B variants, smart suggestions, auto-fix common issues
 */

import { logger } from "firebase-functions/v2";
import type { SlideSpecV1 } from "./types/SlideSpecV1";

export interface RefinementRequest {
  slide: SlideSpecV1;
  feedback: string;
  refinementType: "improve" | "simplify" | "enhance" | "fix" | "variant";
}

export interface SlideIssue {
  severity: "error" | "warning" | "suggestion";
  category: "content" | "design" | "accessibility" | "performance";
  message: string;
  fix?: string;
  autoFixable: boolean;
}

export interface RefinementSuggestion {
  type: "content" | "design" | "layout" | "color" | "typography";
  priority: "high" | "medium" | "low";
  suggestion: string;
  rationale: string;
  autoApplicable: boolean;
}

/**
 * Analyze slide for common issues
 */
export function analyzeSlideQuality(slide: SlideSpecV1): SlideIssue[] {
  const issues: SlideIssue[] = [];

  // Check title length
  if (slide.content.title.text.length > 60) {
    issues.push({
      severity: "warning",
      category: "content",
      message: "Title is too long (>60 characters). Shorter titles are more impactful.",
      fix: "Condense title to 40-50 characters",
      autoFixable: false
    });
  }

  // Check bullet count
  const bulletCount = slide.content.bullets?.reduce((sum, group) => sum + group.items.length, 0) || 0;
  if (bulletCount > 6) {
    issues.push({
      severity: "warning",
      category: "content",
      message: `Too many bullets (${bulletCount}). Limit to 5-6 for better retention.`,
      fix: "Reduce to 5-6 most important points",
      autoFixable: false
    });
  }

  // Check bullet text length
  slide.content.bullets?.forEach((group, groupIdx) => {
    group.items.forEach((item, itemIdx) => {
      if (item.text.length > 100) {
        issues.push({
          severity: "warning",
          category: "content",
          message: `Bullet ${groupIdx + 1}.${itemIdx + 1} is too long (${item.text.length} chars). Keep under 80 characters.`,
          fix: "Break into multiple bullets or simplify",
          autoFixable: false
        });
      }
    });
  });

  // Check color contrast
  const primaryColor = slide.styleTokens.palette.primary;
  const neutralLight = slide.styleTokens.palette.neutral[6];
  if (primaryColor && neutralLight) {
    const contrast = estimateContrast(primaryColor, neutralLight);
    if (contrast < 4.5) {
      issues.push({
        severity: "error",
        category: "accessibility",
        message: `Low color contrast (${contrast.toFixed(1)}:1). WCAG requires 4.5:1 minimum.`,
        fix: "Adjust colors for better contrast",
        autoFixable: true
      });
    }
  }

  // Check for missing subtitle
  if (!slide.content.subtitle && slide.content.title.text.length < 30) {
    issues.push({
      severity: "suggestion",
      category: "content",
      message: "Consider adding a subtitle to provide context",
      fix: "Add descriptive subtitle",
      autoFixable: false
    });
  }

  // Check chart data quality
  if (slide.content.dataViz) {
    const dv = slide.content.dataViz;
    if (dv.labels.length < 2) {
      issues.push({
        severity: "warning",
        category: "content",
        message: "Chart has too few data points. Need at least 2 for meaningful visualization.",
        fix: "Add more data points or remove chart",
        autoFixable: false
      });
    }

    if (dv.labels.length > 12) {
      issues.push({
        severity: "warning",
        category: "design",
        message: "Chart has too many data points (>12). Consider grouping or filtering.",
        fix: "Reduce to 8-10 most important data points",
        autoFixable: false
      });
    }
  }

  // Check for empty content
  if (!slide.content.bullets && !slide.content.dataViz && !slide.content.callouts) {
    issues.push({
      severity: "warning",
      category: "content",
      message: "Slide has only title/subtitle. Add bullets, chart, or callouts.",
      fix: "Add supporting content",
      autoFixable: false
    });
  }

  return issues;
}

/**
 * Generate smart suggestions for slide improvement
 */
export function generateSmartSuggestions(slide: SlideSpecV1): RefinementSuggestion[] {
  const suggestions: RefinementSuggestion[] = [];

  // Suggest data visualization if numbers are present
  const hasNumbers = slide.content.bullets?.some(group =>
    group.items.some(item => /\d+%|\$\d+|^\d+/.test(item.text))
  );

  if (hasNumbers && !slide.content.dataViz) {
    suggestions.push({
      type: "design",
      priority: "high",
      suggestion: "Convert numeric bullets to chart visualization",
      rationale: "Data visualizations are 60% more memorable than text",
      autoApplicable: false
    });
  }

  // Suggest pattern change based on content
  const bulletCount = slide.content.bullets?.reduce((sum, group) => sum + group.items.length, 0) || 0;
  if (bulletCount > 4 && !slide.content.dataViz) {
    suggestions.push({
      type: "layout",
      priority: "medium",
      suggestion: "Consider using grid pattern for better organization",
      rationale: "Grid pattern works well for 4+ items",
      autoApplicable: true
    });
  }

  // Suggest adding callout for key point
  if (bulletCount >= 3 && !slide.content.callouts) {
    suggestions.push({
      type: "content",
      priority: "medium",
      suggestion: "Highlight most important point as callout",
      rationale: "Callouts draw attention to key takeaways",
      autoApplicable: false
    });
  }

  // Suggest color palette improvement
  const primaryColor = slide.styleTokens.palette.primary;
  if (primaryColor === "#000000" || primaryColor === "#FFFFFF") {
    suggestions.push({
      type: "color",
      priority: "high",
      suggestion: "Use a more distinctive primary color",
      rationale: "Black/white primary colors lack visual interest",
      autoApplicable: true
    });
  }

  // Suggest typography improvement
  const titleSize = slide.styleTokens.typography.sizes.step_3;
  if (titleSize < 32) {
    suggestions.push({
      type: "typography",
      priority: "low",
      suggestion: "Increase title size to 36-44px for better hierarchy",
      rationale: "Larger titles create stronger visual hierarchy",
      autoApplicable: true
    });
  }

  // Suggest adding image if none present
  if (!slide.content.imagePlaceholders && !slide.content.images) {
    suggestions.push({
      type: "design",
      priority: "low",
      suggestion: "Consider adding a supporting image or illustration",
      rationale: "Visual elements increase engagement by 80%",
      autoApplicable: false
    });
  }

  return suggestions;
}

/**
 * Auto-fix common issues
 */
export function autoFixSlide(slide: SlideSpecV1, issues: SlideIssue[]): SlideSpecV1 {
  const fixed = JSON.parse(JSON.stringify(slide)); // Deep clone

  for (const issue of issues) {
    if (!issue.autoFixable) continue;

    // Fix low contrast
    if (issue.category === "accessibility" && issue.message.includes("contrast")) {
      // Darken primary color if too light
      const primary = fixed.styleTokens.palette.primary;
      if (primary) {
        fixed.styleTokens.palette.primary = darkenColor(primary, 20);
      }
    }

    // Fix missing color
    if (issue.message.includes("primary color")) {
      fixed.styleTokens.palette.primary = "#3B82F6"; // Default blue
    }

    // Fix small title
    if (issue.message.includes("title size")) {
      fixed.styleTokens.typography.sizes.step_3 = 40;
    }
  }

  return fixed;
}

/**
 * Generate A/B variant of slide
 */
export function generateSlideVariant(
  slide: SlideSpecV1,
  variantType: "color" | "layout" | "typography" | "minimal"
): SlideSpecV1 {
  const variant = JSON.parse(JSON.stringify(slide)); // Deep clone

  switch (variantType) {
    case "color":
      // Alternative color palette
      const colorVariants = [
        { primary: "#7C3AED", accent: "#EC4899" }, // Purple/Pink
        { primary: "#0D9488", accent: "#F59E0B" }, // Teal/Amber
        { primary: "#1E40AF", accent: "#10B981" }  // Blue/Green
      ];
      const randomColor = colorVariants[Math.floor(Math.random() * colorVariants.length)];
      variant.styleTokens.palette.primary = randomColor.primary;
      variant.styleTokens.palette.accent = randomColor.accent;
      break;

    case "layout":
      // Change to different pattern (simplified - would need design field)
      variant.meta.theme = variant.meta.theme + " (Alternative Layout)";
      break;

    case "typography":
      // Alternative font sizes
      variant.styleTokens.typography.sizes.step_3 = 48; // Larger title
      variant.styleTokens.typography.sizes.step_1 = 24; // Larger subtitle
      break;

    case "minimal":
      // Reduce content to essentials
      if (variant.content.bullets) {
        variant.content.bullets = variant.content.bullets.map((group: any) => ({
          ...group,
          items: group.items.slice(0, 3) // Keep only first 3 bullets
        }));
      }
      break;
  }

  return variant;
}

/**
 * Estimate color contrast ratio (simplified)
 */
function estimateContrast(color1: string, color2: string): number {
  // Simplified contrast calculation
  // In production, use proper WCAG contrast calculation
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get relative luminance of color
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Darken color by percentage
 */
function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = 1 - (percent / 100);
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);
  
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

