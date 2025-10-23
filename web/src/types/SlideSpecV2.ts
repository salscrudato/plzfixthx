import type { SlideSpecV1 } from "./SlideSpecV1";

export type DesignPattern = "hero" | "split" | "asymmetric" | "grid" | "minimal" | "data-focused";
export type WhitespaceStrategy = "generous" | "balanced" | "compact";
export type TypographyStrategy = "classic" | "modern" | "bold" | "minimal" | "elegant";
export type ColorDistribution = "monochromatic" | "complementary" | "analogous" | "triadic";
export type ContrastLevel = "high" | "medium" | "low";
export type AnimationType = "fade" | "slide" | "zoom" | "wipe" | "pulse" | "glow" | "scale";

export interface VisualHierarchy {
  primaryFocus: string; // element ID with highest emphasis
  secondaryFocus: string[]; // supporting element IDs
  emphasisLevels: Record<string, 1 | 2 | 3 | 4 | 5>; // 1=minimal, 5=maximum
}

export interface WhitespaceConfig {
  strategy: WhitespaceStrategy;
  breathingRoom: number; // 20-50 percentage
}

export interface TypographyConfig {
  strategy: TypographyStrategy;
  fontPairing: {
    primary: string; // heading font
    secondary: string; // body font
  };
  hierarchy: Record<string, {
    size: number;
    weight: 400 | 500 | 600 | 700;
    lineHeight: number;
  }>;
}

export interface ColorStrategyConfig {
  distribution: ColorDistribution;
  emphasis: string; // accent color usage
  contrast: ContrastLevel;
}

export interface AnimationConfig {
  type: AnimationType;
  duration: number; // milliseconds
  delay?: number;
}

export interface DesignConfig {
  pattern: DesignPattern;
  
  visualHierarchy: VisualHierarchy;
  
  whitespace: WhitespaceConfig;
  
  typography: TypographyConfig;
  
  colorStrategy: ColorStrategyConfig;
  
  animations?: {
    entrance?: AnimationConfig[];
    emphasis?: AnimationConfig[];
  };
}

export interface SlideSpecV2 extends SlideSpecV1 {
  design: DesignConfig;
}

