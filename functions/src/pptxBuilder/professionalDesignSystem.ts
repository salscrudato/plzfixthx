/**
 * Professional Design System
 * Implements world-class design principles inspired by Apple, Google, Tesla, ChatGPT
 * Provides sophisticated gradients, accents, shapes, and typography
 */

import PptxGenJS from "pptxgenjs";
import type { SlideSpecV1 } from "../types/SlideSpecV1";

/**
 * Professional gradient configurations
 */
export interface GradientConfig {
  type: "diagonal" | "horizontal" | "vertical" | "radial";
  startColor: string;
  endColor: string;
  opacity: number; // 0-1, typically 0.03-0.08 for subtle
  angle?: number; // for diagonal
}

/**
 * Accent configuration
 */
export interface AccentConfig {
  position: "left" | "top" | "right" | "bottom";
  width: number; // in inches
  color: string;
  opacity?: number; // 0-1
}

/**
 * Apply sophisticated gradient background
 */
export function applyProfessionalGradient(
  slide: any,
  config: GradientConfig
): void {
  const slideWidth = 10;
  const slideHeight = 7.5;

  // Create gradient overlay shape
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: slideWidth,
    h: slideHeight,
    fill: {
      type: "solid",
      color: config.startColor,
      transparency: Math.round((1 - config.opacity) * 100)
    },
    line: { type: "none" }
  });

  // Add accent color overlay for gradient effect
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: slideWidth,
    h: slideHeight,
    fill: {
      type: "solid",
      color: config.endColor,
      transparency: Math.round((1 - (config.opacity * 0.5)) * 100)
    },
    line: { type: "none" }
  });
}

/**
 * Add professional accent bar
 */
export function addProfessionalAccentBar(
  slide: any,
  config: AccentConfig
): void {
  const slideWidth = 10;
  const slideHeight = 7.5;

  let x = 0, y = 0, w = config.width, h = slideHeight;

  if (config.position === "top") {
    x = 0;
    y = 0;
    w = slideWidth;
    h = config.width;
  } else if (config.position === "bottom") {
    x = 0;
    y = slideHeight - config.width;
    w = slideWidth;
    h = config.width;
  } else if (config.position === "right") {
    x = slideWidth - config.width;
    y = 0;
    w = config.width;
    h = slideHeight;
  }

  slide.addShape("rect", {
    x,
    y,
    w,
    h,
    fill: { color: config.color },
    line: { type: "none" },
    transparency: config.opacity ? Math.round((1 - config.opacity) * 100) : 0
  });
}

/**
 * Add corner flourish accent (professional design system version)
 */
export function addProfessionalCornerFlourish(
  slide: any,
  corner: "top-left" | "top-right" | "bottom-left" | "bottom-right",
  color: string,
  opacity: number = 0.1
): void {
  const slideWidth = 10;
  const slideHeight = 7.5;
  const size = 1.5; // inches

  let x = 0, y = 0;

  switch (corner) {
    case "top-right":
      x = slideWidth - size;
      y = 0;
      break;
    case "bottom-left":
      x = 0;
      y = slideHeight - size;
      break;
    case "bottom-right":
      x = slideWidth - size;
      y = slideHeight - size;
      break;
    case "top-left":
    default:
      x = 0;
      y = 0;
  }

  slide.addShape("ellipse", {
    x,
    y,
    w: size,
    h: size,
    fill: { color },
    line: { type: "none" },
    transparency: Math.round((1 - opacity) * 100)
  });
}

/**
 * Add premium divider line
 */
export function addPremiumDividerLine(
  slide: any,
  x: number,
  y: number,
  width: number,
  color: string,
  thickness: number = 0.04
): void {
  slide.addShape("rect", {
    x,
    y,
    w: width,
    h: thickness,
    fill: { color },
    line: { type: "none" }
  });
}

/**
 * Add subtle shadow effect
 */
export function addSubtleShadow(
  slide: any,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  slide.addShape("rect", {
    x,
    y,
    w: width,
    h: height,
    fill: { type: "none" },
    line: { type: "none" },
    shadow: {
      type: "outer",
      color: "000000",
      opacity: 0.08,
      blur: 12,
      offset: 4
    }
  });
}

/**
 * Get professional color palette based on theme
 */
export function getProfessionalPalette(theme: string): {
  primary: string;
  accent: string;
  neutral: string[];
} {
  const palettes: Record<string, any> = {
    "tech": {
      primary: "#1E40AF",
      accent: "#06B6D4",
      neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#F8FAFC"]
    },
    "finance": {
      primary: "#0F172A",
      accent: "#10B981",
      neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#F8FAFC"]
    },
    "healthcare": {
      primary: "#0D9488",
      accent: "#0EA5E9",
      neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#F8FAFC"]
    },
    "creative": {
      primary: "#EC4899",
      accent: "#F59E0B",
      neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#F8FAFC"]
    },
    "corporate": {
      primary: "#4F46E5",
      accent: "#475569",
      neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#F8FAFC"]
    }
  };

  return palettes[theme] || palettes["corporate"];
}

/**
 * Calculate optimal whitespace percentage based on pattern
 */
export function getOptimalWhitespace(pattern: string): number {
  const whitespaceMap: Record<string, number> = {
    "hero": 45,
    "minimal": 50,
    "split": 32,
    "asymmetric": 38,
    "grid": 24,
    "data-focused": 22
  };

  return whitespaceMap[pattern] || 30;
}

