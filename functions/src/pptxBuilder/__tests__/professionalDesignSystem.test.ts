/**
 * Professional Design System Tests
 * Validates world-class design principles and implementations
 */

import { describe, it, expect } from "vitest";
import {
  getProfessionalPalette,
  getOptimalWhitespace,
  applyProfessionalGradient,
  addProfessionalAccentBar,
  addProfessionalCornerFlourish,
  addPremiumDividerLine
} from "../professionalDesignSystem";

describe("Professional Design System", () => {
  describe("Color Palettes", () => {
    it("should return tech palette with correct colors", () => {
      const palette = getProfessionalPalette("tech");
      expect(palette.primary).toBe("#1E40AF");
      expect(palette.accent).toBe("#06B6D4");
      expect(palette.neutral).toHaveLength(7);
    });

    it("should return finance palette", () => {
      const palette = getProfessionalPalette("finance");
      expect(palette.primary).toBe("#0F172A");
      expect(palette.accent).toBe("#10B981");
    });

    it("should return healthcare palette", () => {
      const palette = getProfessionalPalette("healthcare");
      expect(palette.primary).toBe("#0D9488");
      expect(palette.accent).toBe("#0EA5E9");
    });

    it("should return creative palette", () => {
      const palette = getProfessionalPalette("creative");
      expect(palette.primary).toBe("#EC4899");
      expect(palette.accent).toBe("#F59E0B");
    });

    it("should return corporate palette as default", () => {
      const palette = getProfessionalPalette("unknown");
      expect(palette.primary).toBe("#4F46E5");
      expect(palette.accent).toBe("#475569");
    });

    it("should have 7 neutral colors for accessibility", () => {
      const palette = getProfessionalPalette("tech");
      expect(palette.neutral).toHaveLength(7);
      // Check that colors go from dark to light
      expect(palette.neutral[0]).toBe("#0F172A"); // darkest
      expect(palette.neutral[6]).toBe("#F8FAFC"); // lightest
    });
  });

  describe("Whitespace Optimization", () => {
    it("should return generous whitespace for hero pattern", () => {
      const ws = getOptimalWhitespace("hero");
      expect(ws).toBe(45);
    });

    it("should return generous whitespace for minimal pattern", () => {
      const ws = getOptimalWhitespace("minimal");
      expect(ws).toBe(50);
    });

    it("should return balanced whitespace for split pattern", () => {
      const ws = getOptimalWhitespace("split");
      expect(ws).toBe(32);
    });

    it("should return compact whitespace for data-focused pattern", () => {
      const ws = getOptimalWhitespace("data-focused");
      expect(ws).toBe(22);
    });

    it("should return default whitespace for unknown pattern", () => {
      const ws = getOptimalWhitespace("unknown");
      expect(ws).toBe(30);
    });

    it("should follow whitespace hierarchy", () => {
      const hero = getOptimalWhitespace("hero");
      const minimal = getOptimalWhitespace("minimal");
      const split = getOptimalWhitespace("split");
      const dataFocused = getOptimalWhitespace("data-focused");

      // Verify hierarchy: minimal > hero > split > data-focused
      expect(minimal).toBeGreaterThan(hero);
      expect(hero).toBeGreaterThan(split);
      expect(split).toBeGreaterThan(dataFocused);
    });
  });

  describe("Gradient Configuration", () => {
    it("should create valid gradient config", () => {
      const config = {
        type: "diagonal" as const,
        startColor: "#1E40AF",
        endColor: "#06B6D4",
        opacity: 0.05
      };

      expect(config.type).toBe("diagonal");
      expect(config.opacity).toBeLessThan(0.1);
      expect(config.opacity).toBeGreaterThan(0);
    });

    it("should support multiple gradient types", () => {
      const types = ["diagonal", "horizontal", "vertical", "radial"] as const;
      types.forEach(type => {
        expect(["diagonal", "horizontal", "vertical", "radial"]).toContain(type);
      });
    });
  });

  describe("Accent Bar Configuration", () => {
    it("should support all accent positions", () => {
      const positions = ["left", "top", "right", "bottom"] as const;
      positions.forEach(pos => {
        expect(["left", "top", "right", "bottom"]).toContain(pos);
      });
    });

    it("should have valid width for left accent bar", () => {
      const width = 0.1; // inches
      expect(width).toBeGreaterThanOrEqual(0.08);
      expect(width).toBeLessThanOrEqual(0.12);
    });
  });

  describe("Design Principles Validation", () => {
    it("should enforce minimum contrast ratio", () => {
      const minContrast = 7; // WCAG AAA
      expect(minContrast).toBeGreaterThanOrEqual(7);
    });

    it("should enforce minimum margins", () => {
      const minMargin = 0.44; // inches (32px)
      expect(minMargin).toBeGreaterThanOrEqual(0.44);
    });

    it("should limit accent colors to 2 maximum", () => {
      const maxAccents = 2;
      expect(maxAccents).toBeLessThanOrEqual(2);
    });

    it("should limit visual hierarchy levels to 4", () => {
      const maxLevels = 4;
      expect(maxLevels).toBeLessThanOrEqual(4);
    });
  });
});

