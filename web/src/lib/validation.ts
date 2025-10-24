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

/** Create a fallback spec with default values */
function createFallbackSpec(): SlideSpecV1 {
  return {
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Default",
      aspectRatio: "16:9"
    },
    content: {
      title: { id: "title", text: "Your Slide" },
      subtitle: { id: "subtitle", text: "Add your content here" }
    },
    layout: {
      grid: { rows: 12, cols: 12, gutter: 16, margin: { t: 20, r: 20, b: 20, l: 20 } },
      regions: [],
      anchors: []
    },
    styleTokens: {
      palette: {
        primary: "#6366F1",
        accent: "#EC4899",
        neutral: ["#0F172A", "#1E293B", "#334155", "#475569", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC"]
      },
      typography: {
        fonts: { sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
        sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 24, step_3: 32 },
        weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { compact: 1.2, standard: 1.5 }
      },
      spacing: { base: 8, steps: [0, 4, 8, 12, 16, 20, 24, 32] },
      radii: { sm: 4, md: 8, lg: 12 },
      shadows: { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.1)", lg: "0 10px 15px rgba(0,0,0,0.1)" },
      contrast: { minTextContrast: 4.5, minUiContrast: 3 }
    }
  };
}

