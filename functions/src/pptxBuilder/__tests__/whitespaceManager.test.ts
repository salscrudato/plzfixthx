import { describe, it, expect } from "vitest";
import {
  getSpacing,
  createUniformPadding,
  createUniformMargin,
  createCustomPadding,
  createCustomMargin,
  calculateContentWidth,
  calculateContentHeight,
  getRecommendedLineHeight,
  getRecommendedParagraphSpacing,
  calculateVerticalRhythm,
  getBreathingRoomPercentage,
  validateBreathingRoom,
  getContentMargin,
  getContainerPadding,
  calculateGridGap,
  calculateColumnWidth,
  getRecommendedSectionSpacing,
  getOptimalSlideMargins,
  getTextBoxPadding,
  getListItemSpacing,
  getElementSpacing,
  validateLayoutSpacing,
  SPACING_SCALE
} from "../whitespaceManager";

describe("Whitespace Manager", () => {
  describe("getSpacing", () => {
    it("should return correct spacing values", () => {
      expect(getSpacing("xs")).toBe(0.25);
      expect(getSpacing("sm")).toBe(0.5);
      expect(getSpacing("md")).toBe(0.75);
      expect(getSpacing("lg")).toBe(1);
      expect(getSpacing("xl")).toBe(1.5);
      expect(getSpacing("xxl")).toBe(2);
    });
  });

  describe("createUniformPadding", () => {
    it("should create uniform padding", () => {
      const padding = createUniformPadding("md");
      expect(padding.top).toBe(0.75);
      expect(padding.right).toBe(0.75);
      expect(padding.bottom).toBe(0.75);
      expect(padding.left).toBe(0.75);
    });
  });

  describe("createUniformMargin", () => {
    it("should create uniform margin", () => {
      const margin = createUniformMargin("lg");
      expect(margin.top).toBe(1);
      expect(margin.right).toBe(1);
      expect(margin.bottom).toBe(1);
      expect(margin.left).toBe(1);
    });
  });

  describe("createCustomPadding", () => {
    it("should create custom padding", () => {
      const padding = createCustomPadding(0.5, 1, 0.5, 1);
      expect(padding.top).toBe(0.5);
      expect(padding.right).toBe(1);
      expect(padding.bottom).toBe(0.5);
      expect(padding.left).toBe(1);
    });
  });

  describe("createCustomMargin", () => {
    it("should create custom margin", () => {
      const margin = createCustomMargin(0.25, 0.5, 0.25, 0.5);
      expect(margin.top).toBe(0.25);
      expect(margin.right).toBe(0.5);
      expect(margin.bottom).toBe(0.25);
      expect(margin.left).toBe(0.5);
    });
  });

  describe("calculateContentWidth", () => {
    it("should calculate content width with padding", () => {
      const padding = createCustomPadding(0, 0.5, 0, 0.5);
      const width = calculateContentWidth(10, padding);
      expect(width).toBe(9);
    });

    it("should handle zero padding", () => {
      const padding = createCustomPadding(0, 0, 0, 0);
      const width = calculateContentWidth(10, padding);
      expect(width).toBe(10);
    });
  });

  describe("calculateContentHeight", () => {
    it("should calculate content height with padding", () => {
      const padding = createCustomPadding(0.5, 0, 0.5, 0);
      const height = calculateContentHeight(7.5, padding);
      expect(height).toBe(6.5);
    });
  });

  describe("getRecommendedLineHeight", () => {
    it("should return 1.2 for large headings", () => {
      expect(getRecommendedLineHeight(44)).toBe(1.2);
    });

    it("should return 1.3 for subheadings", () => {
      expect(getRecommendedLineHeight(24)).toBe(1.3);
    });

    it("should return 1.5 for body text", () => {
      expect(getRecommendedLineHeight(16)).toBe(1.5);
    });
  });

  describe("getRecommendedParagraphSpacing", () => {
    it("should calculate paragraph spacing", () => {
      const spacing = getRecommendedParagraphSpacing(16);
      expect(spacing).toBeGreaterThan(0);
    });
  });

  describe("calculateVerticalRhythm", () => {
    it("should calculate vertical rhythm", () => {
      const rhythm = calculateVerticalRhythm(0.5, 2);
      expect(rhythm).toBe(1);
    });

    it("should use default multiplier", () => {
      const rhythm = calculateVerticalRhythm(0.5);
      expect(rhythm).toBe(0.5);
    });
  });

  describe("getBreathingRoomPercentage", () => {
    it("should calculate breathing room percentage", () => {
      const percentage = getBreathingRoomPercentage(50, 100);
      expect(percentage).toBe(50);
    });

    it("should handle full content", () => {
      const percentage = getBreathingRoomPercentage(100, 100);
      expect(percentage).toBe(0);
    });

    it("should handle empty content", () => {
      const percentage = getBreathingRoomPercentage(0, 100);
      expect(percentage).toBe(100);
    });
  });

  describe("validateBreathingRoom", () => {
    it("should validate optimal breathing room", () => {
      const result = validateBreathingRoom(60, 100);
      expect(result.valid).toBe(true);
      expect(result.percentage).toBe(40);
    });

    it("should reject too dense content", () => {
      const result = validateBreathingRoom(90, 100);
      expect(result.valid).toBe(false);
      expect(result.percentage).toBe(10);
    });

    it("should reject too much whitespace", () => {
      const result = validateBreathingRoom(30, 100);
      expect(result.valid).toBe(false);
      expect(result.percentage).toBe(70);
    });
  });

  describe("getContentMargin", () => {
    it("should return margin for title", () => {
      const margin = getContentMargin("title");
      expect(margin.bottom).toBe(0.5);
    });

    it("should return margin for body", () => {
      const margin = getContentMargin("body");
      expect(margin.top).toBe(0.25);
    });

    it("should return margin for chart", () => {
      const margin = getContentMargin("chart");
      expect(margin.top).toBe(0.5);
    });

    it("should return margin for image", () => {
      const margin = getContentMargin("image");
      expect(margin.top).toBe(0.5);
    });
  });

  describe("getContainerPadding", () => {
    it("should return padding for card", () => {
      const padding = getContainerPadding("card");
      expect(padding.top).toBe(0.5);
    });

    it("should return padding for box", () => {
      const padding = getContainerPadding("box");
      expect(padding.top).toBe(0.75);
    });

    it("should return padding for section", () => {
      const padding = getContainerPadding("section");
      expect(padding.top).toBe(1);
    });

    it("should return padding for highlight", () => {
      const padding = getContainerPadding("highlight");
      expect(padding.top).toBe(0.5);
    });
  });

  describe("calculateGridGap", () => {
    it("should return 0.5 for 2 columns", () => {
      expect(calculateGridGap(2, 10)).toBe(0.5);
    });

    it("should return 0.4 for 3 columns", () => {
      expect(calculateGridGap(3, 10)).toBe(0.4);
    });

    it("should return 0.25 for 4+ columns", () => {
      expect(calculateGridGap(4, 10)).toBe(0.25);
    });
  });

  describe("calculateColumnWidth", () => {
    it("should calculate column width", () => {
      const width = calculateColumnWidth(10, 2, 0.5);
      expect(width).toBe(4.75);
    });

    it("should handle multiple columns", () => {
      const width = calculateColumnWidth(10, 3, 0.4);
      expect(width).toBeCloseTo(3.067, 2);
    });
  });

  describe("getRecommendedSectionSpacing", () => {
    it("should return spacing for header", () => {
      expect(getRecommendedSectionSpacing("header")).toBe(0.5);
    });

    it("should return spacing for body", () => {
      expect(getRecommendedSectionSpacing("body")).toBe(0.75);
    });

    it("should return spacing for footer", () => {
      expect(getRecommendedSectionSpacing("footer")).toBe(0.5);
    });
  });

  describe("getOptimalSlideMargins", () => {
    it("should calculate optimal margins", () => {
      const margins = getOptimalSlideMargins(10, 7.5);
      expect(margins.top).toBeCloseTo(0.5);
      expect(margins.left).toBeCloseTo(0.5);
    });
  });

  describe("getTextBoxPadding", () => {
    it("should return padding for short text", () => {
      const padding = getTextBoxPadding(100);
      expect(padding.top).toBe(0.25);
    });

    it("should return padding for medium text", () => {
      const padding = getTextBoxPadding(300);
      expect(padding.top).toBe(0.5);
    });

    it("should return padding for long text", () => {
      const padding = getTextBoxPadding(600);
      expect(padding.top).toBe(0.75);
    });
  });

  describe("getListItemSpacing", () => {
    it("should return spacing for 3 items", () => {
      expect(getListItemSpacing(3)).toBe(0.4);
    });

    it("should return spacing for 5 items", () => {
      expect(getListItemSpacing(5)).toBe(0.3);
    });

    it("should return spacing for 6+ items", () => {
      expect(getListItemSpacing(6)).toBe(0.2);
    });
  });

  describe("getElementSpacing", () => {
    it("should return spacing for heading-body", () => {
      expect(getElementSpacing("heading-body")).toBe(0.3);
    });

    it("should return spacing for body-body", () => {
      expect(getElementSpacing("body-body")).toBe(0.2);
    });

    it("should return spacing for section-section", () => {
      expect(getElementSpacing("section-section")).toBe(0.75);
    });
  });

  describe("validateLayoutSpacing", () => {
    it("should validate non-overlapping elements", () => {
      const elements = [
        { y: 0, h: 1 },
        { y: 1.5, h: 1 },
        { y: 3, h: 1 }
      ];
      const result = validateLayoutSpacing(elements, 7.5);
      expect(result.valid).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it("should detect overlapping elements", () => {
      const elements = [
        { y: 0, h: 2 },
        { y: 1, h: 1 }
      ];
      const result = validateLayoutSpacing(elements, 7.5);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should detect content exceeding slide height", () => {
      const elements = [
        { y: 0, h: 5 },
        { y: 5, h: 3 }
      ];
      const result = validateLayoutSpacing(elements, 7.5);
      expect(result.valid).toBe(false);
    });
  });

  describe("SPACING_SCALE", () => {
    it("should have all spacing values", () => {
      expect(SPACING_SCALE.xs).toBe(0.25);
      expect(SPACING_SCALE.sm).toBe(0.5);
      expect(SPACING_SCALE.md).toBe(0.75);
      expect(SPACING_SCALE.lg).toBe(1);
      expect(SPACING_SCALE.xl).toBe(1.5);
      expect(SPACING_SCALE.xxl).toBe(2);
    });
  });
});
