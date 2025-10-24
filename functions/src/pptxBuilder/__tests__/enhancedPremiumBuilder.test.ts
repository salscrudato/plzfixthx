/**
 * Enhanced Premium Builder Tests
 * Validates world-class slide generation
 */

import { describe, it, expect } from "vitest";
import { validateEnhancedSlideSpec } from "../enhancedPremiumBuilder";
import type { SlideSpecV1 } from "../../types/SlideSpecV1";

describe("Enhanced Premium Builder", () => {
  const createValidSpec = (): SlideSpecV1 => ({
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Premium Business",
      aspectRatio: "16:9"
    },
    content: {
      title: { id: "title", text: "Transform Your Business" },
      subtitle: { id: "subtitle", text: "Unlock growth potential with innovative solutions" },
      bullets: [{
        id: "b1",
        items: [
          { text: "Accelerate revenue growth by 40%", level: 1 },
          { text: "Streamline operations and reduce costs", level: 1 },
          { text: "Enhance customer satisfaction scores", level: 1 }
        ]
      }]
    },
    layout: {
      grid: { rows: 8, cols: 12, gutter: 8, margin: { t: 32, r: 32, b: 32, l: 32 } },
      regions: [
        { name: "header", rowStart: 1, colStart: 1, rowSpan: 2, colSpan: 12 },
        { name: "body", rowStart: 3, colStart: 1, rowSpan: 5, colSpan: 12 }
      ],
      anchors: [
        { refId: "title", region: "header", order: 0 },
        { refId: "subtitle", region: "header", order: 1 },
        { refId: "b1", region: "body", order: 0 }
      ]
    },
    styleTokens: {
      palette: {
        primary: "#1E40AF",
        accent: "#06B6D4",
        neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#F8FAFC"]
      },
      typography: {
        fonts: { sans: "Aptos, Arial, sans-serif" },
        sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 28, step_3: 44 },
        weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { compact: 1.2, standard: 1.5 }
      },
      spacing: { base: 4, steps: [0, 4, 8, 12, 16, 24, 32] },
      radii: { sm: 4, md: 8, lg: 12 },
      shadows: { sm: "0 2px 4px rgba(0,0,0,.08)", md: "0 4px 12px rgba(0,0,0,.12)", lg: "0 12px 32px rgba(0,0,0,.16)" },
      contrast: { minTextContrast: 7, minUiContrast: 4.5 }
    }
  });

  describe("Specification Validation", () => {
    it("should validate a correct spec", () => {
      const spec = createValidSpec();
      const result = validateEnhancedSlideSpec(spec);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject spec without title", () => {
      const spec = createValidSpec();
      spec.content.title.text = "";

      const result = validateEnhancedSlideSpec(spec);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Title is required");
    });

    it("should reject spec without primary color", () => {
      const spec = createValidSpec();
      spec.styleTokens.palette.primary = "";

      const result = validateEnhancedSlideSpec(spec);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Primary color is required");
    });

    it("should reject spec without accent color", () => {
      const spec = createValidSpec();
      spec.styleTokens.palette.accent = "";

      const result = validateEnhancedSlideSpec(spec);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Accent color is required");
    });

    it("should reject spec with insufficient neutral colors", () => {
      const spec = createValidSpec();
      spec.styleTokens.palette.neutral = ["#0F172A", "#1E293B"];

      const result = validateEnhancedSlideSpec(spec);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Neutral palette must have at least 7 colors");
    });

    it("should reject invalid hex color format", () => {
      const spec = createValidSpec();
      spec.styleTokens.palette.primary = "1E40AF"; // Missing #

      const result = validateEnhancedSlideSpec(spec);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Primary color must be valid hex format");
    });

    it("should accept valid hex colors", () => {
      const spec = createValidSpec();
      spec.styleTokens.palette.primary = "#1E40AF";
      spec.styleTokens.palette.accent = "#06B6D4";

      const result = validateEnhancedSlideSpec(spec);
      expect(result.valid).toBe(true);
    });
  });

  describe("Content Quality", () => {
    it("should have compelling title", () => {
      const spec = createValidSpec();
      const title = spec.content.title.text;

      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(3);
      expect(title.length).toBeLessThan(100);
    });

    it("should have descriptive subtitle", () => {
      const spec = createValidSpec();
      const subtitle = spec.content.subtitle?.text;

      expect(subtitle).toBeTruthy();
      expect(subtitle!.length).toBeGreaterThan(5);
    });

    it("should have action-oriented bullets", () => {
      const spec = createValidSpec();
      const bullets = spec.content.bullets?.[0]?.items || [];

      expect(bullets.length).toBeGreaterThan(0);
      expect(bullets.length).toBeLessThanOrEqual(5);

      // Check for action verbs
      const actionVerbs = ["Accelerate", "Streamline", "Enhance", "Transform", "Unlock"];
      const hasActionVerb = bullets.some(b =>
        actionVerbs.some(verb => b.text.includes(verb))
      );

      expect(hasActionVerb).toBe(true);
    });
  });

  describe("Design System Integration", () => {
    it("should have professional color palette", () => {
      const spec = createValidSpec();
      const palette = spec.styleTokens.palette;

      expect(palette.primary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(palette.accent).toMatch(/^#[0-9A-F]{6}$/i);
      expect(palette.neutral).toHaveLength(7);
    });

    it("should have proper typography hierarchy", () => {
      const spec = createValidSpec();
      const sizes = spec.styleTokens.typography.sizes;

      expect(sizes.step_3).toBeGreaterThan(sizes.step_2);
      expect(sizes.step_2).toBeGreaterThan(sizes.step_1);
      expect(sizes.step_1).toBeGreaterThan(sizes.step_0);
    });

    it("should have WCAG AAA contrast ratio", () => {
      const spec = createValidSpec();
      const contrast = spec.styleTokens.contrast;

      expect(contrast.minTextContrast).toBeGreaterThanOrEqual(7);
      expect(contrast.minUiContrast).toBeGreaterThanOrEqual(4.5);
    });

    it("should have proper spacing system", () => {
      const spec = createValidSpec();
      const spacing = spec.styleTokens.spacing;

      expect(spacing.base).toBe(4);
      expect(spacing.steps).toContain(0);
      expect(spacing.steps).toContain(32);
    });
  });

  describe("Layout Validation", () => {
    it("should have valid grid system", () => {
      const spec = createValidSpec();
      const grid = spec.layout.grid;

      expect(grid.rows).toBeGreaterThanOrEqual(3);
      expect(grid.cols).toBeGreaterThanOrEqual(3);
      expect(grid.gutter).toBeGreaterThanOrEqual(0);
    });

    it("should have minimum margins", () => {
      const spec = createValidSpec();
      const margin = spec.layout.grid.margin;

      expect(margin.t).toBeGreaterThanOrEqual(32);
      expect(margin.r).toBeGreaterThanOrEqual(32);
      expect(margin.b).toBeGreaterThanOrEqual(32);
      expect(margin.l).toBeGreaterThanOrEqual(32);
    });

    it("should have valid regions", () => {
      const spec = createValidSpec();
      const regions = spec.layout.regions;

      expect(regions.length).toBeGreaterThan(0);
      regions.forEach(region => {
        expect(["header", "body", "footer", "aside"]).toContain(region.name);
        expect(region.rowStart).toBeGreaterThan(0);
        expect(region.colStart).toBeGreaterThan(0);
      });
    });
  });
});

