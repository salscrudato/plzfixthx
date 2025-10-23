/**
 * Professional Layout Composition Patterns
 * 6 predefined patterns for professional slide layouts
 */

export type LayoutPatternName = "hero" | "split" | "asymmetric" | "grid" | "minimal" | "data-focused";

export interface RegionLayout {
  x: number; // left position (inches)
  y: number; // top position (inches)
  w: number; // width (inches)
  h: number; // height (inches)
}

export interface LayoutPattern {
  name: string;
  description: string;
  pattern: LayoutPatternName;
  regions: Record<string, RegionLayout>;
  whitespacePercentage: number;
  bestFor: string[];
}

// Standard slide dimensions: 10" x 7.5" (16:9)
const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 7.5;
const MARGIN = 0.5;

export const LAYOUT_PATTERNS: Record<LayoutPatternName, LayoutPattern> = {
  hero: {
    name: "Hero Pattern",
    description: "Large title/image focus with supporting content",
    pattern: "hero",
    regions: {
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
    },
    whitespacePercentage: 25,
    bestFor: ["Cover slides", "Announcements", "Key messages", "Hero images"]
  },
  split: {
    name: "Split Pattern",
    description: "50/50 left/right content division",
    pattern: "split",
    regions: {
      header: {
        x: MARGIN,
        y: MARGIN,
        w: SLIDE_WIDTH - 2 * MARGIN,
        h: 1.5
      },
      left: {
        x: MARGIN,
        y: 2,
        w: SLIDE_WIDTH / 2 - MARGIN - 0.25,
        h: SLIDE_HEIGHT - 2.5
      },
      right: {
        x: SLIDE_WIDTH / 2 + 0.25,
        y: 2,
        w: SLIDE_WIDTH / 2 - MARGIN - 0.25,
        h: SLIDE_HEIGHT - 2.5
      }
    },
    whitespacePercentage: 20,
    bestFor: ["Comparisons", "Before/after", "Two-column content", "Pros/cons"]
  },
  asymmetric: {
    name: "Asymmetric Pattern",
    description: "Dynamic off-center layout with visual balance",
    pattern: "asymmetric",
    regions: {
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
    },
    whitespacePercentage: 22,
    bestFor: ["Dynamic layouts", "Creative presentations", "Feature highlights"]
  },
  grid: {
    name: "Grid Pattern",
    description: "Structured multi-element layout",
    pattern: "grid",
    regions: {
      header: {
        x: MARGIN,
        y: MARGIN,
        w: SLIDE_WIDTH - 2 * MARGIN,
        h: 1.2
      },
      item1: {
        x: MARGIN,
        y: 1.8,
        w: (SLIDE_WIDTH - 2 * MARGIN - 0.25) / 2,
        h: (SLIDE_HEIGHT - 2.3) / 2
      },
      item2: {
        x: SLIDE_WIDTH / 2 + 0.25,
        y: 1.8,
        w: (SLIDE_WIDTH - 2 * MARGIN - 0.25) / 2,
        h: (SLIDE_HEIGHT - 2.3) / 2
      },
      item3: {
        x: MARGIN,
        y: SLIDE_HEIGHT / 2 + 0.8,
        w: (SLIDE_WIDTH - 2 * MARGIN - 0.25) / 2,
        h: (SLIDE_HEIGHT - 2.3) / 2
      },
      item4: {
        x: SLIDE_WIDTH / 2 + 0.25,
        y: SLIDE_HEIGHT / 2 + 0.8,
        w: (SLIDE_WIDTH - 2 * MARGIN - 0.25) / 2,
        h: (SLIDE_HEIGHT - 2.3) / 2
      }
    },
    whitespacePercentage: 18,
    bestFor: ["Multiple items", "Portfolio", "Process steps", "Features"]
  },
  minimal: {
    name: "Minimal Pattern",
    description: "Single focal point with generous white space",
    pattern: "minimal",
    regions: {
      content: {
        x: SLIDE_WIDTH * 0.2,
        y: SLIDE_HEIGHT * 0.25,
        w: SLIDE_WIDTH * 0.6,
        h: SLIDE_HEIGHT * 0.5
      }
    },
    whitespacePercentage: 45,
    bestFor: ["Key messages", "Quotes", "Emphasis", "Minimal design"]
  },
  "data-focused": {
    name: "Data-Focused Pattern",
    description: "Chart/data as primary focus with supporting text",
    pattern: "data-focused",
    regions: {
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
    },
    whitespacePercentage: 18,
    bestFor: ["Analytics", "Metrics", "Data visualization", "Charts"]
  }
};

export function getLayoutPattern(pattern: LayoutPatternName): LayoutPattern | undefined {
  return LAYOUT_PATTERNS[pattern];
}

export function getAllLayoutPatterns(): LayoutPattern[] {
  return Object.values(LAYOUT_PATTERNS);
}

export function getLayoutPatternNames(): LayoutPatternName[] {
  return Object.keys(LAYOUT_PATTERNS) as LayoutPatternName[];
}

/**
 * Get layout pattern by use case
 */
export function getLayoutByUseCase(useCase: string): LayoutPattern | undefined {
  const lower = useCase.toLowerCase();
  
  if (lower.includes("data") || lower.includes("chart") || lower.includes("metric")) {
    return LAYOUT_PATTERNS["data-focused"];
  }
  if (lower.includes("minimal") || lower.includes("quote") || lower.includes("message")) {
    return LAYOUT_PATTERNS.minimal;
  }
  if (lower.includes("compare") || lower.includes("before") || lower.includes("after")) {
    return LAYOUT_PATTERNS.split;
  }
  if (lower.includes("dynamic") || lower.includes("creative") || lower.includes("feature")) {
    return LAYOUT_PATTERNS.asymmetric;
  }
  if (lower.includes("multiple") || lower.includes("portfolio") || lower.includes("process")) {
    return LAYOUT_PATTERNS.grid;
  }
  if (lower.includes("cover") || lower.includes("announcement") || lower.includes("hero")) {
    return LAYOUT_PATTERNS.hero;
  }
  
  return LAYOUT_PATTERNS.split; // default
}

/**
 * Validate layout pattern
 */
export function validateLayoutPattern(pattern: LayoutPattern): boolean {
  const regions = Object.values(pattern.regions);
  
  return regions.every(region => 
    region.x >= 0 &&
    region.y >= 0 &&
    region.w > 0 &&
    region.h > 0 &&
    region.x + region.w <= SLIDE_WIDTH &&
    region.y + region.h <= SLIDE_HEIGHT
  );
}

/**
 * Get region by name from pattern
 */
export function getRegion(pattern: LayoutPattern, regionName: string): RegionLayout | undefined {
  return pattern.regions[regionName];
}

/**
 * Calculate total white space percentage
 */
export function calculateWhitespacePercentage(pattern: LayoutPattern): number {
  const totalArea = SLIDE_WIDTH * SLIDE_HEIGHT;
  const usedArea = Object.values(pattern.regions).reduce((sum, region) => 
    sum + (region.w * region.h), 0
  );
  const whiteSpace = totalArea - usedArea;
  return (whiteSpace / totalArea) * 100;
}

