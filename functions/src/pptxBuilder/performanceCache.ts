/**
 * Performance Cache and Metrics
 * LRU cache for SVG backgrounds and performance tracking
 */

import { logger } from "firebase-functions/v2";

/**
 * LRU Cache implementation
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  set(key: K, value: V): void {
    // Remove if exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end
    this.cache.set(key, value);

    // Remove oldest if over capacity
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value as K;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  stage: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsed?: number;
  success: boolean;
  error?: string;
}

/**
 * Build metrics tracker
 */
export class MetricsTracker {
  private metrics: PerformanceMetrics[] = [];
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  recordStage(
    stage: string,
    success: boolean,
    error?: string
  ): void {
    const now = Date.now();
    const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024; // MB

    this.metrics.push({
      stage,
      startTime: this.startTime,
      endTime: now,
      duration: now - this.startTime,
      memoryUsed,
      success,
      error
    });

    logger.info(`📊 Stage "${stage}" completed`, {
      duration: now - this.startTime,
      memoryMB: memoryUsed.toFixed(2),
      success
    });
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  getTotalDuration(): number {
    if (this.metrics.length === 0) return 0;
    const lastMetric = this.metrics[this.metrics.length - 1];
    return (lastMetric.endTime || Date.now()) - this.startTime;
  }

  getMemoryUsage(): number {
    return process.memoryUsage().heapUsed / 1024 / 1024; // MB
  }

  isWithinBudget(maxDurationMs: number = 1500, maxMemoryMb: number = 300): boolean {
    const duration = this.getTotalDuration();
    const memory = this.getMemoryUsage();

    return duration <= maxDurationMs && memory <= maxMemoryMb;
  }

  logSummary(): void {
    const totalDuration = this.getTotalDuration();
    const memoryUsage = this.getMemoryUsage();
    const withinBudget = this.isWithinBudget();

    logger.info("📈 Performance Summary", {
      totalDurationMs: totalDuration,
      memoryUsageMB: memoryUsage.toFixed(2),
      stageCount: this.metrics.length,
      withinBudget,
      stages: this.metrics.map(m => ({
        stage: m.stage,
        durationMs: m.duration,
        success: m.success
      }))
    });
  }
}

/**
 * Global SVG background cache
 */
const svgBackgroundCache = new LRUCache<string, string>(50);

/**
 * Get cache key from spec
 */
export function getCacheKey(spec: any): string {
  const palette = spec.styleTokens?.palette;
  const theme = spec.meta?.theme || "default";
  const aspectRatio = spec.meta?.aspectRatio || "16:9";

  return `${theme}:${aspectRatio}:${palette?.primary}:${palette?.accent}`;
}

/**
 * Get cached SVG background
 */
export function getCachedSvgBackground(spec: any): string | undefined {
  const key = getCacheKey(spec);
  return svgBackgroundCache.get(key);
}

/**
 * Cache SVG background
 */
export function cacheSvgBackground(spec: any, svg: string): void {
  const key = getCacheKey(spec);
  svgBackgroundCache.set(key, svg);
  logger.info("💾 SVG cached", { key, cacheSize: svgBackgroundCache.size() });
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  svgBackgroundCache.clear();
  logger.info("🗑️ All caches cleared");
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  svgCacheSize: number;
  maxCacheSize: number;
} {
  return {
    svgCacheSize: svgBackgroundCache.size(),
    maxCacheSize: 50
  };
}

