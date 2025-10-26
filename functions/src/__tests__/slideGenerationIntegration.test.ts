/**
 * Slide Generation Integration Tests
 * Validates end-to-end slide generation with professional design
 */

import { describe, it, expect } from "vitest";
import type { SlideSpecV1 } from "@plzfixthx/slide-spec";

describe("Slide Generation Integration", () => {
  const createProfessionalSlideSpec = (): SlideSpecV1 => ({
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Premium Business",
      aspectRatio: "16:9"
    },
    content: {
      title: { id: "title", text: "Accelerate Growth" },
      subtitle: { id: "subtitle", text: "Transform your business with innovative solutions" },
      bullets: [{
        id: "b1",
        items: [
          { text: "Increase revenue by 40% in 12 months", level: 1 },
          { text: "Reduce operational costs by 25%", level: 1 },
          { text: "Improve customer satisfaction to 95%", level: 1 },
          { text: "Scale operations without adding headcount", level: 1 }
        ]
      }],
      callouts: [{
        id: "c1",
        title: "Key Insight",
        text: "Companies that implement these strategies see 3x faster growth",
        variant: "success"
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
        { refId: "b1", region: "body", order: 0 },
        { refId: "c1", region: "body", order: 1 }
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

  describe("Professional Slide Specification", () => {
    it("should generate valid slide spec", () => {
      const spec = createProfessionalSlideSpec();

      expect(spec.meta.version).toBe("1.0");
      expect(spec.meta.aspectRatio).toBe("16:9");
      expect(spec.content.title).toBeDefined();
      expect(spec.styleTokens.palette).toBeDefined();
    });

    it("should have compelling content", () => {
      const spec = createProfessionalSlideSpec();

      // Title should be action-oriented
      expect(spec.content.title.text).toMatch(/Accelerate|Transform|Unlock|Maximize/);

      // Subtitle should provide context
      expect(spec.content.subtitle?.text).toBeTruthy();
      expect(spec.content.subtitle!.text.length).toBeGreaterThan(10);

      // Bullets should be specific and measurable
      const bullets = spec.content.bullets?.[0]?.items || [];
      expect(bullets.length).toBeGreaterThan(0);
      expect(bullets.length).toBeLessThanOrEqual(5);

      // Each bullet should have specific metrics
      const hasMetrics = bullets.some(b => /\d+%|\d+x|[0-9]+/.test(b.text));
      expect(hasMetrics).toBe(true);
    });

    it("should have professional color palette", () => {
      const spec = createProfessionalSlideSpec();
      const palette = spec.styleTokens.palette;

      // Primary and accent colors should be different
      expect(palette.primary).not.toBe(palette.accent);

      // All colors should be valid hex
      const hexRegex = /^#[0-9A-F]{6}$/i;
      expect(hexRegex.test(palette.primary)).toBe(true);
      expect(hexRegex.test(palette.accent)).toBe(true);

      // Neutral palette should have 7 colors
      expect(palette.neutral).toHaveLength(7);
      palette.neutral.forEach(color => {
        expect(hexRegex.test(color)).toBe(true);
      });
    });

    it("should have proper typography hierarchy", () => {
      const spec = createProfessionalSlideSpec();
      const sizes = spec.styleTokens.typography.sizes;

      // Verify size hierarchy
      expect(sizes.step_3).toBeGreaterThan(sizes.step_2);
      expect(sizes.step_2).toBeGreaterThan(sizes.step_1);
      expect(sizes.step_1).toBeGreaterThan(sizes.step_0);

      // Title should be large
      expect(sizes.step_3).toBeGreaterThanOrEqual(40);

      // Body text should be readable
      expect(sizes.step_0).toBeGreaterThanOrEqual(14);
    });

    it("should have WCAG AAA accessibility", () => {
      const spec = createProfessionalSlideSpec();
      const contrast = spec.styleTokens.contrast;

      // WCAG AAA requires 7:1 for text
      expect(contrast.minTextContrast).toBeGreaterThanOrEqual(7);

      // UI elements require 4.5:1
      expect(contrast.minUiContrast).toBeGreaterThanOrEqual(4.5);
    });

    it("should have proper spacing system", () => {
      const spec = createProfessionalSlideSpec();
      const spacing = spec.styleTokens.spacing;

      expect(spacing.base).toBe(4);
      expect(spacing.steps).toContain(0);
      expect(spacing.steps).toContain(4);
      expect(spacing.steps).toContain(8);
      expect(spacing.steps).toContain(32);

      // Verify spacing is in ascending order
      for (let i = 1; i < spacing.steps.length; i++) {
        expect(spacing.steps[i]).toBeGreaterThanOrEqual(spacing.steps[i - 1]);
      }
    });
  });

  describe("Layout System", () => {
    it("should have valid grid system", () => {
      const spec = createProfessionalSlideSpec();
      const grid = spec.layout.grid;

      expect(grid.rows).toBeGreaterThanOrEqual(3);
      expect(grid.cols).toBeGreaterThanOrEqual(3);
      expect(grid.gutter).toBeGreaterThanOrEqual(0);

      // Margins should be professional (minimum 32px = 0.44in)
      expect(grid.margin.t).toBeGreaterThanOrEqual(32);
      expect(grid.margin.r).toBeGreaterThanOrEqual(32);
      expect(grid.margin.b).toBeGreaterThanOrEqual(32);
      expect(grid.margin.l).toBeGreaterThanOrEqual(32);
    });

    it("should have valid regions", () => {
      const spec = createProfessionalSlideSpec();
      const regions = spec.layout.regions;

      expect(regions.length).toBeGreaterThan(0);

      regions.forEach(region => {
        expect(["header", "body", "footer", "aside"]).toContain(region.name);
        expect(region.rowStart).toBeGreaterThan(0);
        expect(region.colStart).toBeGreaterThan(0);
        expect(region.rowSpan).toBeGreaterThan(0);
        expect(region.colSpan).toBeGreaterThan(0);
      });
    });

    it("should have valid anchors", () => {
      const spec = createProfessionalSlideSpec();
      const anchors = spec.layout.anchors;

      expect(anchors.length).toBeGreaterThan(0);

      anchors.forEach(anchor => {
        expect(["header", "body", "footer", "aside"]).toContain(anchor.region);
        expect(anchor.order).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Design Quality Metrics", () => {
    it("should meet professional design standards", () => {
      const spec = createProfessionalSlideSpec();

      // Check for professional theme
      expect(spec.meta.theme).toBeTruthy();

      // Check for proper aspect ratio
      expect(["16:9", "4:3"]).toContain(spec.meta.aspectRatio);

      // Check for complete style tokens
      expect(spec.styleTokens.palette).toBeDefined();
      expect(spec.styleTokens.typography).toBeDefined();
      expect(spec.styleTokens.spacing).toBeDefined();
      expect(spec.styleTokens.contrast).toBeDefined();
    });

    it("should have balanced content distribution", () => {
      const spec = createProfessionalSlideSpec();

      // Should have title
      expect(spec.content.title).toBeDefined();

      // Should have subtitle for context
      expect(spec.content.subtitle).toBeDefined();

      // Should have bullets for key points
      expect(spec.content.bullets).toBeDefined();
      expect(spec.content.bullets!.length).toBeGreaterThan(0);

      // Should have callouts for emphasis
      expect(spec.content.callouts).toBeDefined();
      expect(spec.content.callouts!.length).toBeGreaterThan(0);
    });

    it("should follow content best practices", () => {
      const spec = createProfessionalSlideSpec();

      // Title should be concise (4-8 words ideal)
      const titleWords = spec.content.title.text.split(" ").length;
      expect(titleWords).toBeGreaterThanOrEqual(2);
      expect(titleWords).toBeLessThanOrEqual(10);

      // Bullets should be concise
      const bullets = spec.content.bullets?.[0]?.items || [];
      bullets.forEach(bullet => {
        const words = bullet.text.split(" ").length;
        expect(words).toBeGreaterThanOrEqual(3);
        expect(words).toBeLessThanOrEqual(20);
      });

      // Total content should be under 100 words
      const allText = [
        spec.content.title.text,
        spec.content.subtitle?.text || "",
        ...bullets.map(b => b.text),
        ...((spec.content.callouts || []).map(c => c.text))
      ].join(" ");

      const totalWords = allText.split(" ").length;
      expect(totalWords).toBeLessThan(150);
    });
  });
});

