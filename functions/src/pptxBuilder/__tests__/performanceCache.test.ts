import { describe, it, expect, beforeEach } from "vitest";
import {
  LRUCache,
  MetricsTracker,
  getCacheKey,
  getCachedSvgBackground,
  cacheSvgBackground,
  clearAllCaches,
  getCacheStats
} from "../performanceCache";

describe("performanceCache", () => {
  describe("LRUCache", () => {
    let cache: LRUCache<string, string>;

    beforeEach(() => {
      cache = new LRUCache(3);
    });

    it("should store and retrieve values", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("should return undefined for missing keys", () => {
      expect(cache.get("nonexistent")).toBeUndefined();
    });

    it("should evict oldest item when capacity exceeded", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");
      cache.set("key4", "value4"); // Should evict key1

      expect(cache.get("key1")).toBeUndefined();
      expect(cache.get("key4")).toBe("value4");
    });

    it("should move accessed item to end (most recently used)", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");

      // Access key1 to make it most recently used
      cache.get("key1");

      // Add key4, should evict key2 (least recently used)
      cache.set("key4", "value4");

      expect(cache.get("key1")).toBe("value1");
      expect(cache.get("key2")).toBeUndefined();
    });

    it("should report correct size", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      expect(cache.size()).toBe(2);
    });

    it("should clear all items", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.get("key1")).toBeUndefined();
    });
  });

  describe("MetricsTracker", () => {
    let tracker: MetricsTracker;

    beforeEach(() => {
      tracker = new MetricsTracker();
    });

    it("should record stage metrics", () => {
      tracker.recordStage("parse", true);
      tracker.recordStage("build", true);

      const metrics = tracker.getMetrics();
      expect(metrics.length).toBe(2);
      expect(metrics[0].stage).toBe("parse");
      expect(metrics[1].stage).toBe("build");
    });

    it("should track success status", () => {
      tracker.recordStage("parse", true);
      tracker.recordStage("build", false, "Build failed");

      const metrics = tracker.getMetrics();
      expect(metrics[0].success).toBe(true);
      expect(metrics[1].success).toBe(false);
      expect(metrics[1].error).toBe("Build failed");
    });

    it("should calculate total duration", () => {
      tracker.recordStage("stage1", true);
      const duration = tracker.getTotalDuration();
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it("should report memory usage", () => {
      const memory = tracker.getMemoryUsage();
      expect(memory).toBeGreaterThan(0);
    });

    it("should check budget compliance", () => {
      tracker.recordStage("stage1", true);
      const withinBudget = tracker.isWithinBudget(5000, 500); // 5s, 500MB
      expect(typeof withinBudget).toBe("boolean");
    });
  });

  describe("SVG background cache", () => {
    beforeEach(() => {
      clearAllCaches();
    });

    it("should generate cache key from spec", () => {
      const spec = {
        styleTokens: {
          palette: {
            primary: "#6366F1",
            accent: "#EC4899"
          }
        },
        meta: {
          theme: "Professional",
          aspectRatio: "16:9"
        }
      };

      const key = getCacheKey(spec);
      expect(key).toContain("Professional");
      expect(key).toContain("16:9");
      expect(key).toContain("#6366F1");
    });

    it("should cache and retrieve SVG backgrounds", () => {
      const spec = {
        styleTokens: {
          palette: {
            primary: "#6366F1",
            accent: "#EC4899"
          }
        },
        meta: {
          theme: "Professional",
          aspectRatio: "16:9"
        }
      };

      const svg = "<svg>test</svg>";
      cacheSvgBackground(spec, svg);

      const cached = getCachedSvgBackground(spec);
      expect(cached).toBe(svg);
    });

    it("should return undefined for uncached spec", () => {
      const spec = {
        styleTokens: {
          palette: {
            primary: "#000000",
            accent: "#FFFFFF"
          }
        },
        meta: {
          theme: "Minimal",
          aspectRatio: "4:3"
        }
      };

      const cached = getCachedSvgBackground(spec);
      expect(cached).toBeUndefined();
    });

    it("should report cache statistics", () => {
      const stats = getCacheStats();
      expect(stats).toHaveProperty("svgCacheSize");
      expect(stats).toHaveProperty("maxCacheSize");
      expect(stats.maxCacheSize).toBe(50);
    });

    it("should clear all caches", () => {
      const spec = {
        styleTokens: {
          palette: {
            primary: "#6366F1",
            accent: "#EC4899"
          }
        },
        meta: {
          theme: "Professional",
          aspectRatio: "16:9"
        }
      };

      cacheSvgBackground(spec, "<svg>test</svg>");
      clearAllCaches();

      const cached = getCachedSvgBackground(spec);
      expect(cached).toBeUndefined();
    });
  });
});

