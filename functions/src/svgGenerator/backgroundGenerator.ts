/**
 * SVG Background Generator
 * Creates professional slide backgrounds with gradients and decorative elements
 */

import { createGradientDef, getGradient, createGradientFromPalette, createRadialGradientFromPalette, type GradientConfig } from './gradients';
import {
  createAccentBar,
  createCornerAccent,
  createDecorativeCircles,
  createDividerLine,
  createGeometricPattern,
  createCurvedAccent,
  createGlowFilter,
  createShadowFilter,
  createAbstractShape,
  createGridPattern,
  createArrow,
  createWavePattern,
} from './decorativeElements';

export interface BackgroundConfig {
  width?: number;
  height?: number;
  theme?: 'minimal' | 'professional' | 'creative' | 'tech' | 'elegant';
  palette: {
    primary: string;
    accent: string;
    neutral: string[];
  };
  style?: 'subtle' | 'bold' | 'modern';
}

/**
 * Generate complete SVG background
 */
export function generateBackground(config: BackgroundConfig): string {
  const width = config.width || 1920;
  const height = config.height || 1080;
  const theme = config.theme || 'professional';
  const style = config.style || 'subtle';

  // Get gradient based on palette
  const gradient = createGradientFromPalette(config.palette);

  // Build SVG
  const defs = buildDefs(gradient, config);
  const background = buildBackgroundLayer(gradient, width, height);
  const decorations = buildDecorations(theme, style, config.palette, width, height);

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${defs}
  </defs>
  
  <!-- Background Layer -->
  ${background}
  
  <!-- Decorative Elements -->
  ${decorations}
</svg>`.trim();
}

/**
 * Build SVG definitions (gradients, filters)
 */
function buildDefs(gradient: GradientConfig, config: BackgroundConfig): string {
  const gradientDef = createGradientDef(gradient);
  const glowFilter = createGlowFilter('glow', config.palette.primary, 10);
  const shadowFilter = createShadowFilter('shadow');

  return `
    ${gradientDef}
    ${glowFilter}
    ${shadowFilter}
  `;
}

/**
 * Build background layer with gradient
 */
function buildBackgroundLayer(gradient: GradientConfig, width: number, height: number): string {
  return `
  <rect width="${width}" height="${height}" fill="url(#${gradient.id})"/>`;
}

/**
 * Build decorative elements based on theme
 */
function buildDecorations(
  theme: string,
  style: string,
  palette: { primary: string; accent: string; neutral: string[] },
  width: number,
  height: number
): string {
  const elements: string[] = [];

  switch (theme) {
    case 'minimal':
      elements.push(...buildMinimalDecorations(palette, style));
      break;
    case 'professional':
      elements.push(...buildProfessionalDecorations(palette, style));
      break;
    case 'creative':
      elements.push(...buildCreativeDecorations(palette, style));
      break;
    case 'tech':
      elements.push(...buildTechDecorations(palette, style));
      break;
    case 'elegant':
      elements.push(...buildElegantDecorations(palette, style));
      break;
    default:
      elements.push(...buildProfessionalDecorations(palette, style));
  }

  return elements.join('\n  ');
}

/**
 * Minimal theme decorations
 */
function buildMinimalDecorations(
  palette: { primary: string; accent: string; neutral: string[] },
  style: string
): string[] {
  const elements: string[] = [];

  // Left accent bar
  elements.push(createAccentBar({ width: 15, color: palette.primary, opacity: 1 }));

  if (style !== 'subtle') {
    // Top-right corner accent
    elements.push(createCornerAccent({ size: 150, color: palette.primary, opacity: 0.15 }));
  }

  return elements;
}

/**
 * Professional theme decorations - Enhanced with sophisticated elements
 */
function buildProfessionalDecorations(
  palette: { primary: string; accent: string; neutral: string[] },
  style: string
): string[] {
  const elements: string[] = [];

  // Left accent bar with subtle gradient effect
  elements.push(createAccentBar({ width: 12, color: palette.primary, opacity: 0.95 }));

  // Top-right corner accent - more subtle
  elements.push(createCornerAccent({ size: 180, color: palette.primary, opacity: 0.12 }));

  // Bottom-right decorative circles - refined positioning
  elements.push(createDecorativeCircles({ x: 1750, y: 920, color: palette.accent, count: 3 }));

  // Add subtle wave pattern at bottom for depth
  elements.push(
    createWavePattern({
      color: palette.primary,
      opacity: 0.03,
      amplitude: 30,
      frequency: 2,
      position: 'bottom',
    })
  );

  if (style === 'bold') {
    // Add curved accent line - more prominent
    elements.push(
      createCurvedAccent({
        startX: 0,
        startY: 1080 * 0.35,
        endX: 1920 * 0.35,
        endY: 0,
        color: palette.accent,
        thickness: 4,
        opacity: 0.25,
      })
    );

    // Add secondary curved accent for balance
    elements.push(
      createCurvedAccent({
        startX: 1920,
        startY: 1080 * 0.65,
        endX: 1920 * 0.65,
        endY: 1080,
        color: palette.primary,
        thickness: 3,
        opacity: 0.15,
      })
    );
  } else if (style === 'modern') {
    // Add subtle geometric accents
    elements.push(
      createAbstractShape({
        x: 1800,
        y: 150,
        size: 200,
        color: palette.accent,
        opacity: 0.06,
        rotation: 25,
      })
    );
  }

  return elements;
}

/**
 * Creative theme decorations - Enhanced with dynamic elements
 */
function buildCreativeDecorations(
  palette: { primary: string; accent: string; neutral: string[] },
  style: string
): string[] {
  const elements: string[] = [];

  // Multiple abstract shapes for visual interest
  elements.push(
    createAbstractShape({
      x: 1650,
      y: 180,
      size: 320,
      color: palette.primary,
      opacity: 0.09,
      rotation: 45,
    })
  );

  elements.push(
    createAbstractShape({
      x: 220,
      y: 880,
      size: 280,
      color: palette.accent,
      opacity: 0.07,
      rotation: -30,
    })
  );

  // Add a third shape for balance
  elements.push(
    createAbstractShape({
      x: 960,
      y: 540,
      size: 200,
      color: palette.primary,
      opacity: 0.04,
      rotation: 15,
    })
  );

  // Dynamic curved accents
  elements.push(
    createCurvedAccent({
      startX: 0,
      startY: 1080 * 0.45,
      endX: 1920 * 0.42,
      endY: 1080 * 0.18,
      color: palette.primary,
      thickness: 5,
      opacity: 0.18,
    })
  );

  elements.push(
    createCurvedAccent({
      startX: 1920,
      startY: 1080 * 0.55,
      endX: 1920 * 0.58,
      endY: 1080,
      color: palette.accent,
      thickness: 5,
      opacity: 0.18,
    })
  );

  // Add decorative circles for depth
  elements.push(createDecorativeCircles({ x: 1800, y: 100, color: palette.primary, count: 2 }));
  elements.push(createDecorativeCircles({ x: 120, y: 980, color: palette.accent, count: 2 }));

  if (style === 'bold') {
    // Add geometric pattern overlay
    elements.push(createGeometricPattern({ color: palette.primary, opacity: 0.04, density: 'low' }));

    // Add wave pattern for extra dynamism
    elements.push(
      createWavePattern({
        color: palette.accent,
        opacity: 0.05,
        amplitude: 40,
        frequency: 3,
        position: 'top',
      })
    );
  }

  return elements;
}

/**
 * Tech theme decorations
 */
function buildTechDecorations(
  palette: { primary: string; accent: string; neutral: string[] },
  style: string
): string[] {
  const elements: string[] = [];

  // Grid pattern
  elements.push(createGridPattern({ color: palette.primary, opacity: 0.03, spacing: 100 }));

  // Corner accents (all four corners)
  elements.push(createCornerAccent({ size: 150, color: palette.primary, opacity: 0.1, position: 'top-left' }));
  elements.push(createCornerAccent({ size: 150, color: palette.primary, opacity: 0.1, position: 'top-right' }));
  elements.push(createCornerAccent({ size: 150, color: palette.accent, opacity: 0.08, position: 'bottom-left' }));
  elements.push(createCornerAccent({ size: 150, color: palette.accent, opacity: 0.08, position: 'bottom-right' }));

  if (style !== 'subtle') {
    // Geometric pattern overlay
    elements.push(createGeometricPattern({ color: palette.accent, opacity: 0.02, density: 'medium' }));
  }

  return elements;
}

/**
 * Elegant theme decorations
 */
function buildElegantDecorations(
  palette: { primary: string; accent: string; neutral: string[] },
  style: string
): string[] {
  const elements: string[] = [];

  // Subtle curved accents
  elements.push(
    createCurvedAccent({
      startX: 0,
      startY: 1080 * 0.2,
      endX: 1920 * 0.5,
      endY: 0,
      color: palette.primary,
      thickness: 2,
      opacity: 0.1,
    })
  );

  elements.push(
    createCurvedAccent({
      startX: 1920,
      startY: 1080 * 0.8,
      endX: 1920 * 0.5,
      endY: 1080,
      color: palette.accent,
      thickness: 2,
      opacity: 0.1,
    })
  );

  // Decorative circles (smaller, more subtle)
  elements.push(createDecorativeCircles({ x: 1850, y: 100, color: palette.primary, count: 2 }));
  elements.push(createDecorativeCircles({ x: 100, y: 980, color: palette.accent, count: 2 }));

  if (style === 'bold') {
    // Abstract shapes
    elements.push(
      createAbstractShape({
        x: 1920 * 0.85,
        y: 1080 * 0.5,
        size: 400,
        color: palette.primary,
        opacity: 0.05,
        rotation: 30,
      })
    );
  }

  return elements;
}

/**
 * Generate background for specific slide type
 */
export function generateBackgroundForSlide(slideSpec: any): string {
  // Extract palette from slide spec (SlideSpecV1 uses styleTokens)
  const palette = {
    primary: slideSpec.styleTokens?.palette?.primary || '#6366F1',
    accent: slideSpec.styleTokens?.palette?.accent || '#10B981',
    neutral: slideSpec.styleTokens?.palette?.neutral || [
      '#1E293B',
      '#334155',
      '#475569',
      '#64748B',
      '#94A3B8',
      '#CBD5E1',
      '#E2E8F0',
      '#F1F5F9',
      '#F8FAFC',
    ],
  };

  // Determine theme based on slide content
  let theme: 'minimal' | 'professional' | 'creative' | 'tech' | 'elegant' = 'professional';
  let style: 'subtle' | 'bold' | 'modern' = 'subtle';

  // Analyze slide content to determine best theme
  const title = slideSpec.content?.title?.text?.toLowerCase() || '';
  const subtitle = slideSpec.content?.subtitle?.text?.toLowerCase() || '';

  if (title.includes('tech') || title.includes('digital') || title.includes('innovation')) {
    theme = 'tech';
  } else if (title.includes('creative') || title.includes('design') || title.includes('art')) {
    theme = 'creative';
    style = 'modern';
  } else if (title.includes('elegant') || title.includes('luxury') || title.includes('premium')) {
    theme = 'elegant';
  } else if (slideSpec.content?.bullets?.length > 5 || slideSpec.content?.dataViz) {
    theme = 'minimal'; // Keep it clean for data-heavy slides
  }

  return generateBackground({ palette, theme, style });
}

