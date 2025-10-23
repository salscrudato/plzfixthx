/**
 * Professional Slide Templates
 * Pre-designed templates for common slide types
 */

export interface TemplateConfig {
  name: string;
  description: string;
  pattern: string;
  colorScheme: string;
  typography: string;
  useCase: string;
}

export interface TemplateLayout {
  title: {
    fontSize: number;
    bold: boolean;
    color: string;
  };
  subtitle: {
    fontSize: number;
    bold: boolean;
    color: string;
  };
  body: {
    fontSize: number;
    color: string;
    lineHeight: number;
  };
  accent: string;
  background: string;
}

/**
 * Title Slide Template
 * Large, impactful opening slide
 */
export const TITLE_SLIDE_TEMPLATE: TemplateConfig = {
  name: "Title Slide",
  description: "Large, impactful opening slide with title and subtitle",
  pattern: "hero",
  colorScheme: "corporate",
  typography: "professional",
  useCase: "Presentation opening, cover slide"
};

/**
 * Content Slide Template
 * Standard content with title and bullet points
 */
export const CONTENT_SLIDE_TEMPLATE: TemplateConfig = {
  name: "Content Slide",
  description: "Standard slide with title and bullet point content",
  pattern: "split",
  colorScheme: "corporate",
  typography: "professional",
  useCase: "Main content, information delivery"
};

/**
 * Two Column Template
 * Side-by-side comparison or contrast
 */
export const TWO_COLUMN_TEMPLATE: TemplateConfig = {
  name: "Two Column",
  description: "Side-by-side layout for comparison or contrast",
  pattern: "comparison",
  colorScheme: "corporate",
  typography: "professional",
  useCase: "Comparison, pros/cons, before/after"
};

/**
 * Three Column Template
 * Feature showcase or comparison
 */
export const THREE_COLUMN_TEMPLATE: TemplateConfig = {
  name: "Three Column",
  description: "Three equal columns for features or comparison",
  pattern: "three-column",
  colorScheme: "corporate",
  typography: "professional",
  useCase: "Feature showcase, three-way comparison"
};

/**
 * Data Visualization Template
 * Optimized for charts and graphs
 */
export const DATA_VIZ_TEMPLATE: TemplateConfig = {
  name: "Data Visualization",
  description: "Optimized layout for charts, graphs, and data",
  pattern: "data-focused",
  colorScheme: "corporate",
  typography: "professional",
  useCase: "Charts, graphs, metrics, analytics"
};

/**
 * Image Focus Template
 * Large image with minimal text
 */
export const IMAGE_FOCUS_TEMPLATE: TemplateConfig = {
  name: "Image Focus",
  description: "Large image with minimal supporting text",
  pattern: "asymmetric",
  colorScheme: "minimal",
  typography: "professional",
  useCase: "Product showcase, photography, visual focus"
};

/**
 * Timeline Template
 * Process or timeline visualization
 */
export const TIMELINE_TEMPLATE: TemplateConfig = {
  name: "Timeline",
  description: "Horizontal timeline for processes or history",
  pattern: "timeline",
  colorScheme: "corporate",
  typography: "professional",
  useCase: "Process flow, timeline, roadmap"
};

/**
 * Centered Focus Template
 * Centered content for maximum impact
 */
export const CENTERED_FOCUS_TEMPLATE: TemplateConfig = {
  name: "Centered Focus",
  description: "Centered content with maximum focus",
  pattern: "centered",
  colorScheme: "minimal",
  typography: "professional",
  useCase: "Key message, quote, emphasis"
};

/**
 * Sidebar Template
 * Content with prominent sidebar
 */
export const SIDEBAR_TEMPLATE: TemplateConfig = {
  name: "Sidebar",
  description: "Content with prominent sidebar for navigation",
  pattern: "sidebar",
  colorScheme: "corporate",
  typography: "professional",
  useCase: "Navigation, key points, supplementary info"
};

/**
 * Stacked Template
 * Vertically stacked sections
 */
export const STACKED_TEMPLATE: TemplateConfig = {
  name: "Stacked",
  description: "Vertically stacked content sections",
  pattern: "stacked",
  colorScheme: "corporate",
  typography: "professional",
  useCase: "Sequential information, steps, sections"
};

/**
 * Minimal Template
 * Maximum whitespace, minimal content
 */
export const MINIMAL_TEMPLATE: TemplateConfig = {
  name: "Minimal",
  description: "Minimal layout with maximum whitespace",
  pattern: "minimal",
  colorScheme: "minimal",
  typography: "professional",
  useCase: "Key message, breathing room, elegance"
};

/**
 * Full Bleed Template
 * Content extends to edges
 */
export const FULL_BLEED_TEMPLATE: TemplateConfig = {
  name: "Full Bleed",
  description: "Content extends to edges for maximum impact",
  pattern: "full-bleed",
  colorScheme: "corporate",
  typography: "professional",
  useCase: "Background image, full-screen content"
};

/**
 * Get all available templates
 */
export function getAllTemplates(): TemplateConfig[] {
  return [
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
  ];
}

/**
 * Get template by name
 */
export function getTemplate(name: string): TemplateConfig | undefined {
  return getAllTemplates().find(t => t.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get templates by use case
 */
export function getTemplatesByUseCase(useCase: string): TemplateConfig[] {
  return getAllTemplates().filter(t => t.useCase.toLowerCase().includes(useCase.toLowerCase()));
}

/**
 * Get template layout configuration
 */
export function getTemplateLayout(templateName: string, colorScheme: string = "corporate"): TemplateLayout {
  const layouts: Record<string, TemplateLayout> = {
    professional: {
      title: { fontSize: 44, bold: true, color: "#0F172A" },
      subtitle: { fontSize: 28, bold: false, color: "#334155" },
      body: { fontSize: 16, color: "#334155", lineHeight: 150 },
      accent: "#2563EB",
      background: "#FFFFFF"
    },
    modern: {
      title: { fontSize: 48, bold: true, color: "#0F172A" },
      subtitle: { fontSize: 32, bold: true, color: "#2563EB" },
      body: { fontSize: 16, color: "#334155", lineHeight: 150 },
      accent: "#6366F1",
      background: "#FFFFFF"
    },
    minimal: {
      title: { fontSize: 40, bold: true, color: "#1F2937" },
      subtitle: { fontSize: 24, bold: false, color: "#6B7280" },
      body: { fontSize: 14, color: "#6B7280", lineHeight: 160 },
      accent: "#1F2937",
      background: "#FFFFFF"
    },
    bold: {
      title: { fontSize: 52, bold: true, color: "#DC2626" },
      subtitle: { fontSize: 32, bold: true, color: "#0F172A" },
      body: { fontSize: 18, color: "#0F172A", lineHeight: 140 },
      accent: "#DC2626",
      background: "#FFFFFF"
    }
  };

  return layouts[templateName] || layouts.professional;
}

/**
 * Get recommended template for content type
 */
export function getRecommendedTemplate(contentType: "title" | "content" | "comparison" | "data" | "image" | "process"): TemplateConfig {
  const recommendations: Record<string, TemplateConfig> = {
    title: TITLE_SLIDE_TEMPLATE,
    content: CONTENT_SLIDE_TEMPLATE,
    comparison: TWO_COLUMN_TEMPLATE,
    data: DATA_VIZ_TEMPLATE,
    image: IMAGE_FOCUS_TEMPLATE,
    process: TIMELINE_TEMPLATE
  };

  return recommendations[contentType] || CONTENT_SLIDE_TEMPLATE;
}

/**
 * Validate template configuration
 */
export function validateTemplate(template: TemplateConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.name) {
    errors.push("Template name is required");
  }

  if (!template.pattern) {
    errors.push("Template pattern is required");
  }

  if (!template.colorScheme) {
    errors.push("Template color scheme is required");
  }

  if (!template.typography) {
    errors.push("Template typography is required");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create custom template
 */
export function createCustomTemplate(
  name: string,
  description: string,
  pattern: string,
  colorScheme: string,
  typography: string,
  useCase: string
): TemplateConfig {
  return {
    name,
    description,
    pattern,
    colorScheme,
    typography,
    useCase
  };
}

/**
 * Get template statistics
 */
export function getTemplateStats(): {
  total: number;
  byPattern: Record<string, number>;
  byColorScheme: Record<string, number>;
} {
  const templates = getAllTemplates();
  const byPattern: Record<string, number> = {};
  const byColorScheme: Record<string, number> = {};

  templates.forEach(t => {
    byPattern[t.pattern] = (byPattern[t.pattern] || 0) + 1;
    byColorScheme[t.colorScheme] = (byColorScheme[t.colorScheme] || 0) + 1;
  });

  return {
    total: templates.length,
    byPattern,
    byColorScheme
  };
}

