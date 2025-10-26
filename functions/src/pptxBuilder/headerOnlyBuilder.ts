/**
 * Professional PPTX Builders
 * - Back-compat: buildHeaderOnlySlide()
 * - Universal: buildSlideFromSpec() renders a full SlideSpecV1 using a grid engine
 *
 * Notes:
 * - Uses 72dpi px→in conversion (32px ≈ 0.44in)
 * - Honors layout.grid (rows/cols/gutter/margin) and layout.anchors (order/region)
 * - Supports charts: bar | line | pie | doughnut | area | scatter
 *   (Other kinds fall back to a styled placeholder)
 * - Premium accents with proper PPTX transparency (0..100) instead of 8-digit hex
 * - Optional image blocks (content.images) with URL loading
 */

import PptxGenJS from "pptxgenjs";
import { fetch as undiciFetch } from "undici";
import type { SlideSpecV1, ChartKind } from "@plzfixthx/slide-spec";
import { calculateOptimalFontSize, truncateWithEllipsis } from "../typographyEnhancer";
import { optimizeImage } from "../imageOptimizer";

/* -------------------------------------------------------------------------- */
/*                        Back-compat: simple header slide                     */
/* -------------------------------------------------------------------------- */

export interface HeaderOnlySlideSpec {
  header: string;
  subtitle: string;
  color: string;
}

/**
 * Legacy title/subtitle slide (clean, professional)
 */
export async function buildHeaderOnlySlide(
  pptx: PptxGenJS,
  spec: HeaderOnlySlideSpec
): Promise<void> {
  const slide = pptx.addSlide();
  const primaryColor = spec.color || "#6366F1";
  const subtitleColor = "#64748B";
  const backgroundColor = "#FFFFFF";

  slide.background = { color: backgroundColor };

  // Left accent bar ~0.12in
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.17,
    h: getSlideDims(pptx).h,
    fill: { color: primaryColor },
    line: { type: "none" },
  });

  // Header
  slide.addText(
    spec.header,
    {
      x: 0.5,
      y: 1.8,
      w: 9.0,
      h: 1.2,
      fontSize: 26,
      bold: true,
      fontFace: "Aptos, Calibri, Arial",
      color: primaryColor,
      align: "left",
      valign: "top",
      wrap: true,
    } as any
  );

  // Subtitle
  slide.addText(
    spec.subtitle,
    {
      x: 0.5,
      y: 3.1,
      w: 9.0,
      h: 1.5,
      fontSize: 16,
      fontFace: "Aptos, Calibri, Arial",
      color: subtitleColor,
      align: "left",
      valign: "top",
      wrap: true,
    } as any
  );
}

/* -------------------------------------------------------------------------- */
/*                      Universal slide builder for V1 spec                    */
/* -------------------------------------------------------------------------- */

export async function buildSlideFromSpec(
  pptx: PptxGenJS,
  spec: SlideSpecV1
): Promise<void> {
  const slide = pptx.addSlide();
  const dims = getSlideDims(pptx);
  const grid = computeGrid(spec, dims);

  // --- Background & premium accents -----------------------------------------
  const palette = spec.styleTokens?.palette ?? {
    primary: "#6366F1",
    accent: "#EC4899",
    neutral: [
      "#0F172A",
      "#1E293B",
      "#334155",
      "#475569",
      "#64748B",
      "#94A3B8",
      "#CBD5E1",
      "#E2E8F0",
      "#FFFFFF",
    ],
  };
  const bg = palette.neutral?.[palette.neutral.length - 1] ?? "#FFFFFF";
  slide.background = { color: bg };

  // Left accent bar (0.12in)
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.12,
    h: dims.h,
    fill: { color: palette.primary || "#6366F1" },
    line: { type: "none" },
  });

  // Subtle top-right glaze (10% opacity)
  slide.addShape(pptx.ShapeType.rect, {
    x: dims.w - 3.2,
    y: 0.2,
    w: 3.0,
    h: 1.0,
    fill: { color: palette.accent || "#EC4899", transparency: opacityToTransparency(0.10) },
    line: { type: "none" },
    rectRadius: 12,
  });

  // Premium vertical accent line (very faint)
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.22,
    y: 0.08,
    w: 0.04,
    h: Math.max(0, dims.h - 0.16),
    fill: { color: palette.accent || "#EC4899", transparency: opacityToTransparency(0.88) },
    line: { type: "none" },
    rectRadius: 2,
  });

  // --- Render by regions/anchors --------------------------------------------
  const anchorsByRegion = groupAnchorsByRegion(spec);
  const fontSans = safeFont(spec.styleTokens?.typography?.fonts?.sans);

  for (const region of spec.layout.regions) {
    const regionRect = gridRect(region, grid);

    // simple flow within region
    let cursorY = regionRect.y + 0.08;
    const innerX = regionRect.x + 0.08;
    const innerW = Math.max(0, regionRect.w - 0.16);
    const flowGap = 0.12;

    const anchors = (anchorsByRegion.get(region.name) || []).sort(
      (a, b) => a.order - b.order
    );

    for (const anchor of anchors) {
      const type = resolveAnchorType(spec, anchor.refId);
      if (!type) continue;

      const remaining = regionRect.y + regionRect.h - cursorY;
      const H = preferredHeight(type, remaining);

      switch (type) {
        case "title": {
          const title = spec.content.title!;
          const base = clampNum(
            spec.styleTokens?.typography?.sizes?.step_3 ?? 44,
            24,
            44
          );
          // Use enhanced typography calculation with binary search
          const titleSize = calculateOptimalFontSize(title.text, innerW, H, base, 22, 1.2);

          // Apply ellipsis if text still doesn't fit
          const titleText = truncateWithEllipsis(title.text, innerW, H, titleSize, 1.2);

          slide.addText(
            titleText,
            {
              x: innerX,
              y: cursorY,
              w: innerW,
              h: H,
              fontFace: fontSans,
              fontSize: titleSize,
              bold: true,
              color: palette.primary || "#1E40AF",
              align: spec.components?.title?.align ?? "left",
              valign: "top",
              paraSpaceAfter: 8,
              lineSpacingMultiple: 1.2,
              letterSpacing: -0.02,
              wrap: true,
            } as any
          );

          // Divider + accent dot
          const dividerWidth = Math.min(2.8, innerW * 0.45);
          slide.addShape(pptx.ShapeType.rect, {
            x: innerX,
            y: cursorY + Math.min(H, 0.6),
            w: dividerWidth,
            h: 0.06,
            fill: { color: palette.primary || "#1E40AF" },
            line: { type: "none" },
          });
          slide.addShape(pptx.ShapeType.ellipse, {
            x: innerX + dividerWidth + 0.18,
            y: cursorY + Math.min(H, 0.62),
            w: 0.09,
            h: 0.09,
            fill: { color: palette.accent || "#F59E0B" },
            line: { type: "none" },
          });
          break;
        }

        case "subtitle": {
          const subtitle = spec.content.subtitle!;
          const base = clampNum(
            spec.styleTokens?.typography?.sizes?.step_1 ?? 20,
            14,
            24
          );
          // Use enhanced typography calculation with binary search
          const subtitleSize = calculateOptimalFontSize(
            subtitle.text,
            innerW,
            H,
            base,
            14,
            1.3
          );

          // Apply ellipsis if text still doesn't fit
          const subtitleText = truncateWithEllipsis(subtitle.text, innerW, H, subtitleSize, 1.3);

          const subtitleColor =
            (palette.neutral && palette.neutral[3]) || "#64748B";

          slide.addText(
            subtitleText,
            {
              x: innerX,
              y: cursorY,
              w: innerW,
              h: H,
              fontFace: fontSans,
              fontSize: subtitleSize,
              color: subtitleColor,
              align: "left",
              valign: "top",
              paraSpaceAfter: 6,
              lineSpacingMultiple: 1.3,
              letterSpacing: -0.01,
              wrap: true,
            } as any
          );
          break;
        }

        case "bullets": {
          const group = spec.content.bullets!.find((b) => b.id === anchor.refId)!;
          const bulletParas = (group.items || []).map((it) => ({
            text: it.text,
            options: {
              indentLevel: Math.max(0, (it.level || 1) - 1), // pptxgenjs: 0-based
              color:
                it.level === 1
                  ? palette.primary || "#1E40AF"
                  : it.level === 2
                  ? (palette.neutral && palette.neutral[2]) || "#334155"
                  : (palette.neutral && palette.neutral[3]) || "#475569",
              bold: it.level === 1,
              fontSize: it.level === 1 ? 14 : it.level === 2 ? 12 : 11,
            },
          }));

          const bodySize = clampNum(
            spec.styleTokens?.typography?.sizes?.step_0 ?? 16,
            12,
            14
          );

          slide.addText(
            bulletParas as any,
            {
              x: innerX,
              y: cursorY,
              w: innerW,
              h: H,
              fontFace: fontSans,
              fontSize: bodySize,
              color: (palette.neutral && palette.neutral[0]) || "#0F172A",
              bullet: true,
              paraSpaceAfter: 14, // Improved spacing for better readability
              lineSpacingMultiple: 1.5,
              wrap: true,
            } as any
          );
          break;
        }

        case "callout": {
          const callout = spec.content.callouts!.find(
            (c) => c.id === anchor.refId
          )!;
          const { bg, border, textColor } = calloutColors(
            callout.variant,
            palette
          );

          // Card background with subtle shadow effect
          slide.addShape(pptx.ShapeType.rect, {
            x: innerX,
            y: cursorY,
            w: innerW,
            h: H,
            fill: { color: bg },
            line: { color: border, width: 2 },
            rectRadius: 12,
            shadow: {
              type: "outer",
              blur: 8,
              offset: 2,
              angle: 45,
              color: "#000000",
              opacity: 0.1,
            },
          });

          // Left accent stripe (thicker for better visibility)
          slide.addShape(pptx.ShapeType.rect, {
            x: innerX,
            y: cursorY,
            w: 0.12,
            h: H,
            fill: { color: border },
            line: { type: "none" },
            rectRadius: 12,
          });

          const calloutSize = clampNum(
            spec.styleTokens?.typography?.sizes?.step_0 ?? 16,
            14,
            18
          );
          const calloutText = callout.title
            ? `${callout.title} — ${callout.text}`
            : callout.text;

          slide.addText(
            calloutText,
            {
              x: innerX + 0.32,
              y: cursorY + 0.2,
              w: Math.max(0, innerW - 0.56),
              h: Math.max(0, H - 0.4),
              fontFace: fontSans,
              fontSize: calloutSize,
              color: textColor,
              bold: !!callout.title,
              align: "left",
              valign: "top",
              lineSpacingMultiple: 1.4,
              wrap: true,
            } as any
          );
          break;
        }

        case "chart": {
          const viz = spec.content.dataViz!;
          const supported = mapChartKind(pptx, viz.kind);
          if (!supported) {
            // Graceful placeholder
            slide.addShape(pptx.ShapeType.rect, {
              x: innerX,
              y: cursorY,
              w: innerW,
              h: H,
              fill: {
                color: (palette.neutral && palette.neutral[6]) || "#E2E8F0",
              },
              line: { type: "none" },
              rectRadius: 8,
            });
            slide.addText(
              `[${viz.kind}] chart not supported in exporter yet`,
              {
                x: innerX,
                y: cursorY + H / 2 - 0.15,
                w: innerW,
                h: 0.3,
                fontFace: fontSans,
                fontSize: 12,
                color:
                  (palette.neutral && palette.neutral[3]) || "#64748B",
                align: "center",
                valign: "middle",
              } as any
            );
          } else {
            const chartData = (viz.series || []).map((s) => ({
              name: s.name,
              labels: viz.labels,
              values: s.values,
            }));
            const { valAxisFormatCode, dataLabelFormatCode } = mapFormatCodes(
              viz.valueFormat
            );

            slide.addChart(
              supported,
              chartData as any,
              {
                x: innerX,
                y: cursorY,
                w: innerW,
                h: H,
                showLegend: (spec.components?.chart?.legend ?? "top") !== "none",
                legendPos: toLegendPos(spec.components?.chart?.legend),
                catAxisLabelColor:
                  (palette.neutral && palette.neutral[3]) || "#64748B",
                valAxisLabelColor:
                  (palette.neutral && palette.neutral[3]) || "#64748B",
                dataLabelColor:
                  (palette.neutral && palette.neutral[3]) || "#64748B",
                barDir: "col",
                chartColors: chartSeriesColors(palette),
                catAxisMajorGridline:
                  spec.components?.chart?.gridlines ?? false,
                valAxisMajorGridline:
                  spec.components?.chart?.gridlines ?? false,
                valAxisFormatCode,
                dataLabelFormatCode,
                // Enable data labels if specified
                showValue: spec.components?.chart?.dataLabels ?? false,
                dataLabelPosition: spec.components?.chart?.dataLabels ? "bestFit" : undefined,
              } as any
            );
          }
          break;
        }

        case "image": {
          const img = spec.content.images!.find((i) => i.id === anchor.refId)!;
          const target = { x: innerX, y: cursorY, w: innerW, h: H };

          const buffer = await fetchImageBuffer(
            img.source?.type === "url" ? img.source.url : undefined
          );

          if (!buffer) {
            // Placeholder if fetch fails
            slide.addShape(pptx.ShapeType.rect, {
              x: target.x,
              y: target.y,
              w: target.w,
              h: target.h,
              fill: {
                color: (palette.neutral && palette.neutral[5]) || "#94A3B8",
                transparency: opacityToTransparency(0.26),
              },
              line: {
                color: (palette.neutral && palette.neutral[5]) || "#94A3B8",
                width: 1,
              },
              rectRadius: 8,
            });
            slide.addText(
              img.alt || "Image",
              {
                x: target.x,
                y: target.y + target.h / 2 - 0.2,
                w: target.w,
                h: 0.4,
                fontFace: fontSans,
                fontSize: 12,
                color:
                  (palette.neutral && palette.neutral[2]) || "#334155",
                align: "center",
                valign: "middle",
              } as any
            );
          } else {
            slide.addImage({
              data: buffer,
              x: target.x,
              y: target.y,
              w: target.w,
              h: target.h,
              sizing: {
                type: (img.fit || "cover") as any,
                w: target.w,
                h: target.h,
              },
            } as any);
          }
          break;
        }

        case "imagePlaceholder": {
          // Accessible placeholder (use transparency field, not 8-digit hex)
          const ph = spec.content.imagePlaceholders!.find(
            (p) => p.id === anchor.refId
          )!;
          slide.addShape(pptx.ShapeType.rect, {
            x: innerX,
            y: cursorY,
            w: innerW,
            h: H,
            fill: {
              color: (palette.neutral && palette.neutral[5]) || "#94A3B8",
              transparency: opacityToTransparency(0.26),
            },
            line: {
              color: (palette.neutral && palette.neutral[5]) || "#94A3B8",
              width: 1,
            },
            rectRadius: 8,
          });
          slide.addText(
            ph.alt,
            {
              x: innerX,
              y: cursorY + H / 2 - 0.2,
              w: innerW,
              h: 0.4,
              fontFace: fontSans,
              fontSize: 12,
              color: (palette.neutral && palette.neutral[2]) || "#334155",
              align: "center",
              valign: "middle",
            } as any
          );
          break;
        }
      }

      cursorY += H + flowGap;
      if (cursorY > regionRect.y + regionRect.h - 0.1) break; // avoid overflow
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                   */
/* -------------------------------------------------------------------------- */

type Dims = { w: number; h: number };

function getSlideDims(pptx: PptxGenJS): Dims {
  // PptxGenJS uses 10x5.625 (16:9) and 10x7.5 (4:3)
  const layout = (pptx.layout || "LAYOUT_16x9") as string;
  if (layout === "LAYOUT_4x3") return { w: 10, h: 7.5 };
  return { w: 10, h: 5.625 };
}

function pxToIn(px: number): number {
  return Math.round((px / 72) * 1000) / 1000;
}

function clampNum(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function safeFont(value?: string): string {
  return value?.trim() || "Aptos, Calibri, Arial, sans-serif";
}

/** Convert CSS-like opacity [0..1] to PPTX transparency [0..100] */
function opacityToTransparency(opacity: number): number {
  const o = clampNum(opacity, 0, 1);
  return Math.round((1 - o) * 100);
}



/** Compute grid geometry (inches) */
function computeGrid(spec: SlideSpecV1, dims: Dims) {
  const g = spec.layout.grid;
  const margins = {
    t: pxToIn(g.margin.t ?? 32),
    r: pxToIn(g.margin.r ?? 32),
    b: pxToIn(g.margin.b ?? 32),
    l: pxToIn(g.margin.l ?? 32),
  };
  const gutterIn = pxToIn(g.gutter ?? 8);

  const innerW = Math.max(0, dims.w - margins.l - margins.r);
  const innerH = Math.max(0, dims.h - margins.t - margins.b);

  const colW = (innerW - gutterIn * (g.cols - 1)) / g.cols;
  const rowH = (innerH - gutterIn * (g.rows - 1)) / g.rows;

  return {
    originX: margins.l,
    originY: margins.t,
    gutterIn,
    colW,
    rowH,
  };
}

function gridRect(
  region: { rowStart: number; colStart: number; rowSpan: number; colSpan: number },
  grid: { originX: number; originY: number; gutterIn: number; colW: number; rowH: number }
) {
  const x = grid.originX + (region.colStart - 1) * (grid.colW + grid.gutterIn);
  const y = grid.originY + (region.rowStart - 1) * (grid.rowH + grid.gutterIn);
  const w = region.colSpan * grid.colW + (region.colSpan - 1) * grid.gutterIn;
  const h = region.rowSpan * grid.rowH + (region.rowSpan - 1) * grid.gutterIn;
  return { x, y, w, h };
}

type RegionKey = SlideSpecV1["layout"]["regions"][number]["name"];
type Anchor = SlideSpecV1["layout"]["anchors"][number];

function groupAnchorsByRegion(spec: SlideSpecV1) {
  const map = new Map<RegionKey, Anchor[]>();
  for (const a of spec.layout.anchors) {
    map.set(a.region, [...(map.get(a.region) || []), a]);
  }
  return map;
}

type AnchorType =
  | "title"
  | "subtitle"
  | "bullets"
  | "callout"
  | "chart"
  | "image"
  | "imagePlaceholder";

function resolveAnchorType(spec: SlideSpecV1, refId: string): AnchorType | null {
  if (spec.content.title?.id === refId) return "title";
  if (spec.content.subtitle?.id === refId) return "subtitle";
  if (spec.content.bullets?.some((b) => b.id === refId)) return "bullets";
  if (spec.content.callouts?.some((c) => c.id === refId)) return "callout";
  if (spec.content.dataViz?.id === refId) return "chart";
  if (spec.content.images?.some((i) => i.id === refId)) return "image";
  if (spec.content.imagePlaceholders?.some((p) => p.id === refId))
    return "imagePlaceholder";
  return null;
}

function preferredHeight(type: AnchorType, remaining: number): number {
  switch (type) {
    case "title":
      return clampNum(0.65, 0.55, Math.min(0.85, remaining));
    case "subtitle":
      return clampNum(0.45, 0.35, Math.min(0.65, remaining));
    case "bullets":
      return Math.max(remaining - 0.2, 2.0);
    case "callout":
      return clampNum(0.9, 0.6, Math.min(1.1, remaining));
    case "chart":
      return Math.max(1.6, remaining);
    case "image":
    case "imagePlaceholder":
      return clampNum(Math.min(remaining, 3.0), 1.2, 3.0);
  }
}

/* ---------------------------- Charts & formatting --------------------------- */

function mapChartKind(pptx: PptxGenJS, kind?: ChartKind | string | null) {
  const k = (kind || "bar").toString().toLowerCase();
  const T = pptx.ChartType;
  switch (k) {
    case "bar":
      return T.bar;
    case "line":
      return T.line;
    case "pie":
      return T.pie;
    case "doughnut":
      return T.doughnut;
    case "area":
      return T.area;
    case "scatter":
      return T.scatter;
    case "combo":
      // Combo chart: first series as column, second as line
      return T.bar; // Use bar as base, will be enhanced with line overlay
    case "waterfall":
      // Waterfall chart (if supported by pptxgenjs)
      return T.bar; // Fallback to bar
    case "funnel":
      // Funnel chart (if supported by pptxgenjs)
      return T.bar; // Fallback to bar
    default:
      return null;
  }
}

function toLegendPos(pos?: "none" | "right" | "bottom") {
  if (pos === "right") return "r";
  if (pos === "bottom") return "b";
  return "t";
}

function chartSeriesColors(palette: SlideSpecV1["styleTokens"]["palette"]): string[] {
  const neutral = palette.neutral || [];
  const base = [
    palette.primary,
    palette.accent,
    neutral[2],
    neutral[3],
    neutral[4],
    neutral[5],
  ].filter(Boolean) as string[];
  return base;
}

type ValueFormat = NonNullable<SlideSpecV1["content"]["dataViz"]>["valueFormat"];
function mapFormatCodes(fmt: ValueFormat | undefined): {
  valAxisFormatCode?: string;
  dataLabelFormatCode?: string;
} {
  switch (fmt) {
    case "percent":
      return { valAxisFormatCode: "0%", dataLabelFormatCode: "0%" };
    case "currency":
      return { valAxisFormatCode: "$#,##0", dataLabelFormatCode: "$#,##0" };
    case "number":
      return { valAxisFormatCode: "0", dataLabelFormatCode: "0" };
    case "auto":
    default:
      return {};
  }
}

/* ------------------------------ Callout colors ------------------------------ */

function calloutColors(
  variant: "note" | "success" | "warning" | "danger",
  palette: SlideSpecV1["styleTokens"]["palette"]
) {
  switch (variant) {
    case "success":
      return {
        bg: "#D1FAE5",
        border: palette.accent || "#10B981",
        textColor: "#065F46",
      };
    case "warning":
      return { bg: "#FEF3C7", border: "#F59E0B", textColor: "#78350F" };
    case "danger":
      return { bg: "#FEE2E2", border: "#EF4444", textColor: "#7F1D1D" };
    case "note":
    default:
      return {
        bg: "#F3F4F6",
        border: palette.accent || "#EC4899",
        textColor: "#1F2937",
      };
  }
}

/* ------------------------------- Image loader ------------------------------- */

/**
 * Fetch an image as Buffer for embedding with exponential backoff retry.
 * Optimizes image (downscale to 96dpi, convert to JPEG quality 82).
 * Returns null on failure after retries.
 * Only supports source.type === "url" here; other source types fall back to placeholder.
 */
async function fetchImageBuffer(url?: string, maxRetries = 2): Promise<Buffer | null> {
  if (!url) return null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutMs = 4000 + attempt * 1000; // Increase timeout on retry
      const t = setTimeout(() => controller.abort(), timeoutMs);

      const res = await undiciFetch(url, { signal: controller.signal });
      clearTimeout(t);

      if (!res.ok) {
        // Don't retry on 4xx errors
        if (res.status >= 400 && res.status < 500) return null;
        // Retry on 5xx or network errors
        if (attempt < maxRetries) continue;
        return null;
      }

      const contentType = res.headers.get("content-type") || "";
      if (!/^image\//i.test(contentType)) return null;

      const ab = await res.arrayBuffer();
      const buffer = Buffer.from(ab);

      // Optimize image: downscale to 96dpi, convert to JPEG (quality 82) unless PNG transparency needed
      const optimized = await optimizeImage(buffer, url);
      return optimized;
    } catch (e) {
      // Retry on network errors
      if (attempt < maxRetries) {
        // Exponential backoff: 100ms, 200ms, 400ms
        await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        continue;
      }
      return null;
    }
  }

  return null;
}