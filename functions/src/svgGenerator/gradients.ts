/**
 * SVG Gradient Definitions
 * Professional gradient patterns for slide backgrounds
 */

export interface GradientConfig {
  id: string;
  type: 'linear' | 'radial';
  colors: Array<{ offset: string; color: string; opacity?: number }>;
  angle?: number; // For linear gradients (0-360)
  cx?: string; // For radial gradients
  cy?: string; // For radial gradients
  r?: string; // For radial gradients
}

/**
 * Generate SVG gradient definition
 */
export function createGradientDef(config: GradientConfig): string {
  if (config.type === 'linear') {
    return createLinearGradient(config);
  } else {
    return createRadialGradient(config);
  }
}

function createLinearGradient(config: GradientConfig): string {
  const angle = config.angle || 135;
  const radians = (angle - 90) * (Math.PI / 180);
  const x1 = Math.round(50 + 50 * Math.cos(radians));
  const y1 = Math.round(50 + 50 * Math.sin(radians));
  const x2 = Math.round(50 - 50 * Math.cos(radians));
  const y2 = Math.round(50 - 50 * Math.sin(radians));

  const stops = config.colors
    .map(
      (stop) =>
        `<stop offset="${stop.offset}" style="stop-color:${stop.color};stop-opacity:${stop.opacity || 1}" />`
    )
    .join('\n      ');

  return `
    <linearGradient id="${config.id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      ${stops}
    </linearGradient>`;
}

function createRadialGradient(config: GradientConfig): string {
  const cx = config.cx || '50%';
  const cy = config.cy || '50%';
  const r = config.r || '50%';

  const stops = config.colors
    .map(
      (stop) =>
        `<stop offset="${stop.offset}" style="stop-color:${stop.color};stop-opacity:${stop.opacity || 1}" />`
    )
    .join('\n      ');

  return `
    <radialGradient id="${config.id}" cx="${cx}" cy="${cy}" r="${r}">
      ${stops}
    </radialGradient>`;
}

/**
 * Predefined professional gradient themes
 */
export const gradientThemes = {
  // Subtle, professional gradients
  subtle: {
    id: 'subtle-gradient',
    type: 'linear' as const,
    angle: 135,
    colors: [
      { offset: '0%', color: '#F8FAFC' },
      { offset: '50%', color: '#F1F5F9' },
      { offset: '100%', color: '#F8FAFC' },
    ],
  },

  // Modern tech gradient
  tech: {
    id: 'tech-gradient',
    type: 'linear' as const,
    angle: 135,
    colors: [
      { offset: '0%', color: '#EEF2FF' },
      { offset: '50%', color: '#E0E7FF' },
      { offset: '100%', color: '#EEF2FF' },
    ],
  },

  // Warm, inviting gradient
  warm: {
    id: 'warm-gradient',
    type: 'linear' as const,
    angle: 135,
    colors: [
      { offset: '0%', color: '#FEF3C7' },
      { offset: '50%', color: '#FDE68A' },
      { offset: '100%', color: '#FEF3C7' },
    ],
  },

  // Cool, calm gradient
  cool: {
    id: 'cool-gradient',
    type: 'linear' as const,
    angle: 135,
    colors: [
      { offset: '0%', color: '#ECFEFF' },
      { offset: '50%', color: '#CFFAFE' },
      { offset: '100%', color: '#ECFEFF' },
    ],
  },

  // Professional blue
  professional: {
    id: 'professional-gradient',
    type: 'linear' as const,
    angle: 135,
    colors: [
      { offset: '0%', color: '#DBEAFE' },
      { offset: '50%', color: '#BFDBFE' },
      { offset: '100%', color: '#DBEAFE' },
    ],
  },

  // Elegant purple
  elegant: {
    id: 'elegant-gradient',
    type: 'linear' as const,
    angle: 135,
    colors: [
      { offset: '0%', color: '#F3E8FF' },
      { offset: '50%', color: '#E9D5FF' },
      { offset: '100%', color: '#F3E8FF' },
    ],
  },

  // Success green
  success: {
    id: 'success-gradient',
    type: 'linear' as const,
    angle: 135,
    colors: [
      { offset: '0%', color: '#D1FAE5' },
      { offset: '50%', color: '#A7F3D0' },
      { offset: '100%', color: '#D1FAE5' },
    ],
  },

  // Radial spotlight
  spotlight: {
    id: 'spotlight-gradient',
    type: 'radial' as const,
    cx: '30%',
    cy: '30%',
    r: '70%',
    colors: [
      { offset: '0%', color: '#FFFFFF' },
      { offset: '50%', color: '#F8FAFC' },
      { offset: '100%', color: '#F1F5F9' },
    ],
  },
};

/**
 * Get gradient theme by name or create custom
 */
export function getGradient(
  themeName?: keyof typeof gradientThemes,
  customColors?: string[]
): GradientConfig {
  if (themeName && gradientThemes[themeName]) {
    return gradientThemes[themeName];
  }

  // Create custom gradient from colors
  if (customColors && customColors.length >= 2) {
    const stops = customColors.map((color, index) => ({
      offset: `${(index / (customColors.length - 1)) * 100}%`,
      color,
    }));

    return {
      id: 'custom-gradient',
      type: 'linear',
      angle: 135,
      colors: stops,
    };
  }

  // Default to subtle
  return gradientThemes.subtle;
}

/**
 * Create gradient from color palette with enhanced sophistication
 */
export function createGradientFromPalette(palette: {
  primary: string;
  accent: string;
  neutral: string[];
}): GradientConfig {
  // Use neutral colors for subtle background with primary/accent hints
  const lightest = palette.neutral[palette.neutral.length - 1] || '#F8FAFC';
  const lighter = palette.neutral[palette.neutral.length - 2] || '#F1F5F9';
  const mid = palette.neutral[palette.neutral.length - 3] || '#E2E8F0';

  // Add very subtle primary color tint for sophistication
  return {
    id: 'palette-gradient',
    type: 'linear',
    angle: 135,
    colors: [
      { offset: '0%', color: lightest },
      { offset: '25%', color: lighter },
      { offset: '50%', color: mid, opacity: 0.03 },
      { offset: '75%', color: lighter },
      { offset: '100%', color: lightest },
    ],
  };
}

/**
 * Create radial gradient for spotlight effect
 */
export function createRadialGradientFromPalette(palette: {
  primary: string;
  accent: string;
  neutral: string[];
}): GradientConfig {
  const lightest = palette.neutral[palette.neutral.length - 1] || '#F8FAFC';
  const lighter = palette.neutral[palette.neutral.length - 2] || '#F1F5F9';

  return {
    id: 'radial-palette-gradient',
    type: 'radial',
    cx: '30%',
    cy: '30%',
    r: '80%',
    colors: [
      { offset: '0%', color: '#FFFFFF', opacity: 0.8 },
      { offset: '40%', color: lightest },
      { offset: '100%', color: lighter },
    ],
  };
}

