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
    case "sidebar":
      return applySidebarPattern(spec);
    case "three-column":
      return applyThreeColumnPattern(spec);
    case "two-column-accent":
      return applyTwoColumnAccentPattern(spec);
    case "timeline":
      return applyTimelinePattern(spec);
    case "centered":
      return applyCenteredPattern(spec);
    case "full-bleed":
      return applyFullBleedPattern(spec);
    case "comparison":
      return applyComparisonPattern(spec);
    case "stacked":
      return applyStackedPattern(spec);
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

/**
 * Apply Sidebar Pattern
 * Content with prominent sidebar for navigation or key points
 */
export function applySidebarPattern(spec: SlideSpecV2): PatternRegions {
  return {
    header: {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: 1
    },
    sidebar: {
      x: MARGIN,
      y: 1.5 + MARGIN,
      w: 2,
      h: SLIDE_HEIGHT - 2.5
    },
    content: {
      x: 2.5 + MARGIN,
      y: 1.5 + MARGIN,
      w: SLIDE_WIDTH - 3.5 - 2 * MARGIN,
      h: SLIDE_HEIGHT - 2.5
    }
  };
}

/**
 * Apply Three Column Pattern
 * Equal three-column layout for comparison or features
 */
export function applyThreeColumnPattern(spec: SlideSpecV2): PatternRegions {
  const colWidth = (SLIDE_WIDTH - 2 * MARGIN - 0.4) / 3;

  return {
    header: {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: 1
    },
    item1: {
      x: MARGIN,
      y: 1.5 + MARGIN,
      w: colWidth,
      h: SLIDE_HEIGHT - 2.5
    },
    item2: {
      x: MARGIN + colWidth + 0.2,
      y: 1.5 + MARGIN,
      w: colWidth,
      h: SLIDE_HEIGHT - 2.5
    },
    item3: {
      x: MARGIN + (colWidth + 0.2) * 2,
      y: 1.5 + MARGIN,
      w: colWidth,
      h: SLIDE_HEIGHT - 2.5
    }
  };
}

/**
 * Apply Two Column Pattern with Accent
 * Two columns with accent bar on the side
 */
export function applyTwoColumnAccentPattern(spec: SlideSpecV2): PatternRegions {
  return {
    header: {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: 1
    },
    left: {
      x: MARGIN,
      y: 1.5 + MARGIN,
      w: (SLIDE_WIDTH - 2 * MARGIN - 0.3) / 2,
      h: SLIDE_HEIGHT - 2.5
    },
    right: {
      x: MARGIN + (SLIDE_WIDTH - 2 * MARGIN - 0.3) / 2 + 0.3,
      y: 1.5 + MARGIN,
      w: (SLIDE_WIDTH - 2 * MARGIN - 0.3) / 2,
      h: SLIDE_HEIGHT - 2.5
    }
  };
}

/**
 * Apply Timeline Pattern
 * Horizontal timeline layout for processes or history
 */
export function applyTimelinePattern(spec: SlideSpecV2): PatternRegions {
  return {
    header: {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: 1
    },
    item1: {
      x: MARGIN,
      y: 2,
      w: (SLIDE_WIDTH - 2 * MARGIN) / 4,
      h: SLIDE_HEIGHT - 2.5
    },
    item2: {
      x: MARGIN + (SLIDE_WIDTH - 2 * MARGIN) / 4,
      y: 2,
      w: (SLIDE_WIDTH - 2 * MARGIN) / 4,
      h: SLIDE_HEIGHT - 2.5
    },
    item3: {
      x: MARGIN + (SLIDE_WIDTH - 2 * MARGIN) / 2,
      y: 2,
      w: (SLIDE_WIDTH - 2 * MARGIN) / 4,
      h: SLIDE_HEIGHT - 2.5
    },
    item4: {
      x: MARGIN + (SLIDE_WIDTH - 2 * MARGIN) * 0.75,
      y: 2,
      w: (SLIDE_WIDTH - 2 * MARGIN) / 4,
      h: SLIDE_HEIGHT - 2.5
    }
  };
}

/**
 * Apply Centered Pattern
 * Centered content with maximum focus
 */
export function applyCenteredPattern(spec: SlideSpecV2): PatternRegions {
  const contentWidth = SLIDE_WIDTH * 0.6;
  const contentX = (SLIDE_WIDTH - contentWidth) / 2;

  return {
    header: {
      x: contentX,
      y: MARGIN,
      w: contentWidth,
      h: 1.5
    },
    content: {
      x: contentX,
      y: 2,
      w: contentWidth,
      h: SLIDE_HEIGHT - 2.5
    }
  };
}

/**
 * Apply Full Bleed Pattern
 * Content extends to edges for maximum impact
 */
export function applyFullBleedPattern(spec: SlideSpecV2): PatternRegions {
  return {
    content: {
      x: 0,
      y: 0,
      w: SLIDE_WIDTH,
      h: SLIDE_HEIGHT
    }
  };
}

/**
 * Apply Comparison Pattern
 * Side-by-side comparison with divider
 */
export function applyComparisonPattern(spec: SlideSpecV2): PatternRegions {
  const midpoint = SLIDE_WIDTH / 2;

  return {
    header: {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: 1
    },
    left: {
      x: MARGIN,
      y: 1.5 + MARGIN,
      w: midpoint - MARGIN - 0.15,
      h: SLIDE_HEIGHT - 2.5
    },
    right: {
      x: midpoint + 0.15,
      y: 1.5 + MARGIN,
      w: midpoint - MARGIN - 0.15,
      h: SLIDE_HEIGHT - 2.5
    }
  };
}

/**
 * Apply Stacked Pattern
 * Vertical stacking of content sections
 */
export function applyStackedPattern(spec: SlideSpecV2): PatternRegions {
  const sectionHeight = (SLIDE_HEIGHT - 2 * MARGIN - 1) / 3;

  return {
    header: {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: 1
    },
    item1: {
      x: MARGIN,
      y: 1 + MARGIN,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: sectionHeight
    },
    item2: {
      x: MARGIN,
      y: 1 + MARGIN + sectionHeight,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: sectionHeight
    },
    item3: {
      x: MARGIN,
      y: 1 + MARGIN + sectionHeight * 2,
      w: SLIDE_WIDTH - 2 * MARGIN,
      h: sectionHeight
    }
  };
}

/**
 * Get all available patterns
 */
export function getAllPatterns(): string[] {
  return [
    "hero",
    "split",
    "asymmetric",
    "grid",
    "minimal",
    "data-focused",
    "sidebar",
    "three-column",
    "two-column-accent",
    "timeline",
    "centered",
    "full-bleed",
    "comparison",
    "stacked"
  ];
}

/**
 * Get pattern description
 */
export function getPatternDescription(pattern: string): string {
  const descriptions: Record<string, string> = {
    hero: "Large hero section with supporting content below",
    split: "50/50 left-right content division",
    asymmetric: "Dynamic off-center layout with visual balance",
    grid: "4-item grid layout for equal content",
    minimal: "Minimal layout with maximum whitespace",
    "data-focused": "Optimized for charts and data visualization",
    sidebar: "Content with prominent sidebar",
    "three-column": "Three equal columns for comparison",
    "two-column-accent": "Two columns with accent divider",
    timeline: "Horizontal timeline for processes",
    centered: "Centered content with maximum focus",
    "full-bleed": "Content extends to edges",
    comparison: "Side-by-side comparison layout",
    stacked: "Vertically stacked content sections"
  };

  return descriptions[pattern] || "Unknown pattern";
}

