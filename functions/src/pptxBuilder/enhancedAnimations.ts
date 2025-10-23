/**
 * Enhanced Animations for Professional PowerPoint Slides
 * Sophisticated entrance, emphasis, and exit animations
 * Inspired by Apple Keynote and Google Slides
 */

import PptxGenJS from "pptxgenjs";

export type AnimationType = 
  | "fade-in" | "fade-out"
  | "slide-in-left" | "slide-in-right" | "slide-in-top" | "slide-in-bottom"
  | "slide-out-left" | "slide-out-right" | "slide-out-top" | "slide-out-bottom"
  | "zoom-in" | "zoom-out"
  | "scale-up" | "scale-down"
  | "rotate-in" | "rotate-out"
  | "bounce-in" | "bounce-out"
  | "flip-in" | "flip-out"
  | "pulse" | "glow" | "shake" | "swing"
  | "grow" | "shrink"
  | "color-flash" | "bold-flash"
  | "spin-clockwise" | "spin-counter-clockwise";

export interface AnimationConfig {
  type: AnimationType;
  duration: number; // milliseconds
  delay: number; // milliseconds
  easing?: "ease-in" | "ease-out" | "ease-in-out" | "linear";
  repeat?: number; // number of times to repeat
  direction?: "left" | "right" | "top" | "bottom" | "center";
}

export interface StaggerConfig {
  enabled: boolean;
  delay: number; // milliseconds between each element
  direction?: "forward" | "backward" | "random";
}

/**
 * Create an animation configuration with sensible defaults
 */
export function createAnimation(
  type: AnimationType,
  duration: number = 500,
  delay: number = 0,
  easing: "ease-in" | "ease-out" | "ease-in-out" | "linear" = "ease-out"
): AnimationConfig {
  return {
    type,
    duration,
    delay,
    easing
  };
}

/**
 * Get recommended animation for content type
 */
export function getRecommendedAnimation(contentType: "title" | "subtitle" | "bullet" | "chart" | "image"): AnimationConfig {
  const animations: Record<string, AnimationConfig> = {
    title: createAnimation("fade-in", 600, 0),
    subtitle: createAnimation("fade-in", 500, 200),
    bullet: createAnimation("slide-in-left", 400, 300),
    chart: createAnimation("zoom-in", 700, 400),
    image: createAnimation("fade-in", 500, 300)
  };

  return animations[contentType] || createAnimation("fade-in", 500, 0);
}

/**
 * Get animation duration based on complexity
 */
export function getAnimationDuration(complexity: "simple" | "moderate" | "complex"): number {
  const durations: Record<string, number> = {
    simple: 300,
    moderate: 500,
    complex: 800
  };

  return durations[complexity] || 500;
}

/**
 * Create a stagger configuration for sequential animations
 */
export function createStaggerConfig(
  enabled: boolean = true,
  delay: number = 100,
  direction: "forward" | "backward" | "random" = "forward"
): StaggerConfig {
  return {
    enabled,
    delay,
    direction
  };
}

/**
 * Get easing function curve
 */
export function getEasingCurve(easing: string): string {
  const curves: Record<string, string> = {
    "ease-in": "cubic-bezier(0.42, 0, 1, 1)",
    "ease-out": "cubic-bezier(0, 0, 0.58, 1)",
    "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1)",
    "linear": "linear"
  };

  return curves[easing] || curves["ease-out"];
}

/**
 * Calculate animation timing for a sequence
 */
export function calculateSequenceTiming(
  elementCount: number,
  baseDelay: number = 0,
  staggerDelay: number = 100,
  direction: "forward" | "backward" | "random" = "forward"
): number[] {
  const timings: number[] = [];

  if (direction === "forward") {
    for (let i = 0; i < elementCount; i++) {
      timings.push(baseDelay + i * staggerDelay);
    }
  } else if (direction === "backward") {
    for (let i = elementCount - 1; i >= 0; i--) {
      timings.push(baseDelay + (elementCount - 1 - i) * staggerDelay);
    }
  } else {
    // Random
    for (let i = 0; i < elementCount; i++) {
      timings.push(baseDelay + Math.random() * (elementCount * staggerDelay));
    }
  }

  return timings;
}

/**
 * Get animation preset for common scenarios
 */
export function getAnimationPreset(preset: "entrance" | "emphasis" | "exit" | "transition"): AnimationConfig[] {
  const presets: Record<string, AnimationConfig[]> = {
    entrance: [
      createAnimation("fade-in", 400, 0),
      createAnimation("slide-in-left", 500, 100),
      createAnimation("slide-in-left", 500, 200),
      createAnimation("slide-in-left", 500, 300)
    ],
    emphasis: [
      createAnimation("pulse", 600, 0),
      createAnimation("glow", 800, 0),
      createAnimation("scale-up", 400, 0)
    ],
    exit: [
      createAnimation("fade-out", 400, 0),
      createAnimation("slide-out-right", 500, 100),
      createAnimation("zoom-out", 500, 200)
    ],
    transition: [
      createAnimation("fade-in", 500, 0),
      createAnimation("slide-in-right", 600, 0),
      createAnimation("zoom-in", 700, 0)
    ]
  };

  return presets[preset] || presets.entrance;
}

/**
 * Validate animation configuration
 */
export function validateAnimationConfig(config: AnimationConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.type) {
    errors.push("Animation type is required");
  }

  if (config.duration < 0) {
    errors.push("Duration must be non-negative");
  }

  if (config.delay < 0) {
    errors.push("Delay must be non-negative");
  }

  if (config.repeat && config.repeat < 1) {
    errors.push("Repeat count must be at least 1");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get animation metadata for documentation
 */
export function getAnimationMetadata(type: AnimationType): {
  name: string;
  category: "entrance" | "emphasis" | "exit";
  duration: number;
  description: string;
} {
  const metadata: Record<AnimationType, any> = {
    "fade-in": {
      name: "Fade In",
      category: "entrance",
      duration: 500,
      description: "Element fades in from transparent to opaque"
    },
    "fade-out": {
      name: "Fade Out",
      category: "exit",
      duration: 500,
      description: "Element fades out from opaque to transparent"
    },
    "slide-in-left": {
      name: "Slide In Left",
      category: "entrance",
      duration: 500,
      description: "Element slides in from the left"
    },
    "slide-in-right": {
      name: "Slide In Right",
      category: "entrance",
      duration: 500,
      description: "Element slides in from the right"
    },
    "slide-in-top": {
      name: "Slide In Top",
      category: "entrance",
      duration: 500,
      description: "Element slides in from the top"
    },
    "slide-in-bottom": {
      name: "Slide In Bottom",
      category: "entrance",
      duration: 500,
      description: "Element slides in from the bottom"
    },
    "slide-out-left": {
      name: "Slide Out Left",
      category: "exit",
      duration: 500,
      description: "Element slides out to the left"
    },
    "slide-out-right": {
      name: "Slide Out Right",
      category: "exit",
      duration: 500,
      description: "Element slides out to the right"
    },
    "slide-out-top": {
      name: "Slide Out Top",
      category: "exit",
      duration: 500,
      description: "Element slides out to the top"
    },
    "slide-out-bottom": {
      name: "Slide Out Bottom",
      category: "exit",
      duration: 500,
      description: "Element slides out to the bottom"
    },
    "zoom-in": {
      name: "Zoom In",
      category: "entrance",
      duration: 600,
      description: "Element zooms in from small to full size"
    },
    "zoom-out": {
      name: "Zoom Out",
      category: "exit",
      duration: 600,
      description: "Element zooms out from full size to small"
    },
    "scale-up": {
      name: "Scale Up",
      category: "emphasis",
      duration: 400,
      description: "Element scales up slightly for emphasis"
    },
    "scale-down": {
      name: "Scale Down",
      category: "emphasis",
      duration: 400,
      description: "Element scales down slightly"
    },
    "rotate-in": {
      name: "Rotate In",
      category: "entrance",
      duration: 600,
      description: "Element rotates in"
    },
    "rotate-out": {
      name: "Rotate Out",
      category: "exit",
      duration: 600,
      description: "Element rotates out"
    },
    "bounce-in": {
      name: "Bounce In",
      category: "entrance",
      duration: 700,
      description: "Element bounces in with elastic effect"
    },
    "bounce-out": {
      name: "Bounce Out",
      category: "exit",
      duration: 700,
      description: "Element bounces out with elastic effect"
    },
    "flip-in": {
      name: "Flip In",
      category: "entrance",
      duration: 600,
      description: "Element flips in"
    },
    "flip-out": {
      name: "Flip Out",
      category: "exit",
      duration: 600,
      description: "Element flips out"
    },
    "pulse": {
      name: "Pulse",
      category: "emphasis",
      duration: 600,
      description: "Element pulses with scale effect"
    },
    "glow": {
      name: "Glow",
      category: "emphasis",
      duration: 800,
      description: "Element glows with shadow effect"
    },
    "shake": {
      name: "Shake",
      category: "emphasis",
      duration: 500,
      description: "Element shakes side to side"
    },
    "swing": {
      name: "Swing",
      category: "emphasis",
      duration: 600,
      description: "Element swings back and forth"
    },
    "grow": {
      name: "Grow",
      category: "emphasis",
      duration: 500,
      description: "Element grows in size"
    },
    "shrink": {
      name: "Shrink",
      category: "emphasis",
      duration: 500,
      description: "Element shrinks in size"
    },
    "color-flash": {
      name: "Color Flash",
      category: "emphasis",
      duration: 400,
      description: "Element flashes with color change"
    },
    "bold-flash": {
      name: "Bold Flash",
      category: "emphasis",
      duration: 400,
      description: "Element flashes bold"
    },
    "spin-clockwise": {
      name: "Spin Clockwise",
      category: "emphasis",
      duration: 600,
      description: "Element spins clockwise"
    },
    "spin-counter-clockwise": {
      name: "Spin Counter-Clockwise",
      category: "emphasis",
      duration: 600,
      description: "Element spins counter-clockwise"
    }
  };

  return metadata[type] || {
    name: "Unknown",
    category: "entrance",
    duration: 500,
    description: "Unknown animation"
  };
}

