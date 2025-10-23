/**
 * Tests for Design Accents
 * Validates that all design accent functions work correctly
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addGradientOverlay,
  addCornerFlourish,
  addLineAccent,
  addDotPattern,
  addWaveAccent,
  addContentShadow,
  addFrameAccent,
  addConnectorLine
} from "../designAccents";

describe("Design Accents", () => {
  let mockSlide: any;

  beforeEach(() => {
    mockSlide = {
      addShape: vi.fn()
    };
  });

  describe("addGradientOverlay", () => {
    it("should add gradient overlay with default parameters", () => {
      addGradientOverlay(mockSlide, "#6366F1", "#EC4899");
      expect(mockSlide.addShape).toHaveBeenCalled();
      expect(mockSlide.addShape.mock.calls.length).toBeGreaterThan(0);
    });

    it("should add gradient overlay with custom opacity", () => {
      addGradientOverlay(mockSlide, "#6366F1", "#EC4899", 0.1);
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add gradient overlay with different directions", () => {
      addGradientOverlay(mockSlide, "#6366F1", "#EC4899", 0.05, "top-to-bottom");
      addGradientOverlay(mockSlide, "#6366F1", "#EC4899", 0.05, "left-to-right");
      addGradientOverlay(mockSlide, "#6366F1", "#EC4899", 0.05, "diagonal");
      expect(mockSlide.addShape.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe("addCornerFlourish", () => {
    it("should add corner flourish to top-left", () => {
      addCornerFlourish(mockSlide, "top-left", "#6366F1");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add corner flourish to top-right", () => {
      addCornerFlourish(mockSlide, "top-right", "#EC4899");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add corner flourish to bottom-left", () => {
      addCornerFlourish(mockSlide, "bottom-left", "#6366F1");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add corner flourish to bottom-right", () => {
      addCornerFlourish(mockSlide, "bottom-right", "#EC4899");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add corner flourish with custom size", () => {
      addCornerFlourish(mockSlide, "top-right", "#6366F1", 0.5);
      expect(mockSlide.addShape).toHaveBeenCalled();
    });
  });

  describe("addLineAccent", () => {
    it("should add line accent to top", () => {
      addLineAccent(mockSlide, "top", "#6366F1");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add line accent to bottom", () => {
      addLineAccent(mockSlide, "bottom", "#EC4899");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add line accent to left", () => {
      addLineAccent(mockSlide, "left", "#6366F1");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add line accent to right", () => {
      addLineAccent(mockSlide, "right", "#EC4899");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add line accent with custom thickness", () => {
      addLineAccent(mockSlide, "top", "#6366F1", 0.12);
      expect(mockSlide.addShape).toHaveBeenCalled();
    });
  });

  describe("addDotPattern", () => {
    it("should add sparse dot pattern", () => {
      addDotPattern(mockSlide, "#6366F1", "sparse");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add moderate dot pattern", () => {
      addDotPattern(mockSlide, "#EC4899", "moderate");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add dense dot pattern", () => {
      addDotPattern(mockSlide, "#6366F1", "dense");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add dot pattern with custom opacity", () => {
      addDotPattern(mockSlide, "#6366F1", "sparse", 0.2);
      expect(mockSlide.addShape).toHaveBeenCalled();
    });
  });

  describe("addWaveAccent", () => {
    it("should add wave accent with default height", () => {
      addWaveAccent(mockSlide, "#6366F1");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add wave accent with custom height", () => {
      addWaveAccent(mockSlide, "#EC4899", 0.8);
      expect(mockSlide.addShape).toHaveBeenCalled();
    });
  });

  describe("addContentShadow", () => {
    it("should add content shadow with default parameters", () => {
      addContentShadow(mockSlide, 0.5, 0.5, 2, 1);
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add content shadow with custom color", () => {
      addContentShadow(mockSlide, 0.5, 0.5, 2, 1, "FF0000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add content shadow with custom blur", () => {
      addContentShadow(mockSlide, 0.5, 0.5, 2, 1, "000000", 12);
      expect(mockSlide.addShape).toHaveBeenCalled();
    });
  });

  describe("addFrameAccent", () => {
    it("should add frame accent", () => {
      addFrameAccent(mockSlide, 0.5, 0.5, 2, 1, "#6366F1");
      expect(mockSlide.addShape).toHaveBeenCalled();
      // Should create 4 borders (top, right, bottom, left)
      expect(mockSlide.addShape.mock.calls.length).toBe(4);
    });

    it("should add frame accent with custom thickness", () => {
      addFrameAccent(mockSlide, 0.5, 0.5, 2, 1, "#EC4899", 0.08);
      expect(mockSlide.addShape).toHaveBeenCalled();
    });
  });

  describe("addConnectorLine", () => {
    it("should add connector line between two points", () => {
      addConnectorLine(mockSlide, 0, 0, 2, 2, "#6366F1");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add connector line with custom thickness", () => {
      addConnectorLine(mockSlide, 0, 0, 2, 2, "#EC4899", 0.08);
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add horizontal connector line", () => {
      addConnectorLine(mockSlide, 0, 1, 5, 1, "#6366F1");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add vertical connector line", () => {
      addConnectorLine(mockSlide, 2, 0, 2, 5, "#EC4899");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });
  });
});

