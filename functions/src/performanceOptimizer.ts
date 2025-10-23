/**
 * Performance Optimizer
 * Handles caching, memoization, and performance monitoring
 */

import { logger } from "firebase-functions/v2";

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class PerformanceCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached value if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set cache value with TTL
   */
  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Performance metrics tracker
 */
class PerformanceMetrics {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Record metric value
   */
  record(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  /**
   * Get average for metric
   */
  getAverage(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get max for metric
   */
  getMax(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return Math.max(...values);
  }

  /**
   * Get min for metric
   */
  getMin(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return Math.min(...values);
  }

  /**
   * Get all metrics summary
   */
  getSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, any> = {};
    for (const [name, values] of this.metrics.entries()) {
      summary[name] = {
        avg: this.getAverage(name),
        min: this.getMin(name),
        max: this.getMax(name),
        count: values.length
      };
    }
    return summary;
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

/**
 * Measure execution time of async function
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metrics?: PerformanceMetrics
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    if (metrics) {
      metrics.record(name, duration);
    }
    logger.info(`⏱️ ${name} completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`❌ ${name} failed after ${duration}ms`, { error });
    throw error;
  }
}

/**
 * Measure execution time of sync function
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  metrics?: PerformanceMetrics
): T {
  const start = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - start;
    if (metrics) {
      metrics.record(name, duration);
    }
    logger.info(`⏱️ ${name} completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`❌ ${name} failed after ${duration}ms`, { error });
    throw error;
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 100
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, { error });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, any>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Batch operations for efficiency
 */
export class BatchProcessor<T, R> {
  private queue: T[] = [];
  private processing = false;
  private readonly batchSize: number;
  private readonly processor: (batch: T[]) => Promise<R[]>;

  constructor(batchSize: number, processor: (batch: T[]) => Promise<R[]>) {
    this.batchSize = batchSize;
    this.processor = processor;
  }

  /**
   * Add item to batch
   */
  async add(item: T): Promise<R[] | null> {
    this.queue.push(item);
    if (this.queue.length >= this.batchSize) {
      return this.flush();
    }
    return null;
  }

  /**
   * Process all queued items
   */
  async flush(): Promise<R[] | null> {
    if (this.queue.length === 0 || this.processing) {
      return null;
    }

    this.processing = true;
    try {
      const batch = this.queue.splice(0, this.batchSize);
      const results = await this.processor(batch);
      return results;
    } finally {
      this.processing = false;
    }
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }
}

// Export singleton instances
export const performanceCache = new PerformanceCache();
export const performanceMetrics = new PerformanceMetrics();

