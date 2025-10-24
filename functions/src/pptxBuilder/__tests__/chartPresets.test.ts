import { describe, it, expect } from "vitest";
import {
  EXECUTIVE_PRESET,
  MARKETING_PRESET,
  EDUCATION_PRESET,
  MINIMAL_PRESET,
  BOLD_PRESET,
  getChartPreset,
  applyChartPreset,
  getRecommendedChartPreset,
  validateChartAgainstPreset
} from "../chartPresets";

describe("chartPresets", () => {
  describe("preset definitions", () => {
    it("should have executive preset with correct properties", () => {
      expect(EXECUTIVE_PRESET.showLegend).toBe(true);
      expect(EXECUTIVE_PRESET.showDataLabels).toBe(true);
      expect(EXECUTIVE_PRESET.colors).toBeDefined();
      expect(EXECUTIVE_PRESET.colors?.length).toBeGreaterThan(0);
    });

    it("should have marketing preset with vibrant colors", () => {
      expect(MARKETING_PRESET.colors).toBeDefined();
      expect(MARKETING_PRESET.colors?.length).toBeGreaterThan(3);
    });

    it("should have education preset with data table", () => {
      expect(EDUCATION_PRESET.showDataTable).toBe(true);
      expect(EDUCATION_PRESET.showTrendline).toBe(true);
    });

    it("should have minimal preset with minimal display", () => {
      expect(MINIMAL_PRESET.showDataLabels).toBe(false);
      expect(MINIMAL_PRESET.colors?.length).toBeLessThanOrEqual(3);
    });

    it("should have bold preset with high contrast", () => {
      expect(BOLD_PRESET.showDataLabels).toBe(true);
      expect(BOLD_PRESET.colors?.length).toBeGreaterThan(5);
    });
  });

  describe("getChartPreset", () => {
    it("should return executive preset", () => {
      const preset = getChartPreset("executive");
      expect(preset).toEqual(EXECUTIVE_PRESET);
    });

    it("should return marketing preset", () => {
      const preset = getChartPreset("marketing");
      expect(preset).toEqual(MARKETING_PRESET);
    });

    it("should return education preset", () => {
      const preset = getChartPreset("education");
      expect(preset).toEqual(EDUCATION_PRESET);
    });

    it("should return minimal preset", () => {
      const preset = getChartPreset("minimal");
      expect(preset).toEqual(MINIMAL_PRESET);
    });

    it("should return bold preset", () => {
      const preset = getChartPreset("bold");
      expect(preset).toEqual(BOLD_PRESET);
    });

    it("should default to executive for unknown preset", () => {
      const preset = getChartPreset("executive");
      expect(preset).toEqual(EXECUTIVE_PRESET);
    });
  });

  describe("applyChartPreset", () => {
    it("should apply preset to chart config", () => {
      const config = {
        chartType: "bar" as const,
        labels: ["Q1", "Q2"],
        series: [{ name: "Sales", values: [100, 200] }],
        showLegend: false,
        showDataLabels: false,
        colors: ["#000000"]
      };

      const result = applyChartPreset(config, "executive");
      expect(result.showLegend).toBe(true);
      expect(result.showDataLabels).toBe(true);
      expect(result.labels).toEqual(["Q1", "Q2"]);
      expect(result.series).toEqual(config.series);
    });

    it("should preserve original labels and series", () => {
      const config = {
        chartType: "line" as const,
        labels: ["A", "B", "C"],
        series: [{ name: "Data", values: [1, 2, 3] }],
        showLegend: false,
        showDataLabels: false,
        colors: []
      };

      const result = applyChartPreset(config, "marketing");
      expect(result.labels).toEqual(config.labels);
      expect(result.series).toEqual(config.series);
    });
  });

  describe("getRecommendedChartPreset", () => {
    it("should recommend executive for executive content", () => {
      const preset = getRecommendedChartPreset("executive");
      expect(preset).toBe("executive");
    });

    it("should recommend marketing for marketing content", () => {
      const preset = getRecommendedChartPreset("marketing");
      expect(preset).toBe("marketing");
    });

    it("should recommend education for education content", () => {
      const preset = getRecommendedChartPreset("education");
      expect(preset).toBe("education");
    });

    it("should recommend minimal for report content", () => {
      const preset = getRecommendedChartPreset("report");
      expect(preset).toBe("minimal");
    });

    it("should recommend bold for announcement content", () => {
      const preset = getRecommendedChartPreset("announcement");
      expect(preset).toBe("bold");
    });
  });

  describe("validateChartAgainstPreset", () => {
    it("should validate correct chart config", () => {
      const config = {
        chartType: "bar" as const,
        labels: ["Q1", "Q2", "Q3"],
        series: [
          { name: "Series 1", values: [10, 20, 30] },
          { name: "Series 2", values: [15, 25, 35] }
        ],
        showLegend: true,
        showDataLabels: true,
        colors: []
      };

      const result = validateChartAgainstPreset(config, "executive");
      expect(result.valid).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it("should flag missing labels", () => {
      const config = {
        chartType: "bar" as const,
        labels: [],
        series: [{ name: "Series 1", values: [10, 20] }],
        showLegend: true,
        showDataLabels: true,
        colors: []
      };

      const result = validateChartAgainstPreset(config, "executive");
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.includes("labels"))).toBe(true);
    });

    it("should flag mismatched series values", () => {
      const config = {
        chartType: "bar" as const,
        labels: ["Q1", "Q2", "Q3"],
        series: [
          { name: "Series 1", values: [10, 20] } // Only 2 values
        ],
        showLegend: true,
        showDataLabels: true,
        colors: []
      };

      const result = validateChartAgainstPreset(config, "executive");
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should recommend data table for education preset", () => {
      const config = {
        chartType: "bar" as const,
        labels: ["Q1", "Q2"],
        series: [{ name: "Series 1", values: [10, 20] }],
        showLegend: true,
        showDataLabels: true,
        showDataTable: false,
        colors: []
      };

      const result = validateChartAgainstPreset(config, "education");
      expect(result.issues.some(i => i.includes("data table"))).toBe(true);
    });
  });
});

