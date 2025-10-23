/**
 * Design Pattern Builders
 * Builds slide layouts based on design patterns
 */

import type { SlideSpecV2 } from "../types/SlideSpecV2";

export interface PatternRegions {
  header?: RegionRect;
  body?: RegionRect;
  footer?: RegionRect;
  aside?: RegionRect;
  left?: RegionRect;
  right?: RegionRect;
  primary?: RegionRect;
  secondary?: RegionRect;
  chart?: RegionRect;
  sidebar?: RegionRect;
  content?: RegionRect;
  item1?: RegionRect;
  item2?: RegionRect;
  item3?: RegionRect;
  item4?: RegionRect;
}

export interface RegionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 7.5;
const MARGIN = 0.5;

/**
 * Apply Hero Pattern
 * Large title/image focus with supporting content
 */
export function applyHeroPattern(spec: SlideSpecV2): PatternRegions {
  return {
    header: {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: SLIDE_HEIGHT * 0.6 - MARGIN
    },
    body: {
      x: MARGIN,
      y: SLIDE_HEIGHT * 0.6 + MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: SLIDE_HEIGHT * 0.4 - 2 * MARGIN
    }
  };
}

/**
 * Apply Split Pattern
 * 50/50 left/right content division
 */
export function applySplitPattern(spec: SlideSpecV2): PatternRegions {
  const midpoint = SLIDE_WIDTH / 2;

  return {
    header: {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: 1.5
    },
    left: {
      x: MARGIN,
      y: 2,
      w: midpoint - MARGIN - 0.25,
      h: SLIDE_HEIGHT - 2.5
    },
    right: {
      x: midpoint + 0.25,
      y: 2,
      w: midpoint - MARGIN - 0.25,
      h: SLIDE_HEIGHT - 2.5
    }
  };
}

/**
 * Apply Asymmetric Pattern
 * Dynamic off-center layout with visual balance
 */
export function applyAsymmetricPattern(spec: SlideSpecV2): PatternRegions {
  return {
    header: {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: 1.2
    },
    primary: {
      x: MARGIN,
      y: 1.8,
      w: SLIDE_WIDTH * 0.65 - MARGIN,
      h: SLIDE_HEIGHT - 2.3
    },
    secondary: {
      x: SLIDE_WIDTH * 0.65 + 0.25,
      y: 1.8,
      w: SLIDE_WIDTH * 0.35 - MARGIN - 0.25,
      h: SLIDE_HEIGHT - 2.3
    }
  };
}

/**
 * Apply Grid Pattern
 * Structured multi-element layout (2x2 grid)
 */
export function applyGridPattern(spec: SlideSpecV2): PatternRegions {
  const itemWidth = (SLIDE_WIDTH - 2 * MARGIN - 0.25) / 2;
  const itemHeight = (SLIDE_HEIGHT - 2.3) / 2;

  return {
    header: {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: 1.2
    },
    item1: {
      x: MARGIN,
      y: 1.8,
      w: itemWidth,
      h: itemHeight
    },
    item2: {
      x: SLIDE_WIDTH / 2 + 0.25,
      y: 1.8,
      w: itemWidth,
      h: itemHeight
    },
    item3: {
      x: MARGIN,
      y: SLIDE_HEIGHT / 2 + 0.8,
      w: itemWidth,
      h: itemHeight
    },
    item4: {
      x: SLIDE_WIDTH / 2 + 0.25,
      y: SLIDE_HEIGHT / 2 + 0.8,
      w: itemWidth,
      h: itemHeight
    }
  };
}

/**
 * Apply Minimal Pattern
 * Single focal point with generous white space
 */
export function applyMinimalPattern(spec: SlideSpecV2): PatternRegions {
  return {
    content: {
      x: SLIDE_WIDTH * 0.2,
      y: SLIDE_HEIGHT * 0.25,
      w: SLIDE_WIDTH * 0.6,
      h: SLIDE_HEIGHT * 0.5
    }
  };
}

/**
 * Apply Data-Focused Pattern
 * Chart/data as primary focus with supporting text
 */
export function applyDataFocusedPattern(spec: SlideSpecV2): PatternRegions {
  return {
    header: {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: 0.8
    },
    chart: {
      x: MARGIN,
      y: 1.2,
      w: SLIDE_WIDTH * 0.65 - MARGIN,
      h: SLIDE_HEIGHT - 1.7
    },
    sidebar: {
      x: SLIDE_WIDTH * 0.65 + 0.25,
      y: 1.2,
      w: SLIDE_WIDTH * 0.35 - MARGIN - 0.25,
      h: SLIDE_HEIGHT - 1.7
    }
  };
}

/**
 * Get regions for pattern
 */
export function getRegionsForPattern(pattern: string, spec: SlideSpecV2): PatternRegions {
  switch (pattern) {
    case "hero":
      return applyHeroPattern(spec);
    case "split":
      return applySplitPattern(spec);
    case "asymmetric":
      return applyAsymmetricPattern(spec);
    case "grid":
      return applyGridPattern(spec);
    case "minimal":
      return applyMinimalPattern(spec);
    case "data-focused":
      return applyDataFocusedPattern(spec);
    default:
      return applySplitPattern(spec);
  }
}

/**
 * Validate pattern regions
 */
export function validatePatternRegions(regions: PatternRegions): boolean {
  for (const region of Object.values(regions)) {
    if (!region) continue;

    if (
      region.x < 0 ||
      region.y < 0 ||
      region.w <= 0 ||
      region.h <= 0 ||
      region.x + region.w > SLIDE_WIDTH ||
      region.y + region.h > SLIDE_HEIGHT
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Get region by name
 */
export function getRegion(regions: PatternRegions, name: string): RegionRect | undefined {
  return regions[name as keyof PatternRegions];
}

/**
 * Calculate total used area
 */
export function calculateUsedArea(regions: PatternRegions): number {
  let total = 0;

  for (const region of Object.values(regions)) {
    if (region) {
      total += region.w * region.h;
    }
  }

  return total;
}

/**
 * Calculate white space percentage
 */
export function calculateWhitespacePercentage(regions: PatternRegions): number {
  const totalArea = SLIDE_WIDTH * SLIDE_HEIGHT;
  const usedArea = calculateUsedArea(regions);
  const whiteSpace = totalArea - usedArea;

  return (whiteSpace / totalArea) * 100;
}

