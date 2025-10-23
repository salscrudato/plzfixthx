/**
 * SVG Generator Module
 * Professional SVG backgrounds and decorative elements for slides
 */

export { generateBackground, generateBackgroundForSlide, type BackgroundConfig } from './backgroundGenerator';
export { createGradientDef, getGradient, createGradientFromPalette, createRadialGradientFromPalette, gradientThemes, type GradientConfig } from './gradients';
export {
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
  createCalloutBox,
  createWavePattern,
} from './decorativeElements';
export { svgToPngDataUrl, svgToPngBuffer, optimizePng } from './converter';

