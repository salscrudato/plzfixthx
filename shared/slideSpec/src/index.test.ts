import { describe, it, expect } from "vitest";
import { SlideSpecZ, safePalette } from "./index";

describe("SlideSpec Schema", () => {
  describe("safePalette", () => {
    it("should accept valid hex colors", () => {
      const result = safePalette({
        primary: "#1E40AF",
        accent: "#F59E0B",
        neutral: ["#000000", "#111111", "#222222", "#333333", "#444444", "#555555", "#666666", "#777777", "#888888"],
      });

      expect(result.primary).toBe("#1E40AF");
      expect(result.accent).toBe("#F59E0B");
      expect(result.neutral.length).toBe(9);
    });

    it("should use defaults for invalid colors", () => {
      const result = safePalette({
        primary: "invalid",
        accent: "also-invalid",
      });

      expect(result.primary).toBe("#1E40AF");
      expect(result.accent).toBe("#F59E0B");
    });

    it("should pad neutral palette to 9 colors", () => {
      const result = safePalette({
        neutral: ["#000000", "#111111", "#222222"],
      });

      expect(result.neutral.length).toBe(9);
    });

    it("should filter invalid colors from neutral palette", () => {
      const result = safePalette({
        neutral: ["#000000", "invalid", "#111111", "also-invalid", "#222222", "#333333", "#444444", "#555555"],
      });

      expect(result.neutral.length).toBe(9);
      expect(result.neutral.every((c) => /^#[0-9A-Fa-f]{6}$/.test(c))).toBe(true);
    });

    it("should use default neutral if insufficient valid colors", () => {
      const result = safePalette({
        neutral: ["#000000", "invalid"],
      });

      expect(result.neutral.length).toBe(9);
    });
  });

  describe("SlideSpecZ validation", () => {
    const validSpec = {
      meta: {
        version: "1.0" as const,
        locale: "en-US",
        theme: "light",
        aspectRatio: "16:9" as const,
      },
      content: {
        title: {
          id: "title",
          text: "Test Slide",
        },
      },
      layout: {
        grid: {
          rows: 6,
          cols: 6,
          gutter: 16,
          margin: { t: 32, r: 32, b: 32, l: 32 },
        },
        regions: [
          {
            name: "header" as const,
            rowStart: 1,
            colStart: 1,
            rowSpan: 2,
            colSpan: 6,
          },
        ],
        anchors: [
          {
            refId: "title",
            region: "header" as const,
            order: 0,
          },
        ],
      },
      styleTokens: {
        palette: {
          primary: "#1E40AF",
          accent: "#F59E0B",
          neutral: ["#0F172A", "#1E293B", "#334155", "#475569", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC"],
        },
        typography: {
          fonts: { sans: "Inter, sans-serif" },
          sizes: {
            "step_-2": 12,
            "step_-1": 14,
            step_0: 16,
            step_1: 20,
            step_2: 24,
            step_3: 44,
          },
          weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
          lineHeights: { compact: 1.2, standard: 1.5 },
        },
        spacing: { base: 4, steps: [4, 8, 12, 16, 24, 32, 48, 64] },
        radii: { sm: 4, md: 8, lg: 16 },
        shadows: { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.1)", lg: "0 10px 15px rgba(0,0,0,0.1)" },
        contrast: { minTextContrast: 7, minUiContrast: 4.5 },
      },
    };

    it("should validate a complete spec", () => {
      const result = SlideSpecZ.safeParse(validSpec);
      expect(result.success).toBe(true);
    });

    it("should reject duplicate content IDs", () => {
      const spec = {
        ...validSpec,
        content: {
          ...validSpec.content,
          title: { id: "same-id", text: "Title" },
          subtitle: { id: "same-id", text: "Subtitle" },
        },
      };

      const result = SlideSpecZ.safeParse(spec);
      expect(result.success).toBe(false);
    });

    it("should reject anchors referencing non-existent content", () => {
      const spec = {
        ...validSpec,
        layout: {
          ...validSpec.layout,
          anchors: [
            {
              refId: "non-existent",
              region: "header" as const,
              order: 0,
            },
          ],
        },
      };

      const result = SlideSpecZ.safeParse(spec);
      expect(result.success).toBe(false);
    });

    it("should reject regions that exceed grid bounds", () => {
      const spec = {
        ...validSpec,
        layout: {
          ...validSpec.layout,
          regions: [
            {
              name: "header" as const,
              rowStart: 1,
              colStart: 1,
              rowSpan: 10, // Exceeds 6 rows
              colSpan: 6,
            },
          ],
        },
      };

      const result = SlideSpecZ.safeParse(spec);
      expect(result.success).toBe(false);
    });

    it("should reject overlapping regions", () => {
      const spec = {
        ...validSpec,
        layout: {
          ...validSpec.layout,
          regions: [
            {
              name: "header" as const,
              rowStart: 1,
              colStart: 1,
              rowSpan: 3,
              colSpan: 6,
            },
            {
              name: "body" as const,
              rowStart: 2,
              colStart: 1,
              rowSpan: 3,
              colSpan: 6,
            },
          ],
          anchors: [
            {
              refId: "title",
              region: "header" as const,
              order: 0,
            },
          ],
        },
      };

      const result = SlideSpecZ.safeParse(spec);
      expect(result.success).toBe(false);
    });

    it("should reject dataViz with mismatched series lengths", () => {
      const spec = {
        ...validSpec,
        content: {
          ...validSpec.content,
          dataViz: {
            id: "chart",
            kind: "bar" as const,
            labels: ["Q1", "Q2", "Q3"],
            series: [
              { name: "Series 1", values: [10, 20] }, // Only 2 values
            ],
          },
        },
      };

      const result = SlideSpecZ.safeParse(spec);
      expect(result.success).toBe(false);
    });

    it("should reject non-ascending typography sizes", () => {
      const spec = {
        ...validSpec,
        styleTokens: {
          ...validSpec.styleTokens,
          typography: {
            ...validSpec.styleTokens.typography,
            sizes: {
              "step_-2": 12,
              "step_-1": 14,
              step_0: 16,
              step_1: 15, // Not ascending
              step_2: 24,
              step_3: 44,
            },
          },
        },
      };

      const result = SlideSpecZ.safeParse(spec);
      expect(result.success).toBe(false);
    });

    it("should accept optional fields", () => {
      const spec = {
        ...validSpec,
        design: {
          pattern: "hero" as const,
          whitespace: {
            strategy: "generous" as const,
            breathingRoom: 0.5,
          },
        },
        content: {
          ...validSpec.content,
          subtitle: { id: "subtitle", text: "Subtitle" },
        },
      };

      const result = SlideSpecZ.safeParse(spec);
      expect(result.success).toBe(true);
    });
  });
});

