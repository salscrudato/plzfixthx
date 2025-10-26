import { z } from "zod";

/** Aspect ratios supported by the deck */
export type AspectRatio = "16:9" | "4:3";

/** Named layout regions (grid areas) */
export type RegionName = "header" | "body" | "footer" | "aside";

/** Chart kinds supported by the universal builder (others will show placeholders) */
export type ChartKind =
  | "bar"
  | "line"
  | "pie"
  | "doughnut"
  | "area"
  | "scatter"
  | "combo"
  | "waterfall"
  | "funnel";

/** Optional high-level design intent to influence layout/style heuristics */
export interface DesignSpec {
  pattern: "hero" | "split" | "asymmetric" | "grid" | "minimal" | "data-focused";
  whitespace?: {
    strategy: "generous" | "balanced" | "compact";
    /** Additional breathing room hint in inches (0–0.5 typical). */
    breathingRoom?: number;
  };
}

/** Primary contract used across server & web */
export interface SlideSpecV1 {
  meta: {
    version: "1.0";
    locale: string;
    theme: string;
    aspectRatio: AspectRatio;
  };
  /** Optional design intent hints for the renderer */
  design?: DesignSpec;
  content: {
    title: { id: string; text: string };
    subtitle?: { id: string; text: string };
    bullets?: { id: string; items: { text: string; level: 1 | 2 | 3 }[] }[];
    callouts?: {
      id: string;
      title?: string;
      text: string;
      variant: "note" | "success" | "warning" | "danger";
    }[];
    dataViz?: {
      id: string;
      kind: ChartKind;
      title?: string;
      labels: string[];
      series: { name: string; values: number[] }[];
      valueFormat?: "number" | "percent" | "currency" | "auto";
    };
    imagePlaceholders?: {
      id: string;
      role: "hero" | "logo" | "illustration" | "icon" | "background";
      alt: string;
    }[];
    images?: {
      id: string;
      role: "hero" | "logo" | "illustration" | "icon" | "background";
      source: { type: "url" | "unsplash" | "placeholder"; url?: string; query?: string };
      alt: string;
      fit?: "cover" | "contain" | "fill";
    }[];
  };
  layout: {
    grid: {
      rows: number;
      cols: number;
      gutter: number;
      margin: { t: number; r: number; b: number; l: number };
    };
    regions: { name: RegionName; rowStart: number; colStart: number; rowSpan: number; colSpan: number }[];
    anchors: { refId: string; region: RegionName; order: number; span?: { rows: number; cols: number } }[];
  };
  styleTokens: {
    palette: { primary: string; accent: string; neutral: string[] };
    typography: {
      fonts: { sans: string; serif?: string; mono?: string };
      sizes: {
        "step_-2": number;
        "step_-1": number;
        step_0: number;
        step_1: number;
        step_2: number;
        step_3: number;
      };
      weights: { regular: number; medium: number; semibold: number; bold: number };
      lineHeights: { compact: number; standard: number };
    };
    spacing: { base: number; steps: number[] };
    radii: { sm: number; md: number; lg: number };
    shadows: { sm: string; md: string; lg: string };
    contrast: { minTextContrast: number; minUiContrast: number };
  };
  components?: {
    bulletList?: { variant?: "compact" | "spacious" };
    callout?: { variant?: "flat" | "elevated" };
    chart?: { legend?: "none" | "right" | "bottom"; gridlines?: boolean };
    image?: { fit?: "cover" | "contain" };
    title?: { align?: "left" | "center" | "right" };
  };
}

/* -------------------------------------------------------------------------- */
/*                                Zod Schema                                  */
/* -------------------------------------------------------------------------- */

export const SlideSpecZ = z.object({
  meta: z.object({
    version: z.literal("1.0"),
    locale: z.string(),
    theme: z.string(),
    aspectRatio: z.enum(["16:9", "4:3"]),
  }),
  design: z
    .object({
      pattern: z.enum(["hero", "split", "asymmetric", "grid", "minimal", "data-focused"]),
      whitespace: z
        .object({
          strategy: z.enum(["generous", "balanced", "compact"]).optional(),
          breathingRoom: z.number().min(0).max(0.75).optional(),
        })
        .optional(),
    })
    .optional(),
  content: z.object({
    title: z.object({ id: z.string(), text: z.string().min(1) }),
    subtitle: z.object({ id: z.string(), text: z.string().min(1) }).optional(),
    bullets: z
      .array(
        z.object({
          id: z.string(),
          items: z
            .array(
              z.object({
                text: z.string().min(1),
                level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
              })
            )
            .min(1)
            .max(8),
        })
      )
      .max(3)
      .optional(),
    callouts: z
      .array(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          text: z.string().min(1),
          variant: z.enum(["note", "success", "warning", "danger"]),
        })
      )
      .max(2)
      .optional(),
    dataViz: z
      .object({
        id: z.string(),
        kind: z.enum(["bar", "line", "pie", "doughnut", "area", "scatter", "combo", "waterfall", "funnel"]),
        title: z.string().optional(),
        labels: z.array(z.string()).min(2).max(10),
        series: z
          .array(
            z.object({
              name: z.string(),
              values: z.array(z.number()),
            })
          )
          .min(1)
          .max(4),
        valueFormat: z.enum(["number", "percent", "currency", "auto"]).optional(),
      })
      .optional(),
    imagePlaceholders: z
      .array(
        z.object({
          id: z.string(),
          role: z.enum(["hero", "logo", "illustration", "icon", "background"]),
          alt: z.string(),
        })
      )
      .max(3)
      .optional(),
    images: z
      .array(
        z.object({
          id: z.string(),
          role: z.enum(["hero", "logo", "illustration", "icon", "background"]),
          source: z.object({
            type: z.enum(["url", "unsplash", "placeholder"]),
            url: z.string().url().optional(),
            query: z.string().optional(),
          }),
          alt: z.string(),
          fit: z.enum(["cover", "contain", "fill"]).optional(),
        })
      )
      .max(4)
      .optional(),
  }),
  layout: z.object({
    grid: z.object({
      rows: z.number().int().min(3).max(12),
      cols: z.number().int().min(3).max(12),
      gutter: z.number().min(0),
      margin: z.object({ t: z.number(), r: z.number(), b: z.number(), l: z.number() }),
    }),
    regions: z
      .array(
        z.object({
          name: z.enum(["header", "body", "footer", "aside"]),
          rowStart: z.number().int().positive(),
          colStart: z.number().int().positive(),
          rowSpan: z.number().int().positive(),
          colSpan: z.number().int().positive(),
        })
      )
      .min(1)
      .max(6),
    anchors: z
      .array(
        z.object({
          refId: z.string(),
          region: z.enum(["header", "body", "footer", "aside"]),
          order: z.number().int().min(0),
          span: z.object({ rows: z.number().int().positive(), cols: z.number().int().positive() }).optional(),
        })
      )
      .min(1)
      .max(10),
  }),
  styleTokens: z.object({
    palette: z.object({
      primary: z.string(),
      accent: z.string(),
      neutral: z.array(z.string()).min(5).max(9),
    }),
    typography: z.object({
      fonts: z.object({ sans: z.string(), serif: z.string().optional(), mono: z.string().optional() }),
      sizes: z.object({
        "step_-2": z.number(),
        "step_-1": z.number(),
        step_0: z.number(),
        step_1: z.number(),
        step_2: z.number(),
        step_3: z.number(),
      }),
      weights: z.object({ regular: z.number(), medium: z.number(), semibold: z.number(), bold: z.number() }),
      lineHeights: z.object({ compact: z.number(), standard: z.number() }),
    }),
    spacing: z.object({ base: z.number(), steps: z.array(z.number()).min(5).max(10) }),
    radii: z.object({ sm: z.number(), md: z.number(), lg: z.number() }),
    shadows: z.object({ sm: z.string(), md: z.string(), lg: z.string() }),
    contrast: z.object({ minTextContrast: z.number(), minUiContrast: z.number() }),
  }),
  components: z
    .object({
      bulletList: z.object({ variant: z.enum(["compact", "spacious"]).optional() }).optional(),
      callout: z.object({ variant: z.enum(["flat", "elevated"]).optional() }).optional(),
      chart: z.object({ legend: z.enum(["none", "right", "bottom"]).optional(), gridlines: z.boolean().optional() }).optional(),
      image: z.object({ fit: z.enum(["cover", "contain"]).optional() }).optional(),
      title: z.object({ align: z.enum(["left", "center", "right"]).optional() }).optional(),
    })
    .optional(),
});

export type SlideSpec = z.infer<typeof SlideSpecZ>;