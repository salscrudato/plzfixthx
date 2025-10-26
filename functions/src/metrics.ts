/**
 * Metrics collection and reporting for plzfixthx functions.
 * Tracks counters, latencies, and errors for observability.
 */

import * as logger from "firebase-functions/logger";

/* -------------------------------------------------------------------------- */
/*                            Metrics Store                                   */
/* -------------------------------------------------------------------------- */

interface MetricCounter {
  count: number;
  lastUpdated: number;
}

interface MetricHistogram {
  values: number[];
  count: number;
  sum: number;
  min: number;
  max: number;
}

const counters = new Map<string, MetricCounter>();
const histograms = new Map<string, MetricHistogram>();

// Cleanup old metrics every 1 hour
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  for (const [key, counter] of counters.entries()) {
    if (counter.lastUpdated < oneHourAgo) {
      counters.delete(key);
    }
  }

  for (const [, histogram] of histograms.entries()) {
    // Keep histograms for analysis
    if (histogram.values.length > 1000) {
      histogram.values = histogram.values.slice(-500);
    }
  }
}, 60 * 60 * 1000);

/* -------------------------------------------------------------------------- */
/*                            Counter Metrics                                 */
/* -------------------------------------------------------------------------- */

/**
 * Increment a counter metric
 */
export function incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
  const key = labels ? `${name}:${JSON.stringify(labels)}` : name;
  const counter = counters.get(key) || { count: 0, lastUpdated: Date.now() };
  counter.count += value;
  counter.lastUpdated = Date.now();
  counters.set(key, counter);
}

/**
 * Get counter value
 */
export function getCounter(name: string, labels?: Record<string, string>): number {
  const key = labels ? `${name}:${JSON.stringify(labels)}` : name;
  return counters.get(key)?.count ?? 0;
}

/**
 * Reset counter
 */
export function resetCounter(name: string, labels?: Record<string, string>): void {
  const key = labels ? `${name}:${JSON.stringify(labels)}` : name;
  counters.delete(key);
}

/* -------------------------------------------------------------------------- */
/*                            Histogram Metrics                               */
/* -------------------------------------------------------------------------- */

/**
 * Record a histogram value (for latencies, sizes, etc.)
 */
export function recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
  const key = labels ? `${name}:${JSON.stringify(labels)}` : name;
  let histogram = histograms.get(key);

  if (!histogram) {
    histogram = { values: [], count: 0, sum: 0, min: value, max: value };
  }

  histogram.values.push(value);
  histogram.count++;
  histogram.sum += value;
  histogram.min = Math.min(histogram.min, value);
  histogram.max = Math.max(histogram.max, value);

  histograms.set(key, histogram);
}

/**
 * Get histogram statistics
 */
export function getHistogramStats(name: string, labels?: Record<string, string>): {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
} | null {
  const key = labels ? `${name}:${JSON.stringify(labels)}` : name;
  const histogram = histograms.get(key);

  if (!histogram || histogram.count === 0) {
    return null;
  }

  const sorted = [...histogram.values].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];

  return {
    count: histogram.count,
    sum: histogram.sum,
    min: histogram.min,
    max: histogram.max,
    avg: histogram.sum / histogram.count,
    p50,
    p95,
    p99,
  };
}

/* -------------------------------------------------------------------------- */
/*                            Metric Reporting                                */
/* -------------------------------------------------------------------------- */

/**
 * Report all metrics to logs (for Cloud Logging)
 */
export function reportMetrics(): void {
  const metricsData: Record<string, any> = {
    timestamp: new Date().toISOString(),
    counters: {},
    histograms: {},
  };

  // Collect counters
  for (const [key, counter] of counters.entries()) {
    metricsData.counters[key] = counter.count;
  }

  // Collect histogram stats
  for (const [key] of histograms.entries()) {
    const stats = getHistogramStats(key);
    if (stats) {
      metricsData.histograms[key] = stats;
    }
  }

  logger.info("📊 Metrics Report", metricsData);
}

/**
 * Common metric names
 */
export const MetricNames = {
  // Counters
  REQUESTS_TOTAL: "requests_total",
  REQUESTS_SUCCESS: "requests_success",
  REQUESTS_ERROR: "requests_error",
  REQUESTS_MODERATION_REJECTED: "requests_moderation_rejected",
  REQUESTS_ABUSE_DETECTED: "requests_abuse_detected",
  REQUESTS_RATE_LIMITED: "requests_rate_limited",

  // Histograms
  REQUEST_DURATION_MS: "request_duration_ms",
  AI_GENERATION_DURATION_MS: "ai_generation_duration_ms",
  PPTX_EXPORT_DURATION_MS: "pptx_export_duration_ms",
  IMAGE_FETCH_DURATION_MS: "image_fetch_duration_ms",
  MEMORY_USED_MB: "memory_used_mb",
  PPTX_SIZE_MB: "pptx_size_mb",
} as const;

/**
 * Track request metrics
 */
export function trackRequest(
  endpoint: string,
  durationMs: number,
  success: boolean,
  error?: string
): void {
  const labels = { endpoint };

  incrementCounter(MetricNames.REQUESTS_TOTAL, 1, labels);

  if (success) {
    incrementCounter(MetricNames.REQUESTS_SUCCESS, 1, labels);
  } else {
    incrementCounter(MetricNames.REQUESTS_ERROR, 1, labels);
    if (error) {
      logger.error(`❌ Request failed: ${error}`, { endpoint, error });
    }
  }

  recordHistogram(MetricNames.REQUEST_DURATION_MS, durationMs, labels);
}

/**
 * Track AI generation metrics
 */
export function trackAIGeneration(durationMs: number, success: boolean, error?: string): void {
  if (success) {
    recordHistogram(MetricNames.AI_GENERATION_DURATION_MS, durationMs);
  } else {
    incrementCounter(MetricNames.REQUESTS_ERROR, 1, { endpoint: "generateSlideSpec" });
    if (error) {
      logger.error(`❌ AI generation failed: ${error}`, { error });
    }
  }
}

/**
 * Track PPTX export metrics
 */
export function trackPPTXExport(durationMs: number, sizeMB: number, slideCount: number): void {
  recordHistogram(MetricNames.PPTX_EXPORT_DURATION_MS, durationMs);
  recordHistogram(MetricNames.PPTX_SIZE_MB, sizeMB, { slideCount: String(slideCount) });
}

/**
 * Track image fetch metrics
 */
export function trackImageFetch(durationMs: number, success: boolean): void {
  recordHistogram(MetricNames.IMAGE_FETCH_DURATION_MS, durationMs);
  if (!success) {
    incrementCounter("image_fetch_failures");
  }
}

