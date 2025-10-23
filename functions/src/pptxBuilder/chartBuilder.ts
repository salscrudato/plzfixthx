/**
 * Enhanced Chart Builder
 * Creates professional, styled charts with design tokens
 */

import PptxGenJS from "pptxgenjs";

export interface ChartConfig {
  title?: string;
  subtitle?: string;
  labels: string[];
  series: Array<{
    name: string;
    values: number[];
  }>;
  colors?: string[];
  showLegend?: boolean;
  showDataLabels?: boolean;
  chartType: "bar" | "line" | "pie" | "area";
}

/**
 * Build a premium professional bar chart with advanced styling
 */
export function buildBarChart(
  slide: any,
  config: ChartConfig,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const chartData = config.series.map(s => ({
    name: s.name,
    labels: config.labels,
    values: s.values
  }));

  // Premium color palette for charts
  const premiumColors = config.colors || [
    "#1E40AF",  // Deep blue
    "#10B981",  // Emerald
    "#F59E0B",  // Amber
    "#8B5CF6",  // Purple
    "#EC4899"   // Magenta
  ];

  const chartOptions: any = {
    x,
    y,
    w,
    h,
    chartColors: premiumColors,
    showLegend: config.showLegend !== false,
    legendPos: "b" as const,
    dataLabelFontSize: config.showDataLabels ? 11 : 0,
    dataLabelPosition: "ctr" as const,
    barDir: "bar" as const,
    showTitle: !!config.title,
    title: config.title || "",
    titleFontSize: 18,
    titleFontBold: true,
    titleFontFace: "Inter, Arial, sans-serif",
    titleColor: "#0F172A",
    chartGridLine: { style: "solid", color: "#E2E8F0", size: 0.5 },
    showValue: config.showDataLabels !== false,
    barGapWidthPercent: 150,
    catAxisLabelFontSize: 11,
    valAxisLabelFontSize: 11,
    legendFontSize: 11,
    dataLabelFontFace: "Inter, Arial, sans-serif"
  };

  slide.addChart(PptxGenJS.ChartType.bar, chartData, chartOptions);
}

/**
 * Build a premium professional line chart with advanced styling
 */
export function buildLineChart(
  slide: any,
  config: ChartConfig,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const chartData = config.series.map(s => ({
    name: s.name,
    labels: config.labels,
    values: s.values
  }));

  // Premium color palette for charts
  const premiumColors = config.colors || [
    "#1E40AF",  // Deep blue
    "#10B981",  // Emerald
    "#F59E0B",  // Amber
    "#8B5CF6",  // Purple
    "#EC4899"   // Magenta
  ];

  const chartOptions: any = {
    x,
    y,
    w,
    h,
    chartColors: premiumColors,
    showLegend: config.showLegend !== false,
    legendPos: "b" as const,
    dataLabelFontSize: config.showDataLabels ? 11 : 0,
    dataLabelPosition: "ctr" as const,
    showTitle: !!config.title,
    title: config.title || "",
    titleFontSize: 18,
    titleFontBold: true,
    titleFontFace: "Inter, Arial, sans-serif",
    titleColor: "#0F172A",
    lineSmooth: true,
    chartGridLine: { style: "solid", color: "#E2E8F0", size: 0.5 },
    showValue: config.showDataLabels !== false,
    catAxisLabelFontSize: 11,
    valAxisLabelFontSize: 11,
    legendFontSize: 11,
    dataLabelFontFace: "Inter, Arial, sans-serif",
    lineSize: 2.5
  };

  slide.addChart(PptxGenJS.ChartType.line, chartData, chartOptions);
}

/**
 * Build a premium professional pie chart with advanced styling
 */
export function buildPieChart(
  slide: any,
  config: ChartConfig,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const chartData = [
    {
      name: config.series[0]?.name || "Data",
      labels: config.labels,
      values: config.series[0]?.values || []
    }
  ];

  // Premium color palette for pie charts
  const premiumColors = config.colors || [
    "#1E40AF",  // Deep blue
    "#10B981",  // Emerald
    "#F59E0B",  // Amber
    "#8B5CF6",  // Purple
    "#EC4899",  // Magenta
    "#06B6D4",  // Cyan
    "#7C3AED"   // Violet
  ];

  const chartOptions: any = {
    x,
    y,
    w,
    h,
    chartColors: premiumColors,
    showLegend: config.showLegend !== false,
    legendPos: "r" as const,
    dataLabelFontSize: config.showDataLabels ? 11 : 0,
    dataLabelPosition: "ctr" as const,
    showTitle: !!config.title,
    title: config.title || "",
    titleFontSize: 18,
    titleFontBold: true,
    titleFontFace: "Inter, Arial, sans-serif",
    titleColor: "#0F172A",
    showValue: config.showDataLabels !== false,
    legendFontSize: 11,
    dataLabelFontFace: "Inter, Arial, sans-serif",
    pieHole: 0
  };

  slide.addChart(PptxGenJS.ChartType.pie, chartData, chartOptions);
}

/**
 * Build a premium professional area chart with advanced styling
 */
export function buildAreaChart(
  slide: any,
  config: ChartConfig,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const chartData = config.series.map(s => ({
    name: s.name,
    labels: config.labels,
    values: s.values
  }));

  // Premium color palette for area charts with transparency
  const premiumColors = config.colors || [
    "#1E40AF",  // Deep blue
    "#10B981",  // Emerald
    "#F59E0B",  // Amber
    "#8B5CF6",  // Purple
    "#EC4899"   // Magenta
  ];

  const chartOptions: any = {
    x,
    y,
    w,
    h,
    chartColors: premiumColors,
    showLegend: config.showLegend !== false,
    legendPos: "b" as const,
    dataLabelFontSize: config.showDataLabels ? 11 : 0,
    dataLabelPosition: "ctr" as const,
    showTitle: !!config.title,
    title: config.title || "",
    titleFontSize: 18,
    titleFontBold: true,
    titleFontFace: "Inter, Arial, sans-serif",
    titleColor: "#0F172A",
    lineSmooth: true,
    chartGridLine: { style: "solid", color: "#E2E8F0", size: 0.5 },
    showValue: config.showDataLabels !== false,
    catAxisLabelFontSize: 11,
    valAxisLabelFontSize: 11,
    legendFontSize: 11,
    dataLabelFontFace: "Inter, Arial, sans-serif",
    lineSize: 2.5
  };

  slide.addChart(PptxGenJS.ChartType.area, chartData, chartOptions);
}

/**
 * Build chart based on type
 */
export function buildChart(
  slide: any,
  config: ChartConfig,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  switch (config.chartType) {
    case "bar":
      buildBarChart(slide, config, x, y, w, h);
      break;
    case "line":
      buildLineChart(slide, config, x, y, w, h);
      break;
    case "pie":
      buildPieChart(slide, config, x, y, w, h);
      break;
    case "area":
      buildAreaChart(slide, config, x, y, w, h);
      break;
    default:
      buildBarChart(slide, config, x, y, w, h);
  }
}

/**
 * Validate chart config
 */
export function validateChartConfig(config: ChartConfig): boolean {
  if (!config.labels || config.labels.length === 0) {
    return false;
  }

  if (!config.series || config.series.length === 0) {
    return false;
  }

  for (const series of config.series) {
    if (series.values.length !== config.labels.length) {
      return false;
    }
  }

  return true;
}

/**
 * Get recommended chart type for data
 */
export function getRecommendedChartType(
  dataPoints: number,
  seriesCount: number
): "bar" | "line" | "pie" | "area" {
  if (seriesCount === 1 && dataPoints <= 5) {
    return "pie";
  }

  if (seriesCount > 1 && dataPoints > 10) {
    return "line";
  }

  if (dataPoints > 15) {
    return "area";
  }

  return "bar";
}

/**
 * Format chart data for display
 */
export function formatChartData(
  labels: string[],
  values: number[]
): Array<{ label: string; value: number }> {
  return labels.map((label, index) => ({
    label,
    value: values[index] || 0
  }));
}

/**
 * Calculate chart statistics
 */
export function calculateChartStats(values: number[]) {
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  return { sum, avg, max, min };
}

