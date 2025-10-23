import { describe, it, expect } from "vitest";
import {
  getAllTemplates,
  getTemplate,
  getTemplatesByUseCase,
  getTemplateLayout,
  getRecommendedTemplate,
  validateTemplate,
  createCustomTemplate,
  getTemplateStats,
  TITLE_SLIDE_TEMPLATE,
  CONTENT_SLIDE_TEMPLATE,
  TWO_COLUMN_TEMPLATE,
  THREE_COLUMN_TEMPLATE,
  DATA_VIZ_TEMPLATE,
  IMAGE_FOCUS_TEMPLATE,
  TIMELINE_TEMPLATE,
  CENTERED_FOCUS_TEMPLATE,
  SIDEBAR_TEMPLATE,
  STACKED_TEMPLATE,
  MINIMAL_TEMPLATE,
  FULL_BLEED_TEMPLATE
} from "../professionalTemplates";

describe("Professional Templates", () => {
  describe("getAllTemplates", () => {
    it("should return all templates", () => {
      const templates = getAllTemplates();
      expect(templates.length).toBe(12);
    });

    it("should include title slide template", () => {
      const templates = getAllTemplates();
      expect(templates).toContainEqual(TITLE_SLIDE_TEMPLATE);
    });

    it("should include content slide template", () => {
      const templates = getAllTemplates();
      expect(templates).toContainEqual(CONTENT_SLIDE_TEMPLATE);
    });
  });

  describe("getTemplate", () => {
    it("should get template by name", () => {
      const template = getTemplate("Title Slide");
      expect(template).toEqual(TITLE_SLIDE_TEMPLATE);
    });

    it("should be case insensitive", () => {
      const template = getTemplate("title slide");
      expect(template).toEqual(TITLE_SLIDE_TEMPLATE);
    });

    it("should return undefined for unknown template", () => {
      const template = getTemplate("Unknown Template");
      expect(template).toBeUndefined();
    });

    it("should get content slide template", () => {
      const template = getTemplate("Content Slide");
      expect(template).toEqual(CONTENT_SLIDE_TEMPLATE);
    });

    it("should get two column template", () => {
      const template = getTemplate("Two Column");
      expect(template).toEqual(TWO_COLUMN_TEMPLATE);
    });
  });

  describe("getTemplatesByUseCase", () => {
    it("should find templates by use case", () => {
      const templates = getTemplatesByUseCase("comparison");
      expect(templates.length).toBeGreaterThan(0);
      expect(templates).toContainEqual(TWO_COLUMN_TEMPLATE);
    });

    it("should be case insensitive", () => {
      const templates = getTemplatesByUseCase("COMPARISON");
      expect(templates.length).toBeGreaterThan(0);
    });

    it("should find chart templates", () => {
      const templates = getTemplatesByUseCase("chart");
      expect(templates.length).toBeGreaterThan(0);
    });

    it("should find chart templates", () => {
      const templates = getTemplatesByUseCase("charts");
      expect(templates.length).toBeGreaterThan(0);
    });
  });

  describe("getTemplateLayout", () => {
    it("should return professional layout", () => {
      const layout = getTemplateLayout("professional");
      expect(layout.title.fontSize).toBe(44);
      expect(layout.title.bold).toBe(true);
      expect(layout.body.fontSize).toBe(16);
    });

    it("should return modern layout", () => {
      const layout = getTemplateLayout("modern");
      expect(layout.title.fontSize).toBe(48);
      expect(layout.subtitle.bold).toBe(true);
    });

    it("should return minimal layout", () => {
      const layout = getTemplateLayout("minimal");
      expect(layout.title.fontSize).toBe(40);
      expect(layout.body.fontSize).toBe(14);
    });

    it("should return bold layout", () => {
      const layout = getTemplateLayout("bold");
      expect(layout.title.fontSize).toBe(52);
      expect(layout.title.color).toBe("#DC2626");
    });

    it("should default to professional layout", () => {
      const layout = getTemplateLayout("unknown");
      expect(layout.title.fontSize).toBe(44);
    });
  });

  describe("getRecommendedTemplate", () => {
    it("should recommend title slide for title content", () => {
      const template = getRecommendedTemplate("title");
      expect(template).toEqual(TITLE_SLIDE_TEMPLATE);
    });

    it("should recommend content slide for content", () => {
      const template = getRecommendedTemplate("content");
      expect(template).toEqual(CONTENT_SLIDE_TEMPLATE);
    });

    it("should recommend two column for comparison", () => {
      const template = getRecommendedTemplate("comparison");
      expect(template).toEqual(TWO_COLUMN_TEMPLATE);
    });

    it("should recommend data viz for data", () => {
      const template = getRecommendedTemplate("data");
      expect(template).toEqual(DATA_VIZ_TEMPLATE);
    });

    it("should recommend image focus for image", () => {
      const template = getRecommendedTemplate("image");
      expect(template).toEqual(IMAGE_FOCUS_TEMPLATE);
    });

    it("should recommend timeline for process", () => {
      const template = getRecommendedTemplate("process");
      expect(template).toEqual(TIMELINE_TEMPLATE);
    });
  });

  describe("validateTemplate", () => {
    it("should validate correct template", () => {
      const result = validateTemplate(TITLE_SLIDE_TEMPLATE);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should reject template without name", () => {
      const template = { ...TITLE_SLIDE_TEMPLATE, name: "" };
      const result = validateTemplate(template);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject template without pattern", () => {
      const template = { ...TITLE_SLIDE_TEMPLATE, pattern: "" };
      const result = validateTemplate(template);
      expect(result.valid).toBe(false);
    });

    it("should reject template without color scheme", () => {
      const template = { ...TITLE_SLIDE_TEMPLATE, colorScheme: "" };
      const result = validateTemplate(template);
      expect(result.valid).toBe(false);
    });

    it("should reject template without typography", () => {
      const template = { ...TITLE_SLIDE_TEMPLATE, typography: "" };
      const result = validateTemplate(template);
      expect(result.valid).toBe(false);
    });
  });

  describe("createCustomTemplate", () => {
    it("should create custom template", () => {
      const template = createCustomTemplate(
        "Custom",
        "A custom template",
        "split",
        "tech",
        "modern",
        "Custom use case"
      );
      expect(template.name).toBe("Custom");
      expect(template.description).toBe("A custom template");
      expect(template.pattern).toBe("split");
      expect(template.colorScheme).toBe("tech");
      expect(template.typography).toBe("modern");
      expect(template.useCase).toBe("Custom use case");
    });

    it("should create valid custom template", () => {
      const template = createCustomTemplate(
        "Custom",
        "A custom template",
        "split",
        "tech",
        "modern",
        "Custom use case"
      );
      const result = validateTemplate(template);
      expect(result.valid).toBe(true);
    });
  });

  describe("getTemplateStats", () => {
    it("should return template statistics", () => {
      const stats = getTemplateStats();
      expect(stats.total).toBe(12);
      expect(stats.byPattern).toBeDefined();
      expect(stats.byColorScheme).toBeDefined();
    });

    it("should count patterns correctly", () => {
      const stats = getTemplateStats();
      expect(stats.byPattern["split"]).toBeGreaterThan(0);
      expect(stats.byPattern["hero"]).toBeGreaterThan(0);
    });

    it("should count color schemes correctly", () => {
      const stats = getTemplateStats();
      expect(stats.byColorScheme["corporate"]).toBeGreaterThan(0);
      expect(stats.byColorScheme["minimal"]).toBeGreaterThan(0);
    });
  });

  describe("Template Constants", () => {
    it("should have title slide template", () => {
      expect(TITLE_SLIDE_TEMPLATE.name).toBe("Title Slide");
      expect(TITLE_SLIDE_TEMPLATE.pattern).toBe("hero");
    });

    it("should have content slide template", () => {
      expect(CONTENT_SLIDE_TEMPLATE.name).toBe("Content Slide");
      expect(CONTENT_SLIDE_TEMPLATE.pattern).toBe("split");
    });

    it("should have two column template", () => {
      expect(TWO_COLUMN_TEMPLATE.name).toBe("Two Column");
      expect(TWO_COLUMN_TEMPLATE.pattern).toBe("comparison");
    });

    it("should have three column template", () => {
      expect(THREE_COLUMN_TEMPLATE.name).toBe("Three Column");
      expect(THREE_COLUMN_TEMPLATE.pattern).toBe("three-column");
    });

    it("should have data viz template", () => {
      expect(DATA_VIZ_TEMPLATE.name).toBe("Data Visualization");
      expect(DATA_VIZ_TEMPLATE.pattern).toBe("data-focused");
    });

    it("should have image focus template", () => {
      expect(IMAGE_FOCUS_TEMPLATE.name).toBe("Image Focus");
      expect(IMAGE_FOCUS_TEMPLATE.pattern).toBe("asymmetric");
    });

    it("should have timeline template", () => {
      expect(TIMELINE_TEMPLATE.name).toBe("Timeline");
      expect(TIMELINE_TEMPLATE.pattern).toBe("timeline");
    });

    it("should have centered focus template", () => {
      expect(CENTERED_FOCUS_TEMPLATE.name).toBe("Centered Focus");
      expect(CENTERED_FOCUS_TEMPLATE.pattern).toBe("centered");
    });

    it("should have sidebar template", () => {
      expect(SIDEBAR_TEMPLATE.name).toBe("Sidebar");
      expect(SIDEBAR_TEMPLATE.pattern).toBe("sidebar");
    });

    it("should have stacked template", () => {
      expect(STACKED_TEMPLATE.name).toBe("Stacked");
      expect(STACKED_TEMPLATE.pattern).toBe("stacked");
    });

    it("should have minimal template", () => {
      expect(MINIMAL_TEMPLATE.name).toBe("Minimal");
      expect(MINIMAL_TEMPLATE.pattern).toBe("minimal");
    });

    it("should have full bleed template", () => {
      expect(FULL_BLEED_TEMPLATE.name).toBe("Full Bleed");
      expect(FULL_BLEED_TEMPLATE.pattern).toBe("full-bleed");
    });
  });
});

