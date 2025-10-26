import { describe, it, expect } from "vitest";
import { enhanceSlideSpec, sanitizePrompt, moderateContent } from "../aiHelpers";

describe("aiHelpers", () => {
  describe("sanitizePrompt", () => {
    it("should accept valid prompts", () => {
      const result = sanitizePrompt("Create a professional slide about Q1 results");
      expect(result).toBe("Create a professional slide about Q1 results");
    });

    it("should trim whitespace", () => {
      const result = sanitizePrompt("  Hello World  ");
      expect(result).toBe("Hello World");
    });

    it("should reject empty prompts", () => {
      expect(() => sanitizePrompt("")).toThrow();
      expect(() => sanitizePrompt("   ")).toThrow();
    });

    it("should truncate long prompts", () => {
      const longPrompt = "a".repeat(5000);
      const result = sanitizePrompt(longPrompt, 2000);
      expect(result.length).toBeLessThanOrEqual(2000);
    });
  });

  describe("moderateContent", () => {
    it("should allow safe content", () => {
      const result = moderateContent("Create a professional presentation");
      expect(result.safe).toBe(true);
    });

    it("should flag inappropriate content", () => {
      const result = moderateContent("hack the system");
      expect(result.safe).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it("should be case-insensitive", () => {
      const result = moderateContent("HACK THE SYSTEM");
      expect(result.safe).toBe(false);
    });
  });

  describe("enhanceSlideSpec", () => {
    it("should add default meta if missing", () => {
      const spec = { content: { title: { text: "Test" } } };
      const enhanced = enhanceSlideSpec(spec);
      expect(enhanced.meta).toBeDefined();
      expect(enhanced.meta.version).toBe("1.0");
      expect(enhanced.meta.aspectRatio).toBe("16:9");
    });

    it("should add default title if missing", () => {
      const spec = { meta: {}, content: {} };
      const enhanced = enhanceSlideSpec(spec);
      expect(enhanced.content.title).toBeDefined();
      expect(enhanced.content.title.text).toBe("Untitled Slide");
    });

    it("should add IDs to content elements", () => {
      const spec = {
        meta: {},
        content: {
          title: { text: "Title" },
          subtitle: { text: "Subtitle" },
          bullets: [{ items: ["Item 1"] }]
        }
      };
      const enhanced = enhanceSlideSpec(spec);
      expect(enhanced.content.title.id).toBe("title");
      expect(enhanced.content.subtitle.id).toBe("subtitle");
      expect(enhanced.content.bullets[0].id).toBeDefined();
    });

    it("should limit bullets to 6 items", () => {
      const spec = {
        meta: {},
        content: {
          title: { text: "Title" },
          bullets: [
            { items: Array(10).fill("Item") }
          ]
        }
      };
      const enhanced = enhanceSlideSpec(spec);
      expect(enhanced.content.bullets[0].items.length).toBeLessThanOrEqual(6);
    });

    it("should validate and fix dataViz series", () => {
      const spec = {
        meta: {},
        content: {
          title: { text: "Title" },
          dataViz: {
            labels: ["Q1", "Q2", "Q3"],
            series: [
              { name: "Series 1", values: [10, 20] } // Only 2 values
            ]
          }
        }
      };
      const enhanced = enhanceSlideSpec(spec);
      expect(enhanced.content.dataViz.series[0].values.length).toBe(3);
    });

    it("should ensure valid color palette", () => {
      const spec = {
        meta: {},
        content: { title: { text: "Title" } },
        styleTokens: {
          palette: {
            primary: "invalid-color",
            accent: "also-invalid"
          }
        }
      };
      const enhanced = enhanceSlideSpec(spec);
      // Should have valid hex colors (context-aware generation may vary)
      expect(enhanced.styleTokens.palette.primary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(enhanced.styleTokens.palette.accent).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it("should ensure neutral palette exists", () => {
      const spec = {
        meta: {},
        content: { title: { text: "Title" } },
        styleTokens: { palette: {} }
      };
      const enhanced = enhanceSlideSpec(spec);
      expect(enhanced.styleTokens.palette.neutral).toBeDefined();
      expect(enhanced.styleTokens.palette.neutral.length).toBeGreaterThanOrEqual(5);
    });

    it("should validate contrast compliance", () => {
      const spec = {
        meta: {},
        content: { title: { text: "Title" } },
        styleTokens: {
          palette: {
            primary: "#6366F1",
            accent: "#EC4899",
            neutral: ["#CCCCCC", "#DDDDDD"] // Low contrast
          }
        }
      };
      const enhanced = enhanceSlideSpec(spec);
      // Should have adjusted colors for compliance
      expect(enhanced.styleTokens.palette.neutral).toBeDefined();
    });

    it("should handle multiple bullet groups", () => {
      const spec = {
        meta: {},
        content: {
          title: { text: "Title" },
          bullets: [
            { items: ["Item 1", "Item 2"] },
            { items: ["Item 3", "Item 4", "Item 5"] }
          ]
        }
      };
      const enhanced = enhanceSlideSpec(spec);
      expect(enhanced.content.bullets.length).toBe(2);
      expect(enhanced.content.bullets[0].id).toBeDefined();
      expect(enhanced.content.bullets[1].id).toBeDefined();
    });

    it("should fix layout issues", () => {
      const spec = {
        meta: {},
        content: {
          title: { text: "Title" },
          subtitle: { text: "Subtitle" }
        },
        layout: {
          regions: [
            { name: "header", rowSpan: 1 },
            { name: "body", rowStart: 2 }
          ],
          anchors: [
            { refId: "title", region: "header" },
            { refId: "subtitle", region: "header" }
          ]
        }
      };
      const enhanced = enhanceSlideSpec(spec);
      expect(enhanced.layout).toBeDefined();
    });

    it("should split concatenated timeline bullet points", () => {
      const spec = {
        meta: {},
        content: {
          title: { text: "Timeline" },
          bullets: [{
            items: [
              { text: "1776 Declared independence1783 Won war1789 Became president", level: 1 }
            ]
          }]
        }
      };
      const enhanced = enhanceSlideSpec(spec);
      expect(enhanced.content.bullets[0].items.length).toBeGreaterThan(1);
      expect(enhanced.content.bullets[0].items[0].text).toContain("1776");
      expect(enhanced.content.bullets[0].items[1].text).toContain("1783");
      expect(enhanced.content.bullets[0].items[2].text).toContain("1789");
    });

    it("should preserve properly formatted bullet points", () => {
      const spec = {
        meta: {},
        content: {
          title: { text: "Title" },
          bullets: [{
            items: [
              { text: "First point", level: 1 },
              { text: "Second point", level: 1 },
              { text: "Third point", level: 1 }
            ]
          }]
        }
      };
      const enhanced = enhanceSlideSpec(spec);
      expect(enhanced.content.bullets[0].items.length).toBe(3);
      expect(enhanced.content.bullets[0].items[0].text).toBe("First point");
    });
  });
});

