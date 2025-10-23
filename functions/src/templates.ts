/**
 * Pre-built Slide Templates
 * Ready-to-use templates for common use cases
 */

import type { SlideSpecV1 } from "./types/SlideSpecV1";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: "business" | "tech" | "marketing" | "education" | "general";
  thumbnail?: string;
  spec: SlideSpecV1;
}

/**
 * Title Slide Template
 */
export const TITLE_SLIDE_TEMPLATE: Template = {
  id: "title-hero",
  name: "Hero Title Slide",
  description: "Bold title slide for presentation openings",
  category: "general",
  spec: {
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Professional Hero",
      aspectRatio: "16:9"
    },
    content: {
      title: { id: "title", text: "Your Presentation Title" },
      subtitle: { id: "subtitle", text: "Subtitle or tagline goes here" }
    },
    layout: {
      grid: { rows: 8, cols: 12, gutter: 8, margin: { t: 32, r: 32, b: 32, l: 32 } },
      regions: [
        { name: "header", rowStart: 1, colStart: 1, rowSpan: 6, colSpan: 12 },
        { name: "footer", rowStart: 7, colStart: 1, rowSpan: 2, colSpan: 12 }
      ],
      anchors: [
        { refId: "title", region: "header", order: 0 },
        { refId: "subtitle", region: "header", order: 1 }
      ]
    },
    styleTokens: {
      palette: { primary: "#1E40AF", accent: "#10B981", neutral: ["#0F172A","#1E293B","#334155","#64748B","#94A3B8","#CBD5E1","#F8FAFC"] },
      typography: {
        fonts: { sans: "Inter, Arial, sans-serif" },
        sizes: { "step_-2": 12, "step_-1": 14, "step_0": 16, "step_1": 24, "step_2": 32, "step_3": 56 },
        weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { compact: 1.2, standard: 1.5 }
      },
      spacing: { base: 4, steps: [0,4,8,12,16,24,32,48] },
      radii: { sm: 4, md: 8, lg: 12 },
      shadows: { sm: "0 2px 4px rgba(0,0,0,.08)", md: "0 4px 12px rgba(0,0,0,.12)", lg: "0 12px 32px rgba(0,0,0,.16)" },
      contrast: { minTextContrast: 7, minUiContrast: 4.5 }
    }
  }
};

/**
 * Bullet Points Template
 */
export const BULLET_POINTS_TEMPLATE: Template = {
  id: "bullets-split",
  name: "Key Points",
  description: "Clean bullet point slide with title",
  category: "general",
  spec: {
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Professional Split",
      aspectRatio: "16:9"
    },
    content: {
      title: { id: "title", text: "Key Points" },
      subtitle: { id: "subtitle", text: "Main takeaways" },
      bullets: [{
        id: "b1",
        items: [
          { text: "First key point with supporting detail", level: 1 },
          { text: "Second important point to remember", level: 1 },
          { text: "Third critical insight or action item", level: 1 },
          { text: "Fourth point for comprehensive coverage", level: 1 }
        ]
      }]
    },
    layout: {
      grid: { rows: 8, cols: 12, gutter: 8, margin: { t: 32, r: 32, b: 32, l: 32 } },
      regions: [
        { name: "header", rowStart: 1, colStart: 1, rowSpan: 2, colSpan: 12 },
        { name: "body", rowStart: 3, colStart: 1, rowSpan: 6, colSpan: 12 }
      ],
      anchors: [
        { refId: "title", region: "header", order: 0 },
        { refId: "subtitle", region: "header", order: 1 },
        { refId: "b1", region: "body", order: 0 }
      ]
    },
    styleTokens: {
      palette: { primary: "#3B82F6", accent: "#10B981", neutral: ["#0F172A","#1E293B","#334155","#64748B","#94A3B8","#CBD5E1","#F8FAFC"] },
      typography: {
        fonts: { sans: "Arial, sans-serif" },
        sizes: { "step_-2": 12, "step_-1": 14, "step_0": 18, "step_1": 24, "step_2": 32, "step_3": 40 },
        weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { compact: 1.2, standard: 1.6 }
      },
      spacing: { base: 4, steps: [0,4,8,12,16,24,32] },
      radii: { sm: 4, md: 8, lg: 12 },
      shadows: { sm: "0 2px 4px rgba(0,0,0,.08)", md: "0 4px 12px rgba(0,0,0,.12)", lg: "0 12px 32px rgba(0,0,0,.16)" },
      contrast: { minTextContrast: 7, minUiContrast: 4.5 }
    }
  }
};

/**
 * Data Visualization Template
 */
export const DATA_VIZ_TEMPLATE: Template = {
  id: "data-chart",
  name: "Data & Metrics",
  description: "Chart-focused slide for data presentation",
  category: "business",
  spec: {
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Data Focused",
      aspectRatio: "16:9"
    },
    content: {
      title: { id: "title", text: "Performance Metrics" },
      subtitle: { id: "subtitle", text: "Q4 2024 Results" },
      bullets: [{
        id: "b1",
        items: [
          { text: "Revenue up 25% YoY", level: 1 },
          { text: "Customer growth: 15%", level: 1 },
          { text: "Retention rate: 94%", level: 1 }
        ]
      }],
      dataViz: {
        id: "chart1",
        kind: "bar",
        title: "Quarterly Revenue",
        labels: ["Q1", "Q2", "Q3", "Q4"],
        series: [{ name: "Revenue ($M)", values: [12, 15, 18, 22] }]
      }
    },
    layout: {
      grid: { rows: 8, cols: 12, gutter: 8, margin: { t: 32, r: 32, b: 32, l: 32 } },
      regions: [
        { name: "header", rowStart: 1, colStart: 1, rowSpan: 2, colSpan: 12 },
        { name: "body", rowStart: 3, colStart: 1, rowSpan: 6, colSpan: 7 },
        { name: "aside", rowStart: 3, colStart: 8, rowSpan: 6, colSpan: 5 }
      ],
      anchors: [
        { refId: "title", region: "header", order: 0 },
        { refId: "subtitle", region: "header", order: 1 },
        { refId: "chart1", region: "body", order: 0 },
        { refId: "b1", region: "aside", order: 0 }
      ]
    },
    styleTokens: {
      palette: { primary: "#0F172A", accent: "#10B981", neutral: ["#0F172A","#1E293B","#334155","#64748B","#94A3B8","#CBD5E1","#F8FAFC"] },
      typography: {
        fonts: { sans: "Inter, Arial, sans-serif" },
        sizes: { "step_-2": 12, "step_-1": 14, "step_0": 16, "step_1": 20, "step_2": 28, "step_3": 40 },
        weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { compact: 1.2, standard: 1.5 }
      },
      spacing: { base: 4, steps: [0,4,8,12,16,24,32] },
      radii: { sm: 4, md: 8, lg: 12 },
      shadows: { sm: "0 2px 4px rgba(0,0,0,.08)", md: "0 4px 12px rgba(0,0,0,.12)", lg: "0 12px 32px rgba(0,0,0,.16)" },
      contrast: { minTextContrast: 7, minUiContrast: 4.5 }
    }
  }
};

/**
 * Quote/Testimonial Template
 */
export const QUOTE_TEMPLATE: Template = {
  id: "quote-minimal",
  name: "Quote or Testimonial",
  description: "Minimal slide for impactful quotes",
  category: "marketing",
  spec: {
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Minimal Quote",
      aspectRatio: "16:9"
    },
    content: {
      title: { id: "title", text: "\"This product transformed our business\"" },
      subtitle: { id: "subtitle", text: "— Jane Doe, CEO of Example Corp" }
    },
    layout: {
      grid: { rows: 8, cols: 12, gutter: 8, margin: { t: 48, r: 48, b: 48, l: 48 } },
      regions: [
        { name: "body", rowStart: 3, colStart: 2, rowSpan: 4, colSpan: 10 }
      ],
      anchors: [
        { refId: "title", region: "body", order: 0 },
        { refId: "subtitle", region: "body", order: 1 }
      ]
    },
    styleTokens: {
      palette: { primary: "#1F2937", accent: "#8B5CF6", neutral: ["#0F172A","#1E293B","#334155","#64748B","#94A3B8","#CBD5E1","#F8FAFC"] },
      typography: {
        fonts: { sans: "Georgia, serif" },
        sizes: { "step_-2": 12, "step_-1": 14, "step_0": 16, "step_1": 20, "step_2": 28, "step_3": 36 },
        weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { compact: 1.3, standard: 1.6 }
      },
      spacing: { base: 4, steps: [0,4,8,12,16,24,32,48] },
      radii: { sm: 4, md: 8, lg: 12 },
      shadows: { sm: "0 2px 4px rgba(0,0,0,.08)", md: "0 4px 12px rgba(0,0,0,.12)", lg: "0 12px 32px rgba(0,0,0,.16)" },
      contrast: { minTextContrast: 7, minUiContrast: 4.5 }
    }
  }
};

/**
 * Two-Column Comparison Template
 */
export const COMPARISON_TEMPLATE: Template = {
  id: "comparison-split",
  name: "Side-by-Side Comparison",
  description: "Compare two options or concepts",
  category: "business",
  spec: {
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Split Comparison",
      aspectRatio: "16:9"
    },
    content: {
      title: { id: "title", text: "Option A vs Option B" },
      bullets: [
        {
          id: "b1",
          items: [
            { text: "Advantage 1", level: 1 },
            { text: "Advantage 2", level: 1 },
            { text: "Advantage 3", level: 1 }
          ]
        },
        {
          id: "b2",
          items: [
            { text: "Benefit 1", level: 1 },
            { text: "Benefit 2", level: 1 },
            { text: "Benefit 3", level: 1 }
          ]
        }
      ]
    },
    layout: {
      grid: { rows: 8, cols: 12, gutter: 8, margin: { t: 32, r: 32, b: 32, l: 32 } },
      regions: [
        { name: "header", rowStart: 1, colStart: 1, rowSpan: 2, colSpan: 12 },
        { name: "body", rowStart: 3, colStart: 1, rowSpan: 6, colSpan: 5 },
        { name: "aside", rowStart: 3, colStart: 7, rowSpan: 6, colSpan: 6 }
      ],
      anchors: [
        { refId: "title", region: "header", order: 0 },
        { refId: "b1", region: "body", order: 0 },
        { refId: "b2", region: "aside", order: 0 }
      ]
    },
    styleTokens: {
      palette: { primary: "#4F46E5", accent: "#EC4899", neutral: ["#0F172A","#1E293B","#334155","#64748B","#94A3B8","#CBD5E1","#F8FAFC"] },
      typography: {
        fonts: { sans: "Segoe UI, Arial, sans-serif" },
        sizes: { "step_-2": 12, "step_-1": 14, "step_0": 16, "step_1": 22, "step_2": 30, "step_3": 40 },
        weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { compact: 1.2, standard: 1.5 }
      },
      spacing: { base: 4, steps: [0,4,8,12,16,24,32] },
      radii: { sm: 4, md: 8, lg: 12 },
      shadows: { sm: "0 2px 4px rgba(0,0,0,.08)", md: "0 4px 12px rgba(0,0,0,.12)", lg: "0 12px 32px rgba(0,0,0,.16)" },
      contrast: { minTextContrast: 7, minUiContrast: 4.5 }
    }
  }
};

/**
 * Get all templates
 */
export function getAllTemplates(): Template[] {
  return [
    TITLE_SLIDE_TEMPLATE,
    BULLET_POINTS_TEMPLATE,
    DATA_VIZ_TEMPLATE,
    QUOTE_TEMPLATE,
    COMPARISON_TEMPLATE
  ];
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: Template["category"]): Template[] {
  return getAllTemplates().filter(t => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | null {
  return getAllTemplates().find(t => t.id === id) || null;
}

