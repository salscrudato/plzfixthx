/**
 * Chart Presets
 * Professional chart configurations for different use cases
 */

import type { ChartConfig } from "./chartBuilder";

/**
 * Executive preset - minimal, professional, data-focused
 * Best for: C-suite presentations, board meetings, investor pitches
 */
export const EXECUTIVE_PRESET: Partial<ChartConfig> = {
  showLegend: true,
  showDataLabels: true,
  showTrendline: false,
  showDataTable: false,
  colors: [
    "#1F2937",  // Dark gray - primary
    "#6B7280",  // Medium gray - secondary
    "#D1D5DB",  // Light gray - tertiary
    "#374151",  // Dark gray accent
    "#9CA3AF",  // Gray accent
  ]
};

/**
 * Marketing preset - vibrant, engaging, colorful
 * Best for: Marketing presentations, product launches, campaigns
 */
export const MARKETING_PRESET: Partial<ChartConfig> = {
  showLegend: true,
  showDataLabels: true,
  showTrendline: false,
  showDataTable: false,
  colors: [
    "#FF6B6B",  // Vibrant red
    "#4ECDC4",  // Teal
    "#45B7D1",  // Sky blue
    "#FFA07A",  // Light salmon
    "#98D8C8",  // Mint
    "#F7DC6F",  // Golden yellow
    "#BB8FCE",  // Purple
    "#85C1E2",  // Light blue
  ]
};

/**
 * Education preset - clear, accessible, learning-focused
 * Best for: Educational content, training, tutorials
 */
export const EDUCATION_PRESET: Partial<ChartConfig> = {
  showLegend: true,
  showDataLabels: true,
  showTrendline: true,
  showDataTable: true,
  colors: [
    "#3B82F6",  // Blue - primary
    "#10B981",  // Green - success
    "#F59E0B",  // Amber - warning
    "#8B5CF6",  // Purple - creative
    "#EC4899",  // Pink - accent
    "#06B6D4",  // Cyan - tech
  ]
};

/**
 * Minimal preset - clean, simple, focus on data
 * Best for: Reports, dashboards, data analysis
 */
export const MINIMAL_PRESET: Partial<ChartConfig> = {
  showLegend: true,
  showDataLabels: false,
  showTrendline: false,
  showDataTable: false,
  colors: [
    "#0F172A",  // Almost black
    "#64748B",  // Slate
    "#CBD5E1",  // Light slate
  ]
};

/**
 * Bold preset - high contrast, attention-grabbing
 * Best for: Sales presentations, announcements, highlights
 */
export const BOLD_PRESET: Partial<ChartConfig> = {
  showLegend: true,
  showDataLabels: true,
  showTrendline: false,
  showDataTable: false,
  colors: [
    "#EF4444",  // Red
    "#F97316",  // Orange
    "#FBBF24",  // Amber
    "#22C55E",  // Green
    "#06B6D4",  // Cyan
    "#3B82F6",  // Blue
    "#8B5CF6",  // Purple
  ]
};

/**
 * Get preset by name
 */
export function getChartPreset(
  presetName: "executive" | "marketing" | "education" | "minimal" | "bold"
): Partial<ChartConfig> {
  const presets: Record<string, Partial<ChartConfig>> = {
    executive: EXECUTIVE_PRESET,
    marketing: MARKETING_PRESET,
    education: EDUCATION_PRESET,
    minimal: MINIMAL_PRESET,
    bold: BOLD_PRESET
  };

  return presets[presetName] || EXECUTIVE_PRESET;
}

/**
 * Apply preset to chart config
 */
export function applyChartPreset(
  config: ChartConfig,
  presetName: "executive" | "marketing" | "education" | "minimal" | "bold"
): ChartConfig {
  const preset = getChartPreset(presetName);
  return {
    ...config,
    ...preset,
    // Preserve original labels and series
    labels: config.labels,
    series: config.series,
    chartType: config.chartType
  };
}

/**
 * Get recommended preset for content type
 */
export function getRecommendedChartPreset(
  contentType: "executive" | "marketing" | "education" | "report" | "announcement"
): "executive" | "marketing" | "education" | "minimal" | "bold" {
  const recommendations: Record<string, "executive" | "marketing" | "education" | "minimal" | "bold"> = {
    executive: "executive",
    marketing: "marketing",
    education: "education",
    report: "minimal",
    announcement: "bold"
  };

  return recommendations[contentType] || "executive";
}

/**
 * Validate chart config against preset requirements
 */
export function validateChartAgainstPreset(
  config: ChartConfig,
  presetName: "executive" | "marketing" | "education" | "minimal" | "bold"
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check labels and series match
  if (!config.labels || config.labels.length === 0) {
    issues.push("Chart must have labels");
  }

  if (!config.series || config.series.length === 0) {
    issues.push("Chart must have at least one series");
  }

  // Check series values match labels length
  for (const series of config.series || []) {
    if (series.values.length !== (config.labels?.length || 0)) {
      issues.push(
        `Series "${series.name}" has ${series.values.length} values but ${config.labels?.length || 0} labels`
      );
    }
  }

  // Preset-specific validation
  if (presetName === "education") {
    if (!config.showDataTable) {
      issues.push("Education preset recommends showing data table");
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

