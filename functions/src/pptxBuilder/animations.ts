/**
 * Slide Animations & Transitions
 * Entrance, exit, emphasis animations and slide transitions
 */

import PptxGenJS from "pptxgenjs";

export type EntranceAnimation = 
  | "fade" 
  | "wipe" 
  | "fly-in" 
  | "zoom" 
  | "appear" 
  | "split" 
  | "dissolve"
  | "box"
  | "checkerboard"
  | "blinds"
  | "random-bars";

export type ExitAnimation = 
  | "fade" 
  | "wipe" 
  | "fly-out" 
  | "zoom" 
  | "disappear";

export type EmphasisAnimation = 
  | "pulse" 
  | "color-pulse" 
  | "grow-shrink" 
  | "spin" 
  | "transparency"
  | "bold-flash"
  | "underline";

export type SlideTransition = 
  | "fade" 
  | "push" 
  | "wipe" 
  | "split" 
  | "reveal" 
  | "cover"
  | "uncover"
  | "flash"
  | "dissolve"
  | "random-bars"
  | "checkerboard"
  | "blinds"
  | "clock"
  | "ripple"
  | "honeycomb"
  | "glitter"
  | "vortex"
  | "shred"
  | "switch"
  | "flip"
  | "gallery"
  | "cube"
  | "doors"
  | "box"
  | "comb"
  | "zoom"
  | "random";

export interface AnimationConfig {
  type: EntranceAnimation | ExitAnimation | EmphasisAnimation;
  duration?: number; // milliseconds (default: 500)
  delay?: number; // milliseconds (default: 0)
  direction?: "left" | "right" | "top" | "bottom" | "center";
}

export interface TransitionConfig {
  type: SlideTransition;
  duration?: number; // milliseconds (default: 1000)
  direction?: "left" | "right" | "top" | "bottom";
}

/**
 * Apply entrance animation to slide element
 * Note: PptxGenJS has limited animation support, this is a best-effort implementation
 */
export function applyEntranceAnimation(
  slide: any,
  elementId: string,
  animation: AnimationConfig
): void {
  // PptxGenJS doesn't have full animation API yet
  // This is a placeholder for future implementation
  // For now, we'll document the animation intent in slide notes
  
  const animationNote = `Animation: ${animation.type} (${animation.duration || 500}ms, delay: ${animation.delay || 0}ms)`;
  
  // Store animation metadata (would be used by rendering engine)
  if (!slide._animations) {
    slide._animations = [];
  }
  
  slide._animations.push({
    elementId,
    type: "entrance",
    animation: animation.type,
    duration: animation.duration || 500,
    delay: animation.delay || 0,
    direction: animation.direction
  });
}

/**
 * Apply exit animation to slide element
 */
export function applyExitAnimation(
  slide: any,
  elementId: string,
  animation: AnimationConfig
): void {
  if (!slide._animations) {
    slide._animations = [];
  }
  
  slide._animations.push({
    elementId,
    type: "exit",
    animation: animation.type,
    duration: animation.duration || 500,
    delay: animation.delay || 0,
    direction: animation.direction
  });
}

/**
 * Apply emphasis animation to slide element
 */
export function applyEmphasisAnimation(
  slide: any,
  elementId: string,
  animation: AnimationConfig
): void {
  if (!slide._animations) {
    slide._animations = [];
  }
  
  slide._animations.push({
    elementId,
    type: "emphasis",
    animation: animation.type,
    duration: animation.duration || 500,
    delay: animation.delay || 0
  });
}

/**
 * Apply slide transition
 */
export function applySlideTransition(
  slide: any,
  transition: TransitionConfig
): void {
  // Map our transition types to PptxGenJS transition types
  const transitionMap: Record<string, string> = {
    "fade": "fade",
    "push": "push",
    "wipe": "wipe",
    "split": "split",
    "reveal": "reveal",
    "cover": "cover",
    "uncover": "uncover",
    "flash": "flash",
    "dissolve": "dissolve",
    "random-bars": "randomBars",
    "checkerboard": "checkerboard",
    "blinds": "blinds",
    "clock": "clock",
    "ripple": "ripple",
    "honeycomb": "honeycomb",
    "glitter": "glitter",
    "vortex": "vortex",
    "shred": "shred",
    "switch": "switch",
    "flip": "flip",
    "gallery": "gallery",
    "cube": "cube",
    "doors": "doors",
    "box": "box",
    "comb": "comb",
    "zoom": "zoom",
    "random": "random"
  };

  const pptxTransition = transitionMap[transition.type] || "fade";
  
  // Apply transition using PptxGenJS API
  slide.transition = {
    type: pptxTransition,
    duration: (transition.duration || 1000) / 1000, // Convert to seconds
    direction: transition.direction
  };
}

/**
 * Create animation sequence for multiple elements
 */
export function createAnimationSequence(
  slide: any,
  sequence: Array<{
    elementId: string;
    animation: AnimationConfig;
    order: number;
  }>
): void {
  // Sort by order
  const sorted = sequence.sort((a, b) => a.order - b.order);
  
  // Apply animations with calculated delays
  let cumulativeDelay = 0;
  
  for (const item of sorted) {
    const animationWithDelay = {
      ...item.animation,
      delay: cumulativeDelay + (item.animation.delay || 0)
    };
    
    applyEntranceAnimation(slide, item.elementId, animationWithDelay);
    
    // Add duration to cumulative delay for next item
    cumulativeDelay += (item.animation.duration || 500);
  }
}

/**
 * Get recommended animation based on slide pattern
 */
export function getRecommendedAnimation(
  pattern: "hero" | "split" | "asymmetric" | "grid" | "minimal" | "data-focused"
): {
  entrance: EntranceAnimation;
  transition: SlideTransition;
} {
  const recommendations = {
    hero: {
      entrance: "zoom" as EntranceAnimation,
      transition: "fade" as SlideTransition
    },
    split: {
      entrance: "wipe" as EntranceAnimation,
      transition: "split" as SlideTransition
    },
    asymmetric: {
      entrance: "fly-in" as EntranceAnimation,
      transition: "push" as SlideTransition
    },
    grid: {
      entrance: "appear" as EntranceAnimation,
      transition: "dissolve" as SlideTransition
    },
    minimal: {
      entrance: "fade" as EntranceAnimation,
      transition: "fade" as SlideTransition
    },
    "data-focused": {
      entrance: "wipe" as EntranceAnimation,
      transition: "wipe" as SlideTransition
    }
  };
  
  return recommendations[pattern] || recommendations.minimal;
}

/**
 * Apply professional animation preset to slide
 */
export function applyProfessionalAnimationPreset(
  slide: any,
  pattern: "hero" | "split" | "asymmetric" | "grid" | "minimal" | "data-focused",
  elementIds: {
    title?: string;
    subtitle?: string;
    bullets?: string[];
    chart?: string;
    image?: string;
  }
): void {
  const recommended = getRecommendedAnimation(pattern);
  
  // Apply slide transition
  applySlideTransition(slide, {
    type: recommended.transition,
    duration: 800
  });
  
  // Create animation sequence
  const sequence: Array<{
    elementId: string;
    animation: AnimationConfig;
    order: number;
  }> = [];
  
  let order = 0;
  
  // Title appears first
  if (elementIds.title) {
    sequence.push({
      elementId: elementIds.title,
      animation: {
        type: recommended.entrance,
        duration: 600,
        delay: 0
      },
      order: order++
    });
  }
  
  // Subtitle appears second
  if (elementIds.subtitle) {
    sequence.push({
      elementId: elementIds.subtitle,
      animation: {
        type: "fade",
        duration: 500,
        delay: 200
      },
      order: order++
    });
  }
  
  // Bullets appear one by one
  if (elementIds.bullets) {
    for (const bulletId of elementIds.bullets) {
      sequence.push({
        elementId: bulletId,
        animation: {
          type: "fly-in",
          duration: 400,
          delay: 150,
          direction: "left"
        },
        order: order++
      });
    }
  }
  
  // Chart appears
  if (elementIds.chart) {
    sequence.push({
      elementId: elementIds.chart,
      animation: {
        type: "wipe",
        duration: 800,
        delay: 0,
        direction: "bottom"
      },
      order: order++
    });
  }
  
  // Image appears
  if (elementIds.image) {
    sequence.push({
      elementId: elementIds.image,
      animation: {
        type: "zoom",
        duration: 600,
        delay: 0
      },
      order: order++
    });
  }
  
  createAnimationSequence(slide, sequence);
}

/**
 * Export animation metadata for web preview
 */
export function exportAnimationMetadata(slide: any): any {
  return {
    animations: slide._animations || [],
    transition: slide.transition || null
  };
}

