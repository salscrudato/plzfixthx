import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

/** Aspect ratios supported by the deck */
export type AspectRatio = "16:9" | "4:3";

/** Named layout regions (grid areas) */
export type RegionName = "header" | "body" | "footer" | "aside";

/** Chart kinds supported by the universal builder/preview (others show placeholders) */
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

/** Value formatting hints for charts */
export type ChartValueFormat = "number" | "percent" | "currency" | "auto";

/** Optional high-level design intent to influence layout/style heuristics */
export interface DesignSpec {
  pattern: "hero" | "split" | "asymmetric" | "grid" | "minimal" | "data-focused";
  whitespace?: {
    strategy: "generous" | "balanced" | "compact";
    /** Additional breathing room hint in inches (0–0.75 typical). */
    breathingRoom?: number;
  };
}

/** Title alignment options */
export type TitleAlign = "left" | "center" | "right";

/** Chart legend position options */
export type ChartLegend = "none" | "right" | "bottom";

/** Image fit options */
export type ImageFit = "cover" | "contain" | "fill";

/** Image role/purpose */
export type ImageRole = "hero" | "logo" | "illustration" | "icon" | "background";

/** Typography scale definition */
export interface TypographyScale {
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
}

/** Style tokens for theming */
export interface StyleTokens {
  palette: { primary: string; accent: string; neutral: string[] };
  typography: TypographyScale;
  spacing: { base: number; steps: number[] };
  radii: { sm: number; md: number; lg: number };
  shadows: { sm: string; md: string; lg: string };
  contrast: { minTextContrast: number; minUiContrast: number };
}

/* -------------------------------------------------------------------------- */
/*                                 Zod helpers                                */
/* -------------------------------------------------------------------------- */

const HEX6 = /^#[0-9A-Fa-f]{6}$/;
const ID_RX = /^[A-Za-z0-9_-]+$/;

const idStr = z.string().regex(ID_RX, "IDs must contain only letters, numbers, underscores, or hyphens.");
const colorHex = z.string().regex(HEX6, "Color must be a #RRGGBB hex value.");

/**
 * Runtime palette sanitizer: ensures primary/accent are valid hex6,
 * and neutral is a 9-step scale (dark → light).
 */
export function safePalette(p: {
  primary?: string;
  accent?: string;
  neutral?: string[];
}): { primary: string; accent: string; neutral: string[] } {
  const DEFAULT_NEUTRAL_9 = [
    "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
    "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC",
  ];

  const isHex6 = (color: string | undefined | null): color is string =>
    !!color && /^#[0-9A-Fa-f]{6}$/.test(color);

  const primary = isHex6(p.primary) ? p.primary : "#1E40AF";
  const accent = isHex6(p.accent) ? p.accent : "#F59E0B";

  const neutral =
    Array.isArray(p.neutral) && p.neutral.filter(isHex6).length >= 5
      ? (() => {
          const cleaned = p.neutral.filter(isHex6).slice(0, 9);
          while (cleaned.length < 9) cleaned.push(DEFAULT_NEUTRAL_9[cleaned.length]);
          return cleaned;
        })()
      : [...DEFAULT_NEUTRAL_9];

  return { primary, accent, neutral };
}

/* -------------------------------------------------------------------------- */
/*                                Zod Schema                                  */
/* -------------------------------------------------------------------------- */

export const SlideSpecZ = z
  .object({
    meta: z.object({
      version: z.literal("1.0"),
      locale: z.string(),
      theme: z.string(),
      aspectRatio: z.enum(["16:9", "4:3"]),
    }),

    /** Design hints (optional but recommended by prompts) */
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
      title: z.object({
        id: idStr,
        text: z.string().min(1).max(60, "Title must be ≤ 60 characters."),
      }),
      subtitle: z
        .object({
          id: idStr,
          text: z.string().min(1).max(100, "Subtitle must be ≤ 100 characters."),
        })
        .optional(),

      bullets: z
        .array(
          z.object({
            id: idStr,
            items: z
              .array(
                z.object({
                  text: z.string().min(1).max(80, "Bullet text must be ≤ 80 characters."),
                  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
                })
              )
              .min(1)
              .max(5),
          })
        )
        .max(3)
        .optional(),

      callouts: z
        .array(
          z.object({
            id: idStr,
            title: z.string().optional(),
            text: z.string().min(1),
            variant: z.enum(["note", "success", "warning", "danger"]),
            elevated: z.boolean().optional(), // Optional elevated variant for callouts
          })
        )
        .max(2)
        .optional(),

      /** Speaker notes (presenter view only, not rendered on slide) */
      speakerNotes: z
        .object({
          id: idStr,
          text: z.string().min(1).max(500, "Speaker notes must be ≤ 500 characters."),
        })
        .optional(),

      /** Optional table content */
      table: z
        .object({
          id: idStr,
          title: z.string().optional(),
          headers: z.array(z.string()).min(1).max(6),
          rows: z
            .array(z.array(z.string()).min(1).max(6))
            .min(1)
            .max(10),
        })
        .optional(),

      dataViz: z
        .object({
          id: idStr,
          kind: z.enum(["bar", "line", "pie", "doughnut", "area", "scatter", "combo", "waterfall", "funnel"]),
          title: z.string().optional(),
          labels: z.array(z.string()).min(2).max(10),
          series: z
            .array(
              z.object({
                name: z.string().min(1),
                values: z.array(z.number()),
              })
            )
            .min(1)
            .max(4),
          valueFormat: z.enum(["number", "percent", "currency", "auto"]).optional(),
        })
        .optional(),

      /** For preview placeholders when real images are not yet resolved */
      imagePlaceholders: z
        .array(
          z.object({
            id: idStr,
            role: z.enum(["hero", "logo", "illustration", "icon", "background"]),
            alt: z.string(),
          })
        )
        .max(3)
        .optional(),

      /** Concrete images (optional) with sourcing hints */
      images: z
        .array(
          z.object({
            id: idStr,
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
            refId: idStr,
            region: z.enum(["header", "body", "footer", "aside"]),
            order: z.number().int().min(0),
            span: z
              .object({ rows: z.number().int().positive(), cols: z.number().int().positive() })
              .optional(),
          })
        )
        .min(1)
        .max(10),
    }),

    styleTokens: z.object({
      palette: z.object({
        primary: colorHex,
        accent: colorHex,
        neutral: z.array(colorHex).length(9),
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
      contrast: z.object({
        minTextContrast: z.number().min(7, "minTextContrast must be ≥ 7"),
        minUiContrast: z.number().min(4.5, "minUiContrast must be ≥ 4.5"),
      }),
    }),

    components: z
      .object({
        bulletList: z.object({ variant: z.enum(["compact", "spacious"]).optional() }).optional(),
        callout: z.object({ variant: z.enum(["flat", "elevated"]).optional() }).optional(),
        chart: z
          .object({
            legend: z.enum(["none", "right", "bottom"]).optional(),
            gridlines: z.boolean().optional(),
            dataLabels: z.boolean().optional(),
          })
          .optional(),
        image: z.object({ fit: z.enum(["cover", "contain", "fill"]).optional() }).optional(),
        title: z.object({ align: z.enum(["left", "center", "right"]).optional() }).optional(),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    // Collect content IDs
    const c = value.content;
    const allContentIds: string[] = [];
    if (c.title?.id) allContentIds.push(c.title.id);
    if (c.subtitle?.id) allContentIds.push(c.subtitle.id);
    (c.bullets || []).forEach((b) => allContentIds.push(b.id));
    (c.callouts || []).forEach((co) => allContentIds.push(co.id));
    if (c.dataViz?.id) allContentIds.push(c.dataViz.id);
    (c.imagePlaceholders || []).forEach((ph) => allContentIds.push(ph.id));
    (c.images || []).forEach((img) => allContentIds.push(img.id));
    if (c.speakerNotes?.id) allContentIds.push(c.speakerNotes.id);
    if (c.table?.id) allContentIds.push(c.table.id);

    // 1) IDs across content must be unique
    const seen = new Set<string>();
    for (let i = 0; i < allContentIds.length; i++) {
      const id = allContentIds[i];
      if (seen.has(id)) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: `Duplicate content id "${id}" detected.`,
        });
      }
      seen.add(id);
    }

    // 2) Anchors must reference existing content IDs and be unique by refId
    const allowed = new Set(allContentIds);
    const anchorRefSeen = new Set<string>();
    value.layout.anchors.forEach((a, i) => {
      if (!allowed.has(a.refId)) {
        ctx.addIssue({
          code: "custom",
          path: ["layout", "anchors", i, "refId"],
          message: `refId "${a.refId}" does not match any content id`,
        });
      }
      if (anchorRefSeen.has(a.refId)) {
        ctx.addIssue({
          code: "custom",
          path: ["layout", "anchors", i, "refId"],
          message: `refId "${a.refId}" is anchored more than once`,
        });
      }
      anchorRefSeen.add(a.refId);
    });

    // 3) Region bounds and non-overlap
    const { rows, cols } = value.layout.grid;
    type R = (typeof value.layout.regions)[number];
    const end = (r: R) => ({
      rowEnd: r.rowStart + r.rowSpan - 1,
      colEnd: r.colStart + r.colSpan - 1,
    });

    value.layout.regions.forEach((r, i) => {
      const { rowEnd, colEnd } = end(r);
      if (rowEnd > rows) {
        ctx.addIssue({
          code: "custom",
          path: ["layout", "regions", i, "rowSpan"],
          message: `region exceeds grid rows (rows=${rows})`,
        });
      }
      if (colEnd > cols) {
        ctx.addIssue({
          code: "custom",
          path: ["layout", "regions", i, "colSpan"],
          message: `region exceeds grid cols (cols=${cols})`,
        });
      }
    });

    for (let i = 0; i < value.layout.regions.length; i++) {
      for (let j = i + 1; j < value.layout.regions.length; j++) {
        const a = value.layout.regions[i];
        const b = value.layout.regions[j];
        const aEnd = end(a);
        const bEnd = end(b);
        const rowsOverlap = !(aEnd.rowEnd < b.rowStart || bEnd.rowEnd < a.rowStart);
        const colsOverlap = !(aEnd.colEnd < b.colStart || bEnd.colEnd < a.colStart);
        if (rowsOverlap && colsOverlap) {
          ctx.addIssue({
            code: "custom",
            path: ["layout", "regions", j],
            message: `region "${b.name}" overlaps with region "${a.name}"`,
          });
        }
      }
    }

    // 4) Anchor order must be unique within each region
    const ordersByRegion = new Map<RegionName, Set<number>>();
    value.layout.anchors.forEach((a, i) => {
      const set = ordersByRegion.get(a.region) ?? new Set<number>();
      if (set.has(a.order)) {
        ctx.addIssue({
          code: "custom",
          path: ["layout", "anchors", i, "order"],
          message: `Duplicate order ${a.order} in region "${a.region}"`,
        });
      }
      set.add(a.order);
      ordersByRegion.set(a.region, set);

      if (a.span) {
        const region = value.layout.regions.find((r) => r.name === a.region);
        if (region) {
          if (a.span.rows > region.rowSpan || a.span.cols > region.colSpan) {
            ctx.addIssue({
              code: "custom",
              path: ["layout", "anchors", i, "span"],
              message: `Anchor span exceeds available space of region "${a.region}"`,
            });
          }
        }
      }
    });

    // 5) DataViz series must match labels length
    if (c.dataViz) {
      const L = c.dataViz.labels.length;
      c.dataViz.series.forEach((s, j) => {
        if (s.values.length !== L) {
          ctx.addIssue({
            code: "custom",
            path: ["content", "dataViz", "series", j, "values"],
            message: `series length (${s.values.length}) must equal labels length (${L})`,
          });
        }
      });
    }

    // 6) Image source requirements
    (c.images || []).forEach((img, j) => {
      const t = img.source?.type;
      if (t === "url" && !img.source.url) {
        ctx.addIssue({
          code: "custom",
          path: ["content", "images", j, "source", "url"],
          message: "url is required when source.type is 'url'",
        });
      }
      if (t === "unsplash" && !img.source.query) {
        ctx.addIssue({
          code: "custom",
          path: ["content", "images", j, "source", "query"],
          message: "query is required when source.type is 'unsplash'",
        });
      }
    });

    // 7) Typography size steps should be ascending
    const sz = value.styleTokens.typography.sizes;
    const steps = [sz["step_-2"], sz["step_-1"], sz.step_0, sz.step_1, sz.step_2, sz.step_3];
    for (let i = 1; i < steps.length; i++) {
      if (!(steps[i] > steps[i - 1])) {
        ctx.addIssue({
          code: "custom",
          path: ["styleTokens", "typography", "sizes"],
          message: "Typography size steps must be strictly ascending (-2 < -1 < 0 < 1 < 2 < 3).",
        });
        break;
      }
    }
  });

/* -------------------------------------------------------------------------- */
/*                               Exported types                               */
/* -------------------------------------------------------------------------- */

/** Runtime type derived from the schema (authoritative). */
export type SlideSpec = z.infer<typeof SlideSpecZ>;
/** Convenience alias for import symmetry. */
export type SlideSpecV1 = SlideSpec;

/* -------------------------------------------------------------------------- */
/*                            Safe Defaults & Utils                           */
/* -------------------------------------------------------------------------- */

/** CSS pixels per inch (96 dpi standard for web/screen rendering) */
export const PX_PER_IN = 96;

/** Recommended 9‑step neutral ramp (dark → light) */
export const DEFAULT_NEUTRAL_9 = Object.freeze([
  "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
  "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC",
]) as readonly string[];

/** Minimal, readable typography defaults */
export const DEFAULT_TYPOGRAPHY: Readonly<TypographyScale> = Object.freeze({
  fonts: { sans: "Inter, Arial, sans-serif" },
  sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 24, step_3: 44 },
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  lineHeights: { compact: 1.2, standard: 1.5 },
});

/** Quick hex validator; accepts #RRGGBB (no alpha) */
export function isHex6(color: string | undefined | null): color is string {
  return !!color && /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Normalize a palette defensively for preview usage.
 * - Ensures primary/accent are hex6 (applies tasteful defaults if not).
 * - Pads/fixes neutral to a 9‑step scale for consistent rendering.
 */
export function normalizePalette(p: SlideSpecV1["styleTokens"]["palette"]) {
  const primary = isHex6(p.primary) ? p.primary : "#1E40AF";
  const accent = isHex6(p.accent) ? p.accent : "#F59E0B";

  const neutral =
    Array.isArray(p.neutral) &&
    p.neutral.filter(isHex6).length >= 5
      ? ((): string[] => {
          const cleaned = p.neutral.filter(isHex6).slice(0, 9);
          // pad to 9 if short (for gradients/frames that assume a light end)
          while (cleaned.length < 9) cleaned.push(DEFAULT_NEUTRAL_9[cleaned.length]);
          return cleaned;
        })()
      : [...DEFAULT_NEUTRAL_9];

  return { primary, accent, neutral };
}

/* -------------------------------------------------------------------------- */
/*                            Shared Utilities                                */
/* -------------------------------------------------------------------------- */

/**
 * Convert hex color to RGB tuple
 * @param hex - Hex color string (e.g., "#FF0000")
 * @returns [r, g, b] tuple with values 0-255
 */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").slice(0, 6);
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return [r, g, b];
}

/**
 * Convert RGB to hex color
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number): string => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Calculate relative luminance per WCAG 2.2
 * @param hex - Hex color string
 * @returns Luminance value (0-1)
 */
export function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((x) => x / 255);
  const lin = (c: number): number => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Calculate contrast ratio per WCAG 2.2
 * @param hex1 - First hex color
 * @param hex2 - Second hex color
 * @returns Contrast ratio (1-21)
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Validate hex color format
 * @param color - Color string to validate
 * @returns True if valid 6-digit hex
 */
export function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Convert opacity (0-1) to PPTX transparency (0-100)
 * @param opacity - Opacity value (0-1)
 * @returns PPTX transparency value (0-100)
 */
export function opacityToTransparency(opacity: number): number {
  return Math.round((1 - Math.max(0, Math.min(1, opacity))) * 100);
}

/**
 * Convert PPTX transparency (0-100) to opacity (0-1)
 * @param transparency - PPTX transparency value (0-100)
 * @returns Opacity value (0-1)
 */
export function transparencyToOpacity(transparency: number): number {
  return 1 - Math.max(0, Math.min(100, transparency)) / 100;
}

/**
 * Add alpha transparency to hex color (for CSS/frontend use)
 * @param hex - Hex color string
 * @param alpha - Alpha value (0-1)
 * @returns Hex color with alpha (8-digit)
 */
export function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const [r, g, b] = clean.split("").map((c) => c + c);
    return `#${r}${g}${b}${a}`;
  }
  if (clean.length === 6) return `#${clean}${a}`;
  return hex;
}

/**
 * Pixel to inch conversion (96 DPI standard)
 */
export const PX_PER_INCH = 96;

/**
 * Convert pixels to inches
 * @param px - Pixel value
 * @returns Inch value
 */
export function pxToIn(px: number): number {
  return px / PX_PER_INCH;
}

/**
 * Convert inches to pixels
 * @param inches - Inch value
 * @returns Pixel value
 */
export function inToPx(inches: number): number {
  return inches * PX_PER_INCH;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateWithEllipsis(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Calculate optimal font size based on available space
 * @param text - Text to measure
 * @param maxWidth - Maximum width in pixels
 * @param baseFontSize - Base font size
 * @returns Optimal font size
 */
export function calculateOptimalFontSize(
  text: string,
  maxWidth: number,
  baseFontSize: number = 16
): number {
  const charWidth = baseFontSize * 0.6;
  const estimatedWidth = text.length * charWidth;
  if (estimatedWidth <= maxWidth) return baseFontSize;
  return Math.max(8, Math.floor((maxWidth / estimatedWidth) * baseFontSize));
}

/**
 * Map API errors to user-friendly messages
 * @param error - Error object or message
 * @returns User-friendly error message
 */
export function mapErrorToMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    if (error.message.includes("network")) {
      return "Network error. Please check your connection.";
    }
    if (error.message.includes("401") || error.message.includes("unauthorized")) {
      return "Authentication failed. Please refresh and try again.";
    }
    if (error.message.includes("429") || error.message.includes("rate limit")) {
      return "Too many requests. Please wait a moment and try again.";
    }
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}

/**
 * Calculate grid cell dimensions
 * @param totalWidth - Total width in inches
 * @param totalHeight - Total height in inches
 * @param cols - Number of columns
 * @param rows - Number of rows
 * @param gutter - Gutter size in inches
 * @param margin - Margin object {t, r, b, l} in inches
 * @returns Cell dimensions {width, height} in inches
 */
export function calculateCellDimensions(
  totalWidth: number,
  totalHeight: number,
  cols: number,
  rows: number,
  gutter: number,
  margin: { t: number; r: number; b: number; l: number }
): { width: number; height: number } {
  const availableWidth = totalWidth - margin.l - margin.r - gutter * (cols - 1);
  const availableHeight = totalHeight - margin.t - margin.b - gutter * (rows - 1);
  return {
    width: availableWidth / cols,
    height: availableHeight / rows,
  };
}

/**
 * Calculate region position in grid
 * @param rowStart - Starting row (1-indexed)
 * @param colStart - Starting column (1-indexed)
 * @param rowSpan - Number of rows to span
 * @param colSpan - Number of columns to span
 * @param cellWidth - Width of each cell in inches
 * @param cellHeight - Height of each cell in inches
 * @param gutter - Gutter size in inches
 * @param margin - Margin object in inches
 * @returns Position {x, y, width, height} in inches
 */
export function calculateRegionPosition(
  rowStart: number,
  colStart: number,
  rowSpan: number,
  colSpan: number,
  cellWidth: number,
  cellHeight: number,
  gutter: number,
  margin: { t: number; r: number; b: number; l: number }
): { x: number; y: number; width: number; height: number } {
  const x = margin.l + (colStart - 1) * (cellWidth + gutter);
  const y = margin.t + (rowStart - 1) * (cellHeight + gutter);
  const width = colSpan * cellWidth + (colSpan - 1) * gutter;
  const height = rowSpan * cellHeight + (rowSpan - 1) * gutter;
  return { x, y, width, height };
}
