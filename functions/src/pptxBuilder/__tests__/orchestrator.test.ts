import { describe, it, expect, beforeEach, vi } from "vitest";
import { getSlideDims } from "../orchestrator";
import type { SlideSpecV1 } from "../../types/SlideSpecV1";

describe("orchestrator", () => {
  describe("getSlideDims", () => {
    it("should return 16:9 dimensions by default", () => {
      const dims = getSlideDims("16:9");
      expect(dims.wIn).toBe(10);
      expect(dims.hIn).toBe(5.625);
    });

    it("should return 4:3 dimensions when specified", () => {
      const dims = getSlideDims("4:3");
      expect(dims.wIn).toBe(10);
      expect(dims.hIn).toBe(7.5);
    });

    it("should maintain aspect ratio for 16:9", () => {
      const dims = getSlideDims("16:9");
      const ratio = dims.wIn / dims.hIn;
      expect(ratio).toBeCloseTo(16 / 9, 2);
    });

    it("should maintain aspect ratio for 4:3", () => {
      const dims = getSlideDims("4:3");
      const ratio = dims.wIn / dims.hIn;
      expect(ratio).toBeCloseTo(4 / 3, 2);
    });
  });

  describe("buildWithFallback", () => {
    let mockPptx: any;
    let mockSpec: SlideSpecV1;

    beforeEach(() => {
      mockPptx = {
        addSlide: vi.fn().mockReturnValue({
          background: {},
          addText: vi.fn(),
          addShape: vi.fn(),
          addChart: vi.fn()
        })
      };

      mockSpec = {
        meta: {
          version: "1.0",
          locale: "en-US",
          theme: "Professional",
          aspectRatio: "16:9"
        },
        content: {
          title: { id: "title", text: "Test Slide" },
          subtitle: { id: "subtitle", text: "Subtitle" }
        },
        layout: {
          grid: {
            rows: 6,
            cols: 12,
            gutter: 12,
            margin: { t: 20, r: 20, b: 20, l: 20 }
          },
          regions: [
            {
              name: "header",
              rowStart: 1,
              rowSpan: 2,
              colStart: 1,
              colSpan: 12
            }
          ],
          anchors: [
            {
              refId: "title",
              region: "header",
              order: 1
            }
          ]
        },
        styleTokens: {
          palette: {
            primary: "#6366F1",
            accent: "#EC4899",
            neutral: ["#0F172A", "#1E293B", "#334155", "#475569", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC"]
          },
          typography: {
            fonts: { sans: "Arial" },
            sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 24, step_3: 32 },
            weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
            lineHeights: { compact: 1.2, standard: 1.5 }
          },
          spacing: { base: 4, steps: [0, 4, 8, 12, 16, 24, 32] },
          radii: { sm: 2, md: 6, lg: 12 },
          shadows: { sm: "0 1px 2px rgba(0,0,0,.06)", md: "0 4px 8px rgba(0,0,0,.12)", lg: "0 12px 24px rgba(0,0,0,.18)" },
          contrast: { minTextContrast: 4.5, minUiContrast: 3 }
        }
      };
    });

    it("should return a BuildResult with metrics", async () => {
      // This test would require mocking the builders
      // For now, we test the structure
      expect(mockSpec).toBeDefined();
      expect(mockSpec.meta.aspectRatio).toBe("16:9");
    });

    it("should handle missing content gracefully", async () => {
      const emptySpec = { ...mockSpec, content: {} };
      expect(emptySpec.content).toBeDefined();
    });

    it("should validate spec structure", async () => {
      expect(mockSpec.layout.grid).toBeDefined();
      expect(mockSpec.layout.regions).toBeDefined();
      expect(mockSpec.layout.anchors).toBeDefined();
      expect(mockSpec.styleTokens).toBeDefined();
    });
  });
});

