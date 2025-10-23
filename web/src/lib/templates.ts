import type { SlideSpecV1 } from "@/types/SlideSpecV1";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: "business" | "education" | "marketing" | "creative" | "minimal";
  thumbnail: string;
  spec: Partial<SlideSpecV1>;
}

export const TEMPLATES: Template[] = [
  {
    id: "business-professional",
    name: "Business Professional",
    description: "Clean and professional design for corporate presentations",
    category: "business",
    thumbnail: "💼",
    spec: {
      meta: {
        version: "1.0",
        locale: "en-US",
        theme: "Business Professional",
        aspectRatio: "16:9",
      },
      styleTokens: {
        palette: {
          primary: "#1E40AF",
          accent: "#10B981",
          neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
        },
        typography: {
          fonts: { sans: "Inter, Arial, sans-serif" },
          sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 24, step_3: 32 },
          weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
          lineHeights: { compact: 1.2, standard: 1.5 },
        },
        spacing: { base: 4, steps: [0, 4, 8, 12, 16, 24, 32] },
        radii: { sm: 2, md: 6, lg: 12 },
        shadows: {
          sm: "0 1px 2px rgba(0,0,0,.06)",
          md: "0 4px 8px rgba(0,0,0,.12)",
          lg: "0 12px 24px rgba(0,0,0,.18)",
        },
        contrast: { minTextContrast: 4.5, minUiContrast: 3 },
      },
    },
  },
  {
    id: "education-bright",
    name: "Education Bright",
    description: "Colorful and engaging design for educational content",
    category: "education",
    thumbnail: "🎓",
    spec: {
      meta: {
        version: "1.0",
        locale: "en-US",
        theme: "Education Bright",
        aspectRatio: "16:9",
      },
      styleTokens: {
        palette: {
          primary: "#059669",
          accent: "#F59E0B",
          neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
        },
        typography: {
          fonts: { sans: "Inter, Arial, sans-serif" },
          sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 24, step_3: 32 },
          weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
          lineHeights: { compact: 1.2, standard: 1.5 },
        },
        spacing: { base: 4, steps: [0, 4, 8, 12, 16, 24, 32] },
        radii: { sm: 4, md: 8, lg: 16 },
        shadows: {
          sm: "0 1px 2px rgba(0,0,0,.06)",
          md: "0 4px 8px rgba(0,0,0,.12)",
          lg: "0 12px 24px rgba(0,0,0,.18)",
        },
        contrast: { minTextContrast: 4.5, minUiContrast: 3 },
      },
    },
  },
  {
    id: "marketing-vibrant",
    name: "Marketing Vibrant",
    description: "Bold and eye-catching design for marketing presentations",
    category: "marketing",
    thumbnail: "📊",
    spec: {
      meta: {
        version: "1.0",
        locale: "en-US",
        theme: "Marketing Vibrant",
        aspectRatio: "16:9",
      },
      styleTokens: {
        palette: {
          primary: "#EC4899",
          accent: "#F59E0B",
          neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
        },
        typography: {
          fonts: { sans: "Inter, Arial, sans-serif" },
          sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 24, step_3: 36 },
          weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
          lineHeights: { compact: 1.2, standard: 1.5 },
        },
        spacing: { base: 4, steps: [0, 4, 8, 12, 16, 24, 32] },
        radii: { sm: 4, md: 8, lg: 16 },
        shadows: {
          sm: "0 1px 2px rgba(0,0,0,.06)",
          md: "0 4px 8px rgba(0,0,0,.12)",
          lg: "0 12px 24px rgba(0,0,0,.18)",
        },
        contrast: { minTextContrast: 4.5, minUiContrast: 3 },
      },
    },
  },
  {
    id: "creative-modern",
    name: "Creative Modern",
    description: "Contemporary design with bold typography and colors",
    category: "creative",
    thumbnail: "🎨",
    spec: {
      meta: {
        version: "1.0",
        locale: "en-US",
        theme: "Creative Modern",
        aspectRatio: "16:9",
      },
      styleTokens: {
        palette: {
          primary: "#8B5CF6",
          accent: "#06B6D4",
          neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
        },
        typography: {
          fonts: { sans: "Inter, Arial, sans-serif" },
          sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 28, step_3: 40 },
          weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
          lineHeights: { compact: 1.1, standard: 1.4 },
        },
        spacing: { base: 4, steps: [0, 4, 8, 12, 16, 24, 32] },
        radii: { sm: 8, md: 12, lg: 20 },
        shadows: {
          sm: "0 1px 2px rgba(0,0,0,.06)",
          md: "0 4px 8px rgba(0,0,0,.12)",
          lg: "0 12px 24px rgba(0,0,0,.18)",
        },
        contrast: { minTextContrast: 4.5, minUiContrast: 3 },
      },
    },
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Simple and elegant design with lots of white space",
    category: "minimal",
    thumbnail: "⚪",
    spec: {
      meta: {
        version: "1.0",
        locale: "en-US",
        theme: "Minimal Clean",
        aspectRatio: "16:9",
      },
      styleTokens: {
        palette: {
          primary: "#0F172A",
          accent: "#6366F1",
          neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
        },
        typography: {
          fonts: { sans: "Inter, Arial, sans-serif" },
          sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 18, step_2: 22, step_3: 28 },
          weights: { regular: 300, medium: 400, semibold: 500, bold: 600 },
          lineHeights: { compact: 1.3, standard: 1.6 },
        },
        spacing: { base: 4, steps: [0, 8, 16, 24, 32, 48, 64] },
        radii: { sm: 0, md: 2, lg: 4 },
        shadows: {
          sm: "0 1px 2px rgba(0,0,0,.03)",
          md: "0 2px 4px rgba(0,0,0,.06)",
          lg: "0 4px 8px rgba(0,0,0,.09)",
        },
        contrast: { minTextContrast: 4.5, minUiContrast: 3 },
      },
    },
  },
];

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: Template["category"]): Template[] {
  return TEMPLATES.filter((t) => t.category === category);
}

export function applyTemplate(template: Template, content: SlideSpecV1["content"]): SlideSpecV1 {
  return {
    ...template.spec,
    content,
    meta: template.spec.meta!,
    layout: template.spec.layout || {
      grid: { rows: 8, cols: 12, gutter: 8, margin: { t: 24, r: 24, b: 24, l: 24 } },
      regions: [
        { name: "header", rowStart: 1, colStart: 1, rowSpan: 2, colSpan: 12 },
        { name: "body", rowStart: 3, colStart: 1, rowSpan: 6, colSpan: 12 },
      ],
      anchors: [{ refId: "title", region: "header", order: 0 }],
    },
    styleTokens: template.spec.styleTokens!,
  } as SlideSpecV1;
}

