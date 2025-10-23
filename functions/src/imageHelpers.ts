/**
 * Image Helpers
 * Fetch, process, and embed images from various sources
 */

import { logger } from "firebase-functions/v2";

export interface ImageSource {
  type: "url" | "unsplash" | "placeholder";
  url?: string;
  query?: string;
  alt?: string;
}

export interface ProcessedImage {
  data: Buffer;
  mimeType: string;
  width: number;
  height: number;
}

/**
 * Fetch image from URL
 */
export async function fetchImageFromUrl(url: string): Promise<ProcessedImage | null> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      logger.warn(`Failed to fetch image from ${url}: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Basic validation
    if (buffer.length === 0) {
      logger.warn(`Empty image data from ${url}`);
      return null;
    }

    // Estimate dimensions (actual dimensions would require image processing library)
    // For now, use default dimensions
    return {
      data: buffer,
      mimeType: contentType,
      width: 1920,
      height: 1080
    };
  } catch (error) {
    logger.error(`Error fetching image from ${url}:`, error);
    return null;
  }
}

/**
 * Fetch image from Unsplash
 * Uses Unsplash API to get high-quality stock photos
 */
export async function fetchImageFromUnsplash(
  query: string,
  width: number = 1920,
  height: number = 1080
): Promise<ProcessedImage | null> {
  try {
    // Unsplash Source API (no API key required for basic usage)
    // For production, use official Unsplash API with proper attribution
    const unsplashUrl = `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`;
    
    logger.info(`Fetching Unsplash image for query: ${query}`);
    return await fetchImageFromUrl(unsplashUrl);
  } catch (error) {
    logger.error(`Error fetching Unsplash image for query "${query}":`, error);
    return null;
  }
}

/**
 * Generate placeholder image data URL
 * Creates a simple colored rectangle as placeholder
 */
export function generatePlaceholderImage(
  width: number = 1920,
  height: number = 1080,
  color: string = "#E5E7EB",
  text: string = "Image Placeholder"
): string {
  // Generate SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" 
            fill="#6B7280" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/**
 * Process image source and return image data
 */
export async function processImageSource(source: ImageSource): Promise<ProcessedImage | string | null> {
  switch (source.type) {
    case "url":
      if (!source.url) {
        logger.warn("URL image source missing url property");
        return null;
      }
      return await fetchImageFromUrl(source.url);

    case "unsplash":
      if (!source.query) {
        logger.warn("Unsplash image source missing query property");
        return null;
      }
      return await fetchImageFromUnsplash(source.query);

    case "placeholder":
      return generatePlaceholderImage(1920, 1080, "#E5E7EB", source.alt || "Image");

    default:
      logger.warn(`Unknown image source type: ${source.type}`);
      return null;
  }
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const validProtocols = ["http:", "https:"];
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    
    if (!validProtocols.includes(parsed.protocol)) {
      return false;
    }

    const pathname = parsed.pathname.toLowerCase();
    return validExtensions.some(ext => pathname.endsWith(ext)) || pathname.includes("/image");
  } catch {
    return false;
  }
}

/**
 * Get optimal image dimensions for slide layout
 */
export function getOptimalImageDimensions(
  role: "hero" | "logo" | "illustration" | "icon" | "background",
  slideWidth: number = 10,
  slideHeight: number = 7.5
): { width: number; height: number; x: number; y: number; w: number; h: number } {
  switch (role) {
    case "hero":
      // Large hero image - 60% of slide width, centered
      return {
        width: 1920,
        height: 1080,
        x: slideWidth * 0.05,
        y: slideHeight * 0.15,
        w: slideWidth * 0.9,
        h: slideHeight * 0.7
      };

    case "logo":
      // Small logo - top right corner
      return {
        width: 400,
        height: 400,
        x: slideWidth - 1.5,
        y: 0.5,
        w: 1,
        h: 1
      };

    case "illustration":
      // Medium illustration - right side
      return {
        width: 1200,
        height: 1200,
        x: slideWidth * 0.55,
        y: slideHeight * 0.2,
        w: slideWidth * 0.4,
        h: slideHeight * 0.6
      };

    case "icon":
      // Small icon - inline with content
      return {
        width: 200,
        height: 200,
        x: 0.5,
        y: 2,
        w: 0.5,
        h: 0.5
      };

    case "background":
      // Full slide background
      return {
        width: 1920,
        height: 1080,
        x: 0,
        y: 0,
        w: slideWidth,
        h: slideHeight
      };

    default:
      // Default medium size
      return {
        width: 1200,
        height: 800,
        x: slideWidth * 0.1,
        y: slideHeight * 0.2,
        w: slideWidth * 0.8,
        h: slideHeight * 0.6
      };
  }
}

/**
 * Extract dominant color from image URL (simplified)
 * In production, use image processing library to analyze actual image
 */
export function estimateDominantColor(imageUrl: string): string {
  // Simple heuristic based on URL keywords
  const url = imageUrl.toLowerCase();
  
  if (url.includes("blue") || url.includes("ocean") || url.includes("sky")) return "#3B82F6";
  if (url.includes("green") || url.includes("nature") || url.includes("forest")) return "#10B981";
  if (url.includes("red") || url.includes("fire") || url.includes("sunset")) return "#EF4444";
  if (url.includes("purple") || url.includes("violet")) return "#8B5CF6";
  if (url.includes("orange") || url.includes("autumn")) return "#F59E0B";
  if (url.includes("pink") || url.includes("rose")) return "#EC4899";
  
  // Default neutral
  return "#64748B";
}

/**
 * Suggest Unsplash search queries based on slide content
 */
export function suggestImageQuery(
  title: string,
  subtitle?: string,
  contentType?: string
): string {
  const text = `${title} ${subtitle || ""}`.toLowerCase();
  
  // Business/Corporate
  if (text.match(/business|corporate|office|meeting|team/)) {
    return "business professional office";
  }
  
  // Technology
  if (text.match(/tech|software|digital|ai|data|cloud/)) {
    return "technology abstract modern";
  }
  
  // Finance
  if (text.match(/finance|money|investment|revenue|profit/)) {
    return "finance business growth";
  }
  
  // Healthcare
  if (text.match(/health|medical|care|wellness/)) {
    return "healthcare medical professional";
  }
  
  // Marketing
  if (text.match(/marketing|brand|campaign|social/)) {
    return "marketing creative design";
  }
  
  // Growth/Success
  if (text.match(/growth|success|achievement|goal/)) {
    return "success growth achievement";
  }
  
  // Innovation
  if (text.match(/innovation|future|transform|disrupt/)) {
    return "innovation technology future";
  }
  
  // Default
  return "business professional modern";
}

