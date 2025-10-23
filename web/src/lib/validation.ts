import { z } from "zod";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";

export const SlideSpecZ = z.object({
  meta: z.object({
    version: z.literal("1.0"),
    locale: z.string().default("en-US"),
    theme: z.string(),
    aspectRatio: z.enum(["16:9","4:3"]).default("16:9")
  }),
  content: z.object({
    title: z.object({ id: z.string(), text: z.string().min(1) }),
    subtitle: z.object({ id: z.string(), text: z.string().min(1) }).optional(),
    bullets: z.array(z.object({
      id: z.string(),
      items: z.array(z.object({ text: z.string().min(1), level: z.number().int().min(1).max(3) })).min(1).max(8)
    })).max(3).optional(),
    callouts: z.array(z.object({
      id: z.string(), title: z.string().optional(), text: z.string(), variant: z.enum(["note","success","warning","danger"])
    })).max(2).optional(),
    dataViz: z.object({
      id: z.string(),
      kind: z.enum(["bar","line","pie"]),
      title: z.string().optional(),
      labels: z.array(z.string()).min(2).max(10),
      series: z.array(z.object({ name: z.string(), values: z.array(z.number()) })).min(1).max(3),
      valueFormat: z.enum(["number","percent","currency","auto"]).default("auto")
    }).refine(d => d.series.every(s => s.values.length === d.labels.length), "series length mismatch")
      .optional(),
    imagePlaceholders: z.array(z.object({
      id: z.string(), role: z.enum(["hero","logo","illustration","icon"]), alt: z.string().min(1)
    })).max(2).optional()
  }),
  layout: z.object({
    grid: z.object({
      rows: z.number().int().min(3).max(12),
      cols: z.number().int().min(3).max(12),
      gutter: z.number().min(0),
      margin: z.object({ t: z.number(), r: z.number(), b: z.number(), l: z.number() })
    }),
    regions: z.array(z.object({
      name: z.enum(["header","body","footer","aside"]),
      rowStart: z.number().int().positive(), colStart: z.number().int().positive(),
      rowSpan: z.number().int().positive(),  colSpan: z.number().int().positive()
    })).min(1).max(4),
    anchors: z.array(z.object({
      refId: z.string(), region: z.enum(["header","body","footer","aside"]), order: z.number().int().min(0),
      span: z.object({ rows: z.number().int().positive(), cols: z.number().int().positive() }).optional()
    })).min(1).max(8)
  }),
  styleTokens: z.object({
    palette: z.object({ primary: z.string(), accent: z.string(), neutral: z.array(z.string()).min(5).max(9) }),
    typography: z.object({
      fonts: z.object({ sans: z.string(), serif: z.string().optional(), mono: z.string().optional() }),
      sizes: z.object({ "step_-2": z.number(), "step_-1": z.number(), step_0: z.number(), step_1: z.number(), step_2: z.number(), step_3: z.number() }),
      weights: z.object({ regular: z.number(), medium: z.number(), semibold: z.number(), bold: z.number() }),
      lineHeights: z.object({ compact: z.number(), standard: z.number() })
    }),
    spacing: z.object({ base: z.number(), steps: z.array(z.number()).min(5).max(10) }),
    radii: z.object({ sm: z.number(), md: z.number(), lg: z.number() }),
    shadows: z.object({ sm: z.string(), md: z.string(), lg: z.string() }),
    contrast: z.object({ minTextContrast: z.number(), minUiContrast: z.number() })
  }),
  components: z.object({
    bulletList: z.object({ variant: z.enum(["compact","spacious"]).optional() }).optional(),
    callout: z.object({ variant: z.enum(["flat","elevated"]).optional() }).optional(),
    chart: z.object({ legend: z.enum(["none","right","bottom"]).optional(), gridlines: z.boolean().optional() }).optional(),
    image: z.object({ fit: z.enum(["cover","contain"]).optional() }).optional(),
    title: z.object({ align: z.enum(["left","center","right"]).optional() }).optional()
  }).optional()
});
export type SlideSpec = z.infer<typeof SlideSpecZ>;

export function normalizeOrFallback(raw: unknown): SlideSpecV1 {
  const res = SlideSpecZ.safeParse(raw);
  if (res.success) return res.data as SlideSpecV1;
  return {
    meta: { version: "1.0", locale: "en-US", theme: "Clean", aspectRatio: "16:9" },
    content: { title: { id: "title", text: "Untitled Slide" } },
    layout: {
      grid: { rows: 8, cols: 12, gutter: 8, margin: { t: 24, r: 24, b: 24, l: 24 } },
      regions: [
        { name: "header", rowStart: 1, colStart: 1, rowSpan: 2, colSpan: 12 },
        { name: "body", rowStart: 3, colStart: 1, rowSpan: 6, colSpan: 12 }
      ],
      anchors: [{ refId: "title", region: "header", order: 0 }]
    },
    styleTokens: {
      palette: { primary: "#2563EB", accent: "#F59E0B", neutral: ["#0F172A","#1E293B","#334155","#64748B","#94A3B8","#CBD5E1","#E2E8F0"] },
      typography: { fonts: { sans: "Inter, Arial, sans-serif" }, sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 24, step_3: 32 }, weights: { regular: 400, medium: 500, semibold: 600, bold: 700 }, lineHeights: { compact: 1.2, standard: 1.5 } },
      spacing: { base: 4, steps: [0,4,8,12,16,24,32] },
      radii: { sm: 2, md: 6, lg: 12 },
      shadows: { sm: "0 1px 2px rgba(0,0,0,.06)", md: "0 4px 8px rgba(0,0,0,.12)", lg: "0 12px 24px rgba(0,0,0,.18)" },
      contrast: { minTextContrast: 4.5, minUiContrast: 3 }
    }
  };
}

