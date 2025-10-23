/**
 * Professional Design Accents
 * Subtle, sophisticated visual elements that enhance slide quality
 * Inspired by Apple, Google, Tesla, and ChatGPT design systems
 */

import PptxGenJS from "pptxgenjs";

const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 7.5;

/**
 * Add a subtle gradient overlay for depth
 */
export function addGradientOverlay(
  slide: any,
  startColor: string,
  endColor: string,
  opacity: number = 0.05,
  direction: "top-to-bottom" | "left-to-right" | "diagonal" = "diagonal"
): void {
  const colors = [startColor, endColor];
  
  // Create gradient effect using semi-transparent rectangles
  const steps = 10;
  for (let i = 0; i < steps; i++) {
    const transparency = 100 - (opacity * 100 * (i / steps));
    const color = i < steps / 2 ? startColor : endColor;
    
    let x = 0, y = 0, w = SLIDE_WIDTH, h = SLIDE_HEIGHT;
    
    if (direction === "top-to-bottom") {
      y = (SLIDE_HEIGHT / steps) * i;
      h = SLIDE_HEIGHT / steps;
    } else if (direction === "left-to-right") {
      x = (SLIDE_WIDTH / steps) * i;
      w = SLIDE_WIDTH / steps;
    } else {
      // Diagonal
      x = (SLIDE_WIDTH / steps) * i;
      y = (SLIDE_HEIGHT / steps) * i;
      w = SLIDE_WIDTH / steps;
      h = SLIDE_HEIGHT / steps;
    }
    
    slide.addShape("rect", {
      x, y, w, h,
      fill: { color: color.replace("#", ""), transparency },
      line: { type: "none" }
    });
  }
}

/**
 * Add subtle corner flourish
 */
export function addCornerFlourish(
  slide: any,
  corner: "top-left" | "top-right" | "bottom-left" | "bottom-right",
  color: string,
  size: number = 0.3
): void {
  const cleanColor = color.replace("#", "");
  let x = 0, y = 0;
  
  switch (corner) {
    case "top-right":
      x = SLIDE_WIDTH - size;
      y = 0;
      break;
    case "bottom-left":
      x = 0;
      y = SLIDE_HEIGHT - size;
      break;
    case "bottom-right":
      x = SLIDE_WIDTH - size;
      y = SLIDE_HEIGHT - size;
      break;
    case "top-left":
    default:
      x = 0;
      y = 0;
  }
  
  // Main accent shape
  slide.addShape("roundRect", {
    x, y, w: size, h: size,
    fill: { color: cleanColor, transparency: 85 },
    line: { type: "none" }
  });
  
  // Smaller accent dot
  const dotSize = size * 0.4;
  const dotX = corner.includes("right") ? x + size - dotSize : x;
  const dotY = corner.includes("bottom") ? y + size - dotSize : y;
  
  slide.addShape("ellipse", {
    x: dotX, y: dotY, w: dotSize, h: dotSize,
    fill: { color: cleanColor, transparency: 70 },
    line: { type: "none" }
  });
}

/**
 * Add subtle line accent with gradient effect
 */
export function addLineAccent(
  slide: any,
  position: "top" | "bottom" | "left" | "right",
  color: string,
  thickness: number = 0.08
): void {
  const cleanColor = color.replace("#", "");
  let x = 0, y = 0, w = SLIDE_WIDTH, h = thickness;
  
  switch (position) {
    case "bottom":
      y = SLIDE_HEIGHT - thickness;
      break;
    case "left":
      w = thickness;
      h = SLIDE_HEIGHT;
      break;
    case "right":
      x = SLIDE_WIDTH - thickness;
      w = thickness;
      h = SLIDE_HEIGHT;
      break;
    case "top":
    default:
      break;
  }
  
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color: cleanColor, transparency: 80 },
    line: { type: "none" }
  });
}

/**
 * Add subtle dot pattern for visual interest
 */
export function addDotPattern(
  slide: any,
  color: string,
  density: "sparse" | "moderate" | "dense" = "sparse",
  opacity: number = 0.1
): void {
  const cleanColor = color.replace("#", "");
  const dotSize = 0.08;
  
  const spacing = density === "sparse" ? 1.5 : density === "moderate" ? 1.0 : 0.6;
  const transparency = 100 - (opacity * 100);
  
  for (let x = 0; x < SLIDE_WIDTH; x += spacing) {
    for (let y = 0; y < SLIDE_HEIGHT; y += spacing) {
      // Random offset for organic feel
      const offsetX = (Math.random() - 0.5) * 0.2;
      const offsetY = (Math.random() - 0.5) * 0.2;
      
      slide.addShape("ellipse", {
        x: x + offsetX,
        y: y + offsetY,
        w: dotSize,
        h: dotSize,
        fill: { color: cleanColor, transparency },
        line: { type: "none" }
      });
    }
  }
}

/**
 * Add subtle wave pattern at bottom
 */
export function addWaveAccent(
  slide: any,
  color: string,
  height: number = 0.5
): void {
  const cleanColor = color.replace("#", "");
  const waveY = SLIDE_HEIGHT - height;
  
  // Create wave effect with curved shapes
  const waveSegments = 8;
  const segmentWidth = SLIDE_WIDTH / waveSegments;
  
  for (let i = 0; i < waveSegments; i++) {
    const x = i * segmentWidth;
    const curveHeight = Math.sin((i / waveSegments) * Math.PI) * (height * 0.5);
    
    slide.addShape("rect", {
      x,
      y: waveY + curveHeight,
      w: segmentWidth,
      h: height - curveHeight,
      fill: { color: cleanColor, transparency: 85 },
      line: { type: "none" }
    });
  }
}

/**
 * Add subtle shadow effect to content area
 */
export function addContentShadow(
  slide: any,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string = "000000",
  blur: number = 8
): void {
  slide.addShape("rect", {
    x: x + 0.05,
    y: y + 0.05,
    w,
    h,
    fill: { color, transparency: 95 },
    line: { type: "none" },
    shadow: {
      type: "outer",
      color,
      opacity: 0.15,
      blur,
      offset: 4
    }
  });
}

/**
 * Add subtle frame/border accent
 */
export function addFrameAccent(
  slide: any,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  thickness: number = 0.06
): void {
  const cleanColor = color.replace("#", "");
  
  // Top border
  slide.addShape("rect", {
    x, y, w, h: thickness,
    fill: { color: cleanColor, transparency: 80 },
    line: { type: "none" }
  });
  
  // Right border
  slide.addShape("rect", {
    x: x + w - thickness, y, w: thickness, h,
    fill: { color: cleanColor, transparency: 80 },
    line: { type: "none" }
  });
  
  // Bottom border
  slide.addShape("rect", {
    x, y: y + h - thickness, w, h: thickness,
    fill: { color: cleanColor, transparency: 80 },
    line: { type: "none" }
  });
  
  // Left border
  slide.addShape("rect", {
    x, y, w: thickness, h,
    fill: { color: cleanColor, transparency: 80 },
    line: { type: "none" }
  });
}

/**
 * Add subtle connecting line between elements
 */
export function addConnectorLine(
  slide: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  thickness: number = 0.04
): void {
  const cleanColor = color.replace("#", "");
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  slide.addShape("rect", {
    x: x1,
    y: y1 - thickness / 2,
    w: length,
    h: thickness,
    fill: { color: cleanColor, transparency: 85 },
    line: { type: "none" },
    rotate: angle
  });
}

