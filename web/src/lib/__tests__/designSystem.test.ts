/**
 * Design System Tests
 * Comprehensive tests for design system libraries
 */

import { describe, it, expect } from "vitest";
import { PROFESSIONAL_PALETTES, calculateContrastRatio, validatePaletteContrast } from "../colorPalettes";
import { TYPOGRAPHY_PAIRS, validateTypographyPair } from "../typographyPairs";
import { LAYOUT_PATTERNS, validateLayoutPattern, calculateWhitespacePercentage } from "../layoutPatterns";
import { validateDesignQuality } from "../designQuality";

describe("Color Palettes", () => {
  it("should have at least 15 professional palettes", () => {
    const palettes = Object.keys(PROFESSIONAL_PALETTES);
    expect(palettes.length).toBeGreaterThanOrEqual(15);
  });

  it("should have valid hex colors in all palettes", () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;

    Object.values(PROFESSIONAL_PALETTES).forEach(palette => {
      expect(hexPattern.test(palette.primary)).toBe(true);
      expect(hexPattern.test(palette.accent)).toBe(true);
      palette.neutral.forEach(color => {
        expect(hexPattern.test(color)).toBe(true);
      });
    });
  });

  it("should calculate contrast ratio correctly", () => {
    const white = "#FFFFFF";
    const black = "#000000";
    const ratio = calculateContrastRatio(white, black);

    expect(ratio).toBeGreaterThan(20); // Should be 21:1
  });

  it("should validate palette contrast", () => {
    const palette = PROFESSIONAL_PALETTES.corporate;
    const isValid = validatePaletteContrast(palette);

    expect(isValid).toBe(true);
  });

  it("should have WCAG AA compliant contrast ratios", () => {
    Object.values(PROFESSIONAL_PALETTES).forEach(palette => {
      const ratio = calculateContrastRatio(palette.neutral[0], palette.neutral[6]);
      expect(ratio).toBeGreaterThanOrEqual(4.5); // WCAG AA minimum
    });
  });
});

describe("Typography Pairs", () => {
  it("should have at least 12 typography pairs", () => {
    const pairs = Object.keys(TYPOGRAPHY_PAIRS);
    expect(pairs.length).toBeGreaterThanOrEqual(12);
  });

  it("should have valid font specifications", () => {
    Object.values(TYPOGRAPHY_PAIRS).forEach(pair => {
      expect(pair.primary).toBeTruthy();
      expect(pair.secondary).toBeTruthy();
      expect(pair.sizes.title).toBeGreaterThan(0);
      expect(pair.sizes.body).toBeGreaterThan(0);
      expect(pair.sizes.title).toBeGreaterThan(pair.sizes.body);
    });
  });

  it("should validate typography pairs", () => {
    Object.values(TYPOGRAPHY_PAIRS).forEach(pair => {
      const isValid = validateTypographyPair(pair);
      expect(isValid).toBe(true);
    });
  });

  it("should have proper size hierarchy", () => {
    Object.values(TYPOGRAPHY_PAIRS).forEach(pair => {
      expect(pair.sizes.title).toBeGreaterThan(pair.sizes.subtitle);
      expect(pair.sizes.subtitle).toBeGreaterThan(pair.sizes.body);
      expect(pair.sizes.body).toBeGreaterThan(pair.sizes.caption);
    });
  });

  it("should have valid line heights", () => {
    Object.values(TYPOGRAPHY_PAIRS).forEach(pair => {
      Object.values(pair.lineHeights).forEach(lineHeight => {
        expect(lineHeight).toBeGreaterThanOrEqual(1.2);
        expect(lineHeight).toBeLessThanOrEqual(2);
      });
    });
  });
});

describe("Layout Patterns", () => {
  it("should have 6 layout patterns", () => {
    const patterns = Object.keys(LAYOUT_PATTERNS);
    expect(patterns.length).toBe(6);
  });

  it("should have valid pattern names", () => {
    const validNames = ["hero", "split", "asymmetric", "grid", "minimal", "data-focused"];
    const patterns = Object.keys(LAYOUT_PATTERNS);

    patterns.forEach(name => {
      expect(validNames).toContain(name);
    });
  });

  it("should validate all layout patterns", () => {
    Object.values(LAYOUT_PATTERNS).forEach(pattern => {
      const isValid = validateLayoutPattern(pattern);
      expect(isValid).toBe(true);
    });
  });

  it("should have regions within slide bounds", () => {
    const SLIDE_WIDTH = 10;
    const SLIDE_HEIGHT = 7.5;

    Object.values(LAYOUT_PATTERNS).forEach(pattern => {
      Object.values(pattern.regions).forEach(region => {
        expect(region.x).toBeGreaterThanOrEqual(0);
        expect(region.y).toBeGreaterThanOrEqual(0);
        expect(region.x + region.w).toBeLessThanOrEqual(SLIDE_WIDTH);
        expect(region.y + region.h).toBeLessThanOrEqual(SLIDE_HEIGHT);
      });
    });
  });

  it("should calculate white space percentage", () => {
    Object.values(LAYOUT_PATTERNS).forEach(pattern => {
      const whitespace = calculateWhitespacePercentage(pattern);
      expect(whitespace).toBeGreaterThan(0);
      expect(whitespace).toBeLessThan(100);
    });
  });

  it("should have appropriate white space for pattern type", () => {
    const minimalPattern = LAYOUT_PATTERNS.minimal;
    const dataFocusedPattern = LAYOUT_PATTERNS["data-focused"];

    const minimalWhitespace = calculateWhitespacePercentage(minimalPattern);
    const dataWhitespace = calculateWhitespacePercentage(dataFocusedPattern);

    // Minimal should have more white space than data-focused
    expect(minimalWhitespace).toBeGreaterThan(dataWhitespace);
  });
});

describe("Design Quality Validation", () => {
  it("should validate design quality", () => {
    const mockSpec = {
      design: {
        pattern: "split",
        whitespace: { strategy: "balanced", breathingRoom: 28 },
        typography: {
          hierarchy: {
            title: { size: 32, weight: 700, lineHeight: 1.2 },
            body: { size: 16, weight: 400, lineHeight: 1.5 }
          }
        }
      },
      styleTokens: {
        palette: {
          primary: "#1E40AF",
          accent: "#10B981",
          neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"]
        },
        typography: {
          sizes: { step_0: 16, step_3: 32 },
          lineHeights: { standard: 1.5 }
        }
      }
    } as any;

    const score = validateDesignQuality(mockSpec);
    expect(score.overall).toBeGreaterThan(0);
    expect(score.overall).toBeLessThanOrEqual(100);
  });

  it("should identify design issues", () => {
    const mockSpec = {
      design: {
        pattern: "split",
        whitespace: { strategy: "compact", breathingRoom: 10 },
        typography: {
          hierarchy: {
            title: { size: 14, weight: 400, lineHeight: 1 },
            body: { size: 12, weight: 400, lineHeight: 1 }
          }
        }
      },
      styleTokens: {
        palette: {
          primary: "#FFFFFF",
          accent: "#FFFFFF",
          neutral: ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]
        },
        typography: {
          sizes: { step_0: 12, step_3: 14 },
          lineHeights: { standard: 1 }
        }
      }
    } as any;

    const score = validateDesignQuality(mockSpec);
    expect(score.issues.length).toBeGreaterThan(0);
  });
});

describe("Design System Integration", () => {
  it("should have complementary palettes and typography", () => {
    Object.values(PROFESSIONAL_PALETTES).forEach(palette => {
      expect(palette.primary).toBeTruthy();
      expect(palette.accent).toBeTruthy();
      expect(palette.neutral.length).toBeGreaterThanOrEqual(5);
    });

    Object.values(TYPOGRAPHY_PAIRS).forEach(pair => {
      expect(pair.primary).toBeTruthy();
      expect(pair.secondary).toBeTruthy();
    });
  });

  it("should support all design patterns", () => {
    const patterns = Object.keys(LAYOUT_PATTERNS);
    expect(patterns).toContain("hero");
    expect(patterns).toContain("split");
    expect(patterns).toContain("asymmetric");
    expect(patterns).toContain("grid");
    expect(patterns).toContain("minimal");
    expect(patterns).toContain("data-focused");
  });
});

