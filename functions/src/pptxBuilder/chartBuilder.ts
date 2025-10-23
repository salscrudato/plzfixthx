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
  chartType: "bar" | "line" | "pie" | "area" | "scatter" | "combo" | "waterfall" | "funnel" | "doughnut";
  // Advanced options
  showTrendline?: boolean;
  showDataTable?: boolean;
  annotations?: Array<{
    text: string;
    x: number;
    y: number;
  }>;
  // Combo chart specific
  comboTypes?: Array<"bar" | "line" | "area">;
  // Waterfall specific
  waterfallConnectors?: boolean;
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

  // Premium color palette for charts - vibrant, modern, professional
  const premiumColors = config.colors || [
    "#3B82F6",  // Bright blue - primary
    "#10B981",  // Emerald - success
    "#F59E0B",  // Amber - warning
    "#8B5CF6",  // Purple - creative
    "#EC4899",  // Magenta - accent
    "#06B6D4",  // Cyan - tech
    "#EF4444",  // Red - alert
    "#14B8A6"   // Teal - calm
  ];

  const chartOptions: any = {
    x,
    y,
    w,
    h,
    chartColors: premiumColors,
    showLegend: config.showLegend !== false,
    legendPos: "b" as const,
    dataLabelFontSize: config.showDataLabels ? 12 : 0,
    dataLabelPosition: "ctr" as const,
    dataLabelColor: "#0F172A",
    dataLabelFontFace: "Inter, Arial, sans-serif",
    dataLabelFontBold: true,
    barDir: "bar" as const,
    showTitle: !!config.title,
    title: config.title || "",
    titleFontSize: 20,
    titleFontBold: true,
    titleFontFace: "Inter, Arial, sans-serif",
    titleColor: "#0F172A",
    chartGridLine: { style: "solid", color: "#E5E7EB", size: 0.75 },
    showValue: config.showDataLabels !== false,
    barGapWidthPercent: 120,
    catAxisLabelFontSize: 12,
    catAxisLabelColor: "#475569",
    catAxisLabelFontFace: "Inter, Arial, sans-serif",
    valAxisLabelFontSize: 12,
    valAxisLabelColor: "#475569",
    valAxisLabelFontFace: "Inter, Arial, sans-serif",
    legendFontSize: 12,
    legendFontFace: "Inter, Arial, sans-serif",
    legendColor: "#475569",
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.05,
      blur: 4,
      offset: 2
    }
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

  // Premium color palette for charts - vibrant, modern, professional
  const premiumColors = config.colors || [
    "#3B82F6",  // Bright blue - primary
    "#10B981",  // Emerald - success
    "#F59E0B",  // Amber - warning
    "#8B5CF6",  // Purple - creative
    "#EC4899",  // Magenta - accent
    "#06B6D4",  // Cyan - tech
    "#EF4444",  // Red - alert
    "#14B8A6"   // Teal - calm
  ];

  const chartOptions: any = {
    x,
    y,
    w,
    h,
    chartColors: premiumColors,
    showLegend: config.showLegend !== false,
    legendPos: "b" as const,
    dataLabelFontSize: config.showDataLabels ? 12 : 0,
    dataLabelPosition: "ctr" as const,
    dataLabelColor: "#0F172A",
    dataLabelFontFace: "Inter, Arial, sans-serif",
    dataLabelFontBold: true,
    showTitle: !!config.title,
    title: config.title || "",
    titleFontSize: 20,
    titleFontBold: true,
    titleFontFace: "Inter, Arial, sans-serif",
    titleColor: "#0F172A",
    lineSmooth: true,
    chartGridLine: { style: "solid", color: "#E5E7EB", size: 0.75 },
    showValue: config.showDataLabels !== false,
    catAxisLabelFontSize: 12,
    catAxisLabelColor: "#475569",
    catAxisLabelFontFace: "Inter, Arial, sans-serif",
    valAxisLabelFontSize: 12,
    valAxisLabelColor: "#475569",
    valAxisLabelFontFace: "Inter, Arial, sans-serif",
    legendFontSize: 12,
    legendFontFace: "Inter, Arial, sans-serif",
    legendColor: "#475569",
    lineSize: 3,
    lineDataSymbol: "circle",
    lineDataSymbolSize: 6,
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.05,
      blur: 4,
      offset: 2
    }
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

  // Premium color palette for pie charts - vibrant, modern, professional
  const premiumColors = config.colors || [
    "#3B82F6",  // Bright blue - primary
    "#10B981",  // Emerald - success
    "#F59E0B",  // Amber - warning
    "#8B5CF6",  // Purple - creative
    "#EC4899",  // Magenta - accent
    "#06B6D4",  // Cyan - tech
    "#EF4444",  // Red - alert
    "#14B8A6",  // Teal - calm
    "#F97316",  // Orange - energy
    "#A855F7"   // Violet - luxury
  ];

  const chartOptions: any = {
    x,
    y,
    w,
    h,
    chartColors: premiumColors,
    showLegend: config.showLegend !== false,
    legendPos: "r" as const,
    dataLabelFontSize: config.showDataLabels ? 12 : 0,
    dataLabelPosition: "ctr" as const,
    dataLabelColor: "#0F172A",
    dataLabelFontFace: "Inter, Arial, sans-serif",
    dataLabelFontBold: true,
    showTitle: !!config.title,
    title: config.title || "",
    titleFontSize: 20,
    titleFontBold: true,
    titleFontFace: "Inter, Arial, sans-serif",
    titleColor: "#0F172A",
    showValue: config.showDataLabels !== false,
    legendFontSize: 12,
    legendFontFace: "Inter, Arial, sans-serif",
    legendColor: "#475569",
    pieHole: 0,
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.08,
      blur: 6,
      offset: 3
    }
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

  // Premium color palette for area charts with transparency - vibrant, modern
  const premiumColors = config.colors || [
    "#3B82F6",  // Bright blue - primary
    "#10B981",  // Emerald - success
    "#F59E0B",  // Amber - warning
    "#8B5CF6",  // Purple - creative
    "#EC4899",  // Magenta - accent
    "#06B6D4",  // Cyan - tech
    "#EF4444",  // Red - alert
    "#14B8A6"   // Teal - calm
  ];

  const chartOptions: any = {
    x,
    y,
    w,
    h,
    chartColors: premiumColors,
    showLegend: config.showLegend !== false,
    legendPos: "b" as const,
    dataLabelFontSize: config.showDataLabels ? 12 : 0,
    dataLabelPosition: "ctr" as const,
    dataLabelColor: "#0F172A",
    dataLabelFontFace: "Inter, Arial, sans-serif",
    dataLabelFontBold: true,
    showTitle: !!config.title,
    title: config.title || "",
    titleFontSize: 20,
    titleFontBold: true,
    titleFontFace: "Inter, Arial, sans-serif",
    titleColor: "#0F172A",
    lineSmooth: true,
    chartGridLine: { style: "solid", color: "#E5E7EB", size: 0.75 },
    showValue: config.showDataLabels !== false,
    catAxisLabelFontSize: 12,
    catAxisLabelColor: "#475569",
    catAxisLabelFontFace: "Inter, Arial, sans-serif",
    valAxisLabelFontSize: 12,
    valAxisLabelColor: "#475569",
    valAxisLabelFontFace: "Inter, Arial, sans-serif",
    legendFontSize: 12,
    legendFontFace: "Inter, Arial, sans-serif",
    legendColor: "#475569",
    lineSize: 2,
    fillOpacity: 30,
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.05,
      blur: 4,
      offset: 2
    }
  };

  slide.addChart(PptxGenJS.ChartType.area, chartData, chartOptions);
}

/**
 * Build a premium professional scatter chart with advanced styling
 */
export function buildScatterChart(
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

  const premiumColors = config.colors || [
    "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#EF4444", "#14B8A6"
  ];

  const chartOptions: any = {
    x, y, w, h,
    chartColors: premiumColors,
    showLegend: config.showLegend !== false,
    legendPos: "b" as const,
    dataLabelFontSize: config.showDataLabels ? 10 : 0,
    dataLabelColor: "#0F172A",
    dataLabelFontFace: "Inter, Arial, sans-serif",
    showTitle: !!config.title,
    title: config.title || "",
    titleFontSize: 20,
    titleFontBold: true,
    titleFontFace: "Inter, Arial, sans-serif",
    titleColor: "#0F172A",
    chartGridLine: { style: "solid", color: "#E5E7EB", size: 0.75 },
    catAxisLabelFontSize: 12,
    catAxisLabelColor: "#475569",
    valAxisLabelFontSize: 12,
    valAxisLabelColor: "#475569",
    lineDataSymbol: "circle",
    lineDataSymbolSize: 8,
    lineSize: 0, // No connecting lines for scatter
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.08,
      blur: 4,
      offset: 2
    }
  };

  slide.addChart(PptxGenJS.ChartType.scatter, chartData, chartOptions);
}

/**
 * Build a doughnut chart (pie chart with hole)
 */
export function buildDoughnutChart(
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

  const premiumColors = config.colors || [
    "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#EF4444", "#14B8A6", "#F97316", "#A855F7"
  ];

  const chartOptions: any = {
    x, y, w, h,
    chartColors: premiumColors,
    showLegend: config.showLegend !== false,
    legendPos: "r" as const,
    dataLabelFontSize: config.showDataLabels ? 12 : 0,
    dataLabelPosition: "ctr" as const,
    dataLabelColor: "#0F172A",
    dataLabelFontFace: "Inter, Arial, sans-serif",
    dataLabelFontBold: true,
    showTitle: !!config.title,
    title: config.title || "",
    titleFontSize: 20,
    titleFontBold: true,
    titleFontFace: "Inter, Arial, sans-serif",
    titleColor: "#0F172A",
    showValue: config.showDataLabels !== false,
    legendFontSize: 12,
    legendFontFace: "Inter, Arial, sans-serif",
    legendColor: "#475569",
    pieHole: 0.5, // 50% hole for doughnut effect
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.08,
      blur: 6,
      offset: 3
    }
  };

  slide.addChart(PptxGenJS.ChartType.pie, chartData, chartOptions);
}

/**
 * Build a waterfall chart showing cumulative effect
 */
export function buildWaterfallChart(
  slide: any,
  config: ChartConfig,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  // Waterfall charts show cumulative values
  // We'll use a bar chart with custom colors for positive/negative
  const values = config.series[0]?.values || [];
  const colors: string[] = [];

  // Color code: green for positive, red for negative, blue for total
  values.forEach((val, idx) => {
    if (idx === values.length - 1) {
      colors.push("#3B82F6"); // Blue for total
    } else if (val >= 0) {
      colors.push("#10B981"); // Green for positive
    } else {
      colors.push("#EF4444"); // Red for negative
    }
  });

  const chartData = [{
    name: config.series[0]?.name || "Values",
    labels: config.labels,
    values: values
  }];

  const chartOptions: any = {
    x, y, w, h,
    chartColors: colors,
    showLegend: false,
    dataLabelFontSize: config.showDataLabels ? 12 : 0,
    dataLabelPosition: "outEnd" as const,
    dataLabelColor: "#0F172A",
    dataLabelFontFace: "Inter, Arial, sans-serif",
    dataLabelFontBold: true,
    barDir: "bar" as const,
    showTitle: !!config.title,
    title: config.title || "",
    titleFontSize: 20,
    titleFontBold: true,
    titleFontFace: "Inter, Arial, sans-serif",
    titleColor: "#0F172A",
    chartGridLine: { style: "solid", color: "#E5E7EB", size: 0.75 },
    showValue: config.showDataLabels !== false,
    barGapWidthPercent: 150,
    catAxisLabelFontSize: 12,
    catAxisLabelColor: "#475569",
    valAxisLabelFontSize: 12,
    valAxisLabelColor: "#475569",
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.05,
      blur: 4,
      offset: 2
    }
  };

  slide.addChart(PptxGenJS.ChartType.bar, chartData, chartOptions);
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
    case "scatter":
      buildScatterChart(slide, config, x, y, w, h);
      break;
    case "doughnut":
      buildDoughnutChart(slide, config, x, y, w, h);
      break;
    case "waterfall":
      buildWaterfallChart(slide, config, x, y, w, h);
      break;
    case "combo":
      // Combo charts use multiple series with different types
      // For now, use line chart as fallback
      buildLineChart(slide, config, x, y, w, h);
      break;
    case "funnel":
      // Funnel charts are similar to bar charts but with decreasing widths
      // Use bar chart as fallback for now
      buildBarChart(slide, config, x, y, w, h);
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
  seriesCount: number,
  hasNegativeValues: boolean = false,
  isCumulative: boolean = false
): "bar" | "line" | "pie" | "area" | "scatter" | "doughnut" | "waterfall" {
  // Waterfall for cumulative/sequential data with positive and negative values
  if (isCumulative && hasNegativeValues) {
    return "waterfall";
  }

  // Doughnut for single series with few categories (better than pie for modern look)
  if (seriesCount === 1 && dataPoints <= 6) {
    return "doughnut";
  }

  // Scatter for correlation analysis (multiple series, moderate data points)
  if (seriesCount >= 2 && dataPoints >= 5 && dataPoints <= 20) {
    return "scatter";
  }

  // Line for time series or trends (many data points)
  if (seriesCount > 1 && dataPoints > 10) {
    return "line";
  }

  // Area for showing volume/magnitude over time
  if (dataPoints > 15) {
    return "area";
  }

  // Bar as default for comparisons
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

