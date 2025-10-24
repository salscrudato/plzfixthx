import { describe, it, expect } from "vitest";
import {
  getSlideDims,
  pxToIn,
  calculateGridDimensions,
  calculateRegionBounds,
  fitText,
  calculateTextHeight,
  ensureContrast,
  validateBulletCount,
  validateDataVizSeries
} from "../dimensionHelpers";

describe("dimensionHelpers", () => {
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
  });

  describe("pxToIn", () => {
    it("should convert pixels to inches correctly", () => {
      // 96 pixels = 1 inch (standard DPI)
      expect(pxToIn(96)).toBe(1);
      expect(pxToIn(192)).toBe(2);
      expect(pxToIn(48)).toBe(0.5);
    });

    it("should handle zero", () => {
      expect(pxToIn(0)).toBe(0);
    });
  });

  describe("calculateGridDimensions", () => {
    it("should calculate grid dimensions correctly", () => {
      const mockSpec = {
        layout: {
          grid: {
            rows: 6,
            cols: 12,
            gutter: 12,
            margin: { t: 20, r: 20, b: 20, l: 20 }
          }
        }
      } as any;

      const slideDims = { wIn: 10, hIn: 5.625 };
      const dims = calculateGridDimensions(mockSpec, slideDims);

      expect(dims).toHaveProperty("cellWidth");
      expect(dims).toHaveProperty("cellHeight");
      expect(dims.cellWidth).toBeGreaterThan(0);
      expect(dims.cellHeight).toBeGreaterThan(0);
    });
  });

  describe("ensureContrast", () => {
    it("should validate WCAG AA compliant contrast", () => {
      const result = ensureContrast("#000000", "#FFFFFF", 4.5);
      expect(result.compliant).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("should flag non-compliant contrast", () => {
      const result = ensureContrast("#CCCCCC", "#DDDDDD", 4.5);
      expect(result.compliant).toBe(false);
      expect(result.ratio).toBeLessThan(4.5);
    });

    it("should adjust colors to meet contrast requirement", () => {
      const result = ensureContrast("#CCCCCC", "#DDDDDD", 4.5);
      if (!result.compliant) {
        // Adjusted colors should be provided
        expect(result.foreground).toBeDefined();
        expect(result.background).toBeDefined();
      }
    });
  });

  describe("validateBulletCount", () => {
    it("should validate bullet count within limit", () => {
      const bullets = [
        { id: "b1", items: [{ text: "Item 1", level: 1 }, { text: "Item 2", level: 1 }, { text: "Item 3", level: 1 }] }
      ];
      const result = validateBulletCount(bullets, 6);
      expect(result.valid).toBe(true);
    });

    it("should flag bullet count exceeding limit", () => {
      const bullets = [
        { id: "b1", items: Array(10).fill({ text: "Item", level: 1 }) }
      ];
      const result = validateBulletCount(bullets, 6);
      expect(result.valid).toBe(false);
    });

    it("should handle multiple bullet groups", () => {
      const bullets = [
        { id: "b1", items: [{ text: "Item 1", level: 1 }, { text: "Item 2", level: 1 }] },
        { id: "b2", items: [{ text: "Item 3", level: 1 }, { text: "Item 4", level: 1 }, { text: "Item 5", level: 1 }] }
      ];
      const result = validateBulletCount(bullets, 6);
      expect(result.valid).toBe(true);
    });
  });

  describe("validateDataVizSeries", () => {
    it("should validate matching series and labels", () => {
      const dataViz = {
        id: "chart1",
        labels: ["Q1", "Q2", "Q3"],
        series: [
          { name: "Series 1", values: [10, 20, 30] },
          { name: "Series 2", values: [15, 25, 35] }
        ]
      };
      const result = validateDataVizSeries(dataViz);
      expect(result.valid).toBe(true);
    });

    it("should flag mismatched series and labels", () => {
      const dataViz = {
        id: "chart1",
        labels: ["Q1", "Q2", "Q3"],
        series: [
          { name: "Series 1", values: [10, 20] } // Only 2 values, 3 labels
        ]
      };
      const result = validateDataVizSeries(dataViz);
      expect(result.valid).toBe(false);
    });

    it("should handle empty series", () => {
      const dataViz = {
        id: "chart1",
        labels: ["Q1", "Q2"],
        series: []
      };
      const result = validateDataVizSeries(dataViz);
      expect(result.valid).toBe(false);
    });
  });

  describe("fitText", () => {
    it("should fit text within width", () => {
      const result = fitText("Hello World", 100, 16, "Arial");
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
    });

    it("should handle very narrow width", () => {
      const result = fitText("Hello", 20, 16, "Arial");
      expect(result.text).toBeDefined();
    });
  });

  describe("calculateTextHeight", () => {
    it("should calculate text height", () => {
      const height = calculateTextHeight("Hello World", 200, 16, "Arial");
      expect(height).toBeGreaterThan(0);
    });

    it("should increase height with more text", () => {
      const height1 = calculateTextHeight("Hello", 200, 16, "Arial");
      const height2 = calculateTextHeight("Hello World Hello World", 200, 16, "Arial");
      expect(height2).toBeGreaterThanOrEqual(height1);
    });
  });
});

