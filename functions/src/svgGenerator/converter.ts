/**
 * SVG to PNG Converter
 * Converts SVG backgrounds to PNG for embedding in PowerPoint
 */

import sharp from 'sharp';

/**
 * Convert SVG string to PNG base64 data URL
 */
export async function svgToPngDataUrl(svgString: string, width: number = 1920, height: number = 1080): Promise<string> {
  try {
    // Convert SVG to PNG buffer using sharp
    const pngBuffer = await sharp(Buffer.from(svgString))
      .resize(width, height, {
        fit: 'fill',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png({
        quality: 100,
        compressionLevel: 6,
      })
      .toBuffer();

    // Convert to base64 data URL
    const base64 = pngBuffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    throw new Error('Failed to convert SVG to PNG');
  }
}

/**
 * Convert SVG string to PNG buffer
 */
export async function svgToPngBuffer(svgString: string, width: number = 1920, height: number = 1080): Promise<Buffer> {
  try {
    return await sharp(Buffer.from(svgString))
      .resize(width, height, {
        fit: 'fill',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png({
        quality: 100,
        compressionLevel: 6,
      })
      .toBuffer();
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    throw new Error('Failed to convert SVG to PNG');
  }
}

/**
 * Optimize PNG for smaller file size
 */
export async function optimizePng(pngBuffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(pngBuffer)
      .png({
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toBuffer();
  } catch (error) {
    console.error('Error optimizing PNG:', error);
    return pngBuffer; // Return original if optimization fails
  }
}

