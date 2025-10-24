/**
 * PPTX Builder Orchestrator
 * Manages the multi-tier fallback approach for slide generation
 * Runs: Layout → Hybrid → Premium → Minimal
 * 
 * This ensures professional-grade slides with graceful degradation
 */

import PptxGenJS from "pptxgenjs";
import { logger } from "firebase-functions/v2";
import type { SlideSpecV1 } from "../types/SlideSpecV1";
import { buildPrecisionSlide } from "./precisionBuilder";
import { buildEnhancedPremiumSlide } from "./enhancedPremiumBuilder";
import { buildLayoutSlide } from "./layoutBuilder";
import { buildHybridSlide } from "./hybridBuilder";
import { buildPremiumSlide } from "./premiumBuilder";
import { buildMinimalSlide } from "./minimalBuilder";

/**
 * Slide dimensions by aspect ratio
 */
export interface SlideDimensions {
  wIn: number;  // width in inches
  hIn: number;  // height in inches
}

/**
 * Get slide dimensions based on aspect ratio
 */
export function getSlideDims(ar: "16:9" | "4:3"): SlideDimensions {
  if (ar === "4:3") {
    return { wIn: 10, hIn: 7.5 };
  }
  return { wIn: 10, hIn: 5.625 }; // 16:9 default
}

/**
 * Builder stage metrics
 */
export interface StageMetrics {
  stage: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
}

/**
 * Build result with metrics
 */
export interface BuildResult {
  success: boolean;
  stage: string;
  metrics: StageMetrics[];
  totalDuration: number;
  error?: string;
}

/**
 * Build slide with multi-tier fallback approach
 * Tries: Precision → Enhanced Premium → Layout → Hybrid → Premium → Minimal
 *
 * @param pptx PptxGenJS instance
 * @param spec SlideSpecV1 specification
 * @returns BuildResult with metrics
 */
export async function buildWithFallback(
  pptx: PptxGenJS,
  spec: SlideSpecV1
): Promise<BuildResult> {
  const startTime = Date.now();
  const metrics: StageMetrics[] = [];

  // Ensure spec has required fields
  if (!spec.content?.title || !spec.styleTokens) {
    throw new Error("Spec missing required fields: content.title or styleTokens");
  }

  // Get slide dimensions
  const dims = getSlideDims(spec.meta.aspectRatio);
  logger.info("🎯 Starting orchestrated build with precision layout", {
    aspectRatio: spec.meta.aspectRatio,
    dims,
    theme: spec.meta.theme
  });

  // Stage 0: Precision Builder (exact layout control)
  try {
    const stageStart = Date.now();
    logger.info("🎯 Attempting Precision Builder (exact layout specifications)...");
    await buildPrecisionSlide(pptx, spec);
    const stageDuration = Date.now() - stageStart;
    metrics.push({
      stage: "precision",
      startTime: stageStart,
      endTime: Date.now(),
      duration: stageDuration,
      success: true
    });
    logger.info("✅ Precision Builder succeeded", { duration: stageDuration });
    return {
      success: true,
      stage: "precision",
      metrics,
      totalDuration: Date.now() - startTime
    };
  } catch (error) {
    const stageDuration = Date.now() - (metrics[0]?.startTime || startTime);
    metrics.push({
      stage: "precision",
      startTime: metrics[0]?.startTime || startTime,
      endTime: Date.now(),
      duration: stageDuration,
      success: false,
      error: String(error)
    });
    logger.warn("⚠️ Precision Builder failed, trying Enhanced Premium Builder", { error: String(error) });
  }

  // Stage 1: Enhanced Premium Builder (world-class design)
  try {
    const stageStart = Date.now();
    logger.info("✨ Attempting Enhanced Premium Builder (world-class design)...");
    await buildEnhancedPremiumSlide(pptx, spec);
    const stageDuration = Date.now() - stageStart;
    metrics.push({
      stage: "enhanced-premium",
      startTime: stageStart,
      endTime: Date.now(),
      duration: stageDuration,
      success: true
    });
    logger.info("✅ Enhanced Premium Builder succeeded", { duration: stageDuration });
    return {
      success: true,
      stage: "enhanced-premium",
      metrics,
      totalDuration: Date.now() - startTime
    };
  } catch (error) {
    const stageDuration = Date.now() - (metrics[metrics.length - 1]?.startTime || startTime);
    metrics.push({
      stage: "enhanced-premium",
      startTime: metrics[metrics.length - 1]?.startTime || startTime,
      endTime: Date.now(),
      duration: stageDuration,
      success: false,
      error: String(error)
    });
    logger.warn("⚠️ Enhanced Premium Builder failed, trying Layout Builder", { error: String(error) });
  }

  // Stage 2: Layout Builder
  try {
    const stageStart = Date.now();
    logger.info("📐 Attempting Layout Builder...");
    await buildLayoutSlide(pptx, spec);
    const stageDuration = Date.now() - stageStart;
    metrics.push({
      stage: "layout",
      startTime: stageStart,
      endTime: Date.now(),
      duration: stageDuration,
      success: true
    });
    logger.info("✅ Layout Builder succeeded", { duration: stageDuration });
    return {
      success: true,
      stage: "layout",
      metrics,
      totalDuration: Date.now() - startTime
    };
  } catch (error) {
    const stageDuration = Date.now() - (metrics[metrics.length - 1]?.endTime || startTime);
    metrics.push({
      stage: "layout",
      startTime: metrics[metrics.length - 1]?.endTime || startTime,
      endTime: Date.now(),
      duration: stageDuration,
      success: false,
      error: String(error)
    });
    logger.warn("⚠️ Layout Builder failed, trying Hybrid", { error: String(error) });
  }

  // Stage 2: Hybrid Builder (SVG + editable content)
  try {
    const stageStart = Date.now();
    logger.info("🎨 Attempting Hybrid Builder...");
    await buildHybridSlide(pptx, spec);
    const stageDuration = Date.now() - stageStart;
    metrics.push({
      stage: "hybrid",
      startTime: stageStart,
      endTime: Date.now(),
      duration: stageDuration,
      success: true
    });
    logger.info("✅ Hybrid Builder succeeded", { duration: stageDuration });
    return {
      success: true,
      stage: "hybrid",
      metrics,
      totalDuration: Date.now() - startTime
    };
  } catch (error) {
    const stageStart = metrics[metrics.length - 1]?.endTime || startTime;
    const stageDuration = Date.now() - stageStart;
    metrics.push({
      stage: "hybrid",
      startTime: stageStart,
      endTime: Date.now(),
      duration: stageDuration,
      success: false,
      error: String(error)
    });
    logger.warn("⚠️ Hybrid Builder failed, trying Premium", { error: String(error) });
  }

  // Stage 3: Premium Builder (sophisticated design)
  try {
    const stageStart = Date.now();
    logger.info("💎 Attempting Premium Builder...");
    await buildPremiumSlide(pptx, spec);
    const stageDuration = Date.now() - stageStart;
    metrics.push({
      stage: "premium",
      startTime: stageStart,
      endTime: Date.now(),
      duration: stageDuration,
      success: true
    });
    logger.info("✅ Premium Builder succeeded", { duration: stageDuration });
    return {
      success: true,
      stage: "premium",
      metrics,
      totalDuration: Date.now() - startTime
    };
  } catch (error) {
    const stageStart = metrics[metrics.length - 1]?.endTime || startTime;
    const stageDuration = Date.now() - stageStart;
    metrics.push({
      stage: "premium",
      startTime: stageStart,
      endTime: Date.now(),
      duration: stageDuration,
      success: false,
      error: String(error)
    });
    logger.warn("⚠️ Premium Builder failed, trying Minimal", { error: String(error) });
  }

  // Stage 4: Minimal Builder (fallback)
  try {
    const stageStart = Date.now();
    logger.info("🔧 Attempting Minimal Builder (fallback)...");
    await buildMinimalSlide(pptx, spec);
    const stageDuration = Date.now() - stageStart;
    metrics.push({
      stage: "minimal",
      startTime: stageStart,
      endTime: Date.now(),
      duration: stageDuration,
      success: true
    });
    logger.info("✅ Minimal Builder succeeded (fallback)", { duration: stageDuration });
    return {
      success: true,
      stage: "minimal",
      metrics,
      totalDuration: Date.now() - startTime
    };
  } catch (error) {
    const stageStart = metrics[metrics.length - 1]?.endTime || startTime;
    const stageDuration = Date.now() - stageStart;
    metrics.push({
      stage: "minimal",
      startTime: stageStart,
      endTime: Date.now(),
      duration: stageDuration,
      success: false,
      error: String(error)
    });
    logger.error("❌ All builders failed", { metrics });
    throw new Error(`All builders failed. Last error: ${String(error)}`);
  }
}
