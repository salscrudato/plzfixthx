/**
 * Image Optimization Module
 * - Downscale images to 96dpi (web standard)
 * - Convert to JPEG quality 82 unless PNG transparency needed
 * - Cache by URL hash to avoid re-processing
 */

import sharp from "sharp";
import crypto from "crypto";

/** In-memory cache for optimized images (URL hash → Buffer) */
const imageCache = new Map<string, Buffer>();

/** Maximum cache size (100 images × ~50KB avg = ~5MB) */
const MAX_CACHE_SIZE = 100;

/**
 * Get cache key from URL
 */
function getCacheKey(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex");
}

/**
 * Optimize image: downscale to 96dpi, convert to JPEG (quality 82) unless PNG transparency needed.
 * Returns optimized buffer or original if optimization fails.
 * Uses in-memory cache to avoid re-processing same URL.
 */
export async function optimizeImage(buffer: Buffer, url?: string): Promise<Buffer> {
  // Check cache first
  if (url) {
    const cacheKey = getCacheKey(url);
    const cached = imageCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    // Detect image format and metadata
    const metadata = await sharp(buffer).metadata();
    const { format, hasAlpha, width, height } = metadata;

    if (!width || !height) {
      return buffer; // Can't process, return original
    }

    // Calculate target dimensions for 96dpi (web standard)
    // Assume original is at 72dpi, scale to 96dpi = 1.33x
    // But we'll downscale to reasonable web size: max 1920px width
    const maxWidth = 1920;
    const scale = Math.min(1, maxWidth / width);
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    let pipeline = sharp(buffer)
      .resize(targetWidth, targetHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });

    // Decide output format
    if (hasAlpha && format === "png") {
      // Keep PNG for transparency
      pipeline = pipeline.png({ quality: 80, progressive: true });
    } else {
      // Convert to JPEG for better compression
      pipeline = pipeline.jpeg({ quality: 82, progressive: true });
    }

    const optimized = await pipeline.toBuffer();

    // Cache the result
    if (url) {
      const cacheKey = getCacheKey(url);
      imageCache.set(cacheKey, optimized);

      // Evict oldest entries if cache is too large
      if (imageCache.size > MAX_CACHE_SIZE) {
        const firstKey = imageCache.keys().next().value;
        if (firstKey) imageCache.delete(firstKey);
      }
    }

    return optimized;
  } catch (e) {
    // If optimization fails, return original buffer
    console.warn("Image optimization failed, using original:", e);
    return buffer;
  }
}

/**
 * Clear image cache (useful for testing or memory management)
 */
export function clearImageCache(): void {
  imageCache.clear();
}

/**
 * Get cache statistics (for monitoring)
 */
export function getImageCacheStats(): { size: number; entries: number } {
  let totalSize = 0;
  for (const buffer of imageCache.values()) {
    totalSize += buffer.length;
  }
  return { size: totalSize, entries: imageCache.size };
}

