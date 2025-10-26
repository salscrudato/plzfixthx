import type { SlideSpecV1 } from "@/types/SlideSpecV1";

/** Normalize or provide fallback slide spec */
export function normalizeOrFallback(data: unknown): SlideSpecV1 {
  if (!data || typeof data !== "object") {
    return createFallbackSpec();
  }

  const obj = data as Record<string, unknown>;

  // If it's already a valid spec, return it
  if (isValidSpec(obj)) {
    return obj as unknown as SlideSpecV1;
  }

  // Try to extract spec from nested structure
  if (obj && typeof obj === "object" && "spec" in obj && obj.spec && typeof obj.spec === "object") {
    const spec = obj.spec as Record<string, unknown>;
    if (isValidSpec(spec)) {
      return spec as unknown as SlideSpecV1;
    }
  }

  return createFallbackSpec();
}

/** Check if object looks like a valid SlideSpecV1 */
function isValidSpec(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  const hasRequiredFields = !!(
    o.meta &&
    o.content &&
    o.layout &&
    o.styleTokens
  );
  const hasCorrectTypes = !!(
    typeof o.meta === "object" &&
    typeof o.content === "object" &&
    typeof o.layout === "object" &&
    typeof o.styleTokens === "object"
  );
  return hasRequiredFields && hasCorrectTypes;
}

/** Create a fallback spec with default values and proper layout */
function createFallbackSpec(): SlideSpecV1 {
  return {
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Professional",
      aspectRatio: "16:9"
    },
    content: {
      title: { id: "title", text: "Your Slide" },
      subtitle: { id: "subtitle", text: "Add your content here" },
      bullets: [{
        id: "b1",
        items: [
          { text: "Professional design", level: 1 },
          { text: "AI-powered generation", level: 1 },
          { text: "Ready to export", level: 1 }
        ]
      }]
    },
    layout: {
      grid: { rows: 8, cols: 12, gutter: 8, margin: { t: 32, r: 32, b: 32, l: 32 } },
      regions: [
        { name: "header", rowStart: 1, colStart: 1, rowSpan: 2, colSpan: 12 },
        { name: "body", rowStart: 3, colStart: 1, rowSpan: 5, colSpan: 12 }
      ],
      anchors: [
        { refId: "title", region: "header", order: 0 },
        { refId: "subtitle", region: "header", order: 1 },
        { refId: "b1", region: "body", order: 0 }
      ]
    },
    styleTokens: {
      palette: {
        primary: "#2563EB",
        accent: "#F59E0B",
        neutral: ["#0F172A", "#1E293B", "#334155", "#475569", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC"]
      },
      typography: {
        fonts: { sans: "Aptos, Calibri, Arial, sans-serif" },
        sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 28, step_3: 44 },
        weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { compact: 1.2, standard: 1.5 }
      },
      spacing: { base: 4, steps: [0, 4, 8, 12, 16, 24, 32] },
      radii: { sm: 4, md: 8, lg: 12 },
      shadows: { sm: "0 2px 4px rgba(0,0,0,0.08)", md: "0 4px 12px rgba(0,0,0,0.12)", lg: "0 12px 32px rgba(0,0,0,0.16)" },
      contrast: { minTextContrast: 7, minUiContrast: 4.5 }
    }
  };
}

