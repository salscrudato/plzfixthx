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
 * - Applies a left accent bar and subtle neutral background
 */

import PptxGenJS from "pptxgenjs";
import type { SlideSpecV1 } from "../types/SlideSpecV1";

// -----------------------------------------------------------------------------
// Back-compat: simple header/subtitle slide
// -----------------------------------------------------------------------------

export interface HeaderOnlySlideSpec {
  header: string;
  subtitle: string;
  color: string;
}

/**
 * Build a header and subtitle slide (legacy)
 * Features: left accent bar, header (26px), subtitle (16px grey)
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
    h: getSlideHeightInches(pptx),
    fill: { color: primaryColor },
    line: { type: "none" },
  });

  // Header
  slide.addText(spec.header, {
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
  });

  // Subtitle
  slide.addText(spec.subtitle, {
    x: 0.5,
    y: 3.1,
    w: 9.0,
    h: 1.5,
    fontSize: 16,
    fontFace: "Aptos, Calibri, Arial",
    color: subtitleColor,
    align: "left",
    valign: "top",
  });
}

// -----------------------------------------------------------------------------
// Universal slide builder for SlideSpecV1
// -----------------------------------------------------------------------------

/**
 * Build a fully featured slide from SlideSpecV1.
 * Renders: background, left accent bar, title, subtitle, bullets, callouts, charts, placeholders.
 */
export async function buildSlideFromSpec(
  pptx: PptxGenJS,
  spec: SlideSpecV1
): Promise<void> {
  const slide = pptx.addSlide();
  const dims = getSlideDims(pptx);
  const grid = computeGrid(spec, dims);

  // --- Background & accent ---------------------------------------------------
  const palette = spec.styleTokens?.palette ?? {
    primary: "#6366F1",
    accent: "#EC4899",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0", "#F1F5F9", "#FFFFFF"],
  };

  const bg =
    palette.neutral?.[palette.neutral.length - 1] ??
    "#FFFFFF";

  slide.background = { color: bg };

  // Left accent bar (0.12in) - professional visual anchor
  const accentWidth = 0.12;
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: accentWidth,
    h: dims.h,
    fill: { color: palette.primary || "#6366F1" },
    line: { type: "none" },
  });

  // --- Render by regions/anchors --------------------------------------------
  const anchorsByRegion = groupAnchorsByRegion(spec);
  const fontSans = safeFont(spec.styleTokens?.typography?.fonts?.sans);

  for (const region of spec.layout.regions) {
    const regionRect = gridRect(region, grid);

    // Stack y-flow inside the region with small padding
    let cursorY = regionRect.y + 0.08; // inner padding top
    const innerX = regionRect.x + 0.08;
    const innerW = Math.max(0, regionRect.w - 0.16);
    const flowGap = 0.12;

    const anchors = (anchorsByRegion.get(region.name) || []).sort(
      (a, b) => a.order - b.order
    );

    for (const anchor of anchors) {
      const type = resolveAnchorType(spec, anchor.refId);
      if (!type) continue;

      // Heuristic heights (inches); chart expands to fill remaining
      const remaining = regionRect.y + regionRect.h - cursorY;
      const H = preferredHeight(type, remaining);

      switch (type) {
        case "title": {
          const title = spec.content.title!;
          // Clamp title size to 24-32px for proper fit on slide
          const titleSize = clampNum(spec.styleTokens?.typography?.sizes?.step_3 ?? 44, 24, 32);

          slide.addText(title.text, {
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
            lineSpacing: 1.2,
            charSpacing: 0,
            wrap: true,
          });

          // Premium divider under title
          const dividerWidth = Math.min(2.8, innerW * 0.45);
          slide.addShape(pptx.ShapeType.rect, {
            x: innerX,
            y: cursorY + Math.min(H, 0.60),
            w: dividerWidth,
            h: 0.06,
            fill: { color: palette.primary || "#1E40AF" },
            line: { type: "none" },
          });

          // Accent dot after divider
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
          const subtitleSize = clampNum(spec.styleTokens?.typography?.sizes?.step_1 ?? 20, 14, 18);
          const subtitleColor = (palette.neutral && palette.neutral[3]) || "#64748B";

          slide.addText(subtitle.text, {
            x: innerX,
            y: cursorY,
            w: innerW,
            h: H,
            fontFace: fontSans,
            fontSize: subtitleSize,
            bold: false,
            color: subtitleColor,
            align: "left",
            valign: "top",
            paraSpaceAfter: 6,
            lineSpacing: 1.3,
            charSpacing: 0,
            wrap: true,
          });
          break;
        }

        case "bullets": {
          const group = spec.content.bullets!.find(b => b.id === anchor.refId)!;
          const bulletParas = (group.items || []).map((it) => ({
            text: it.text,
            options: {
              // indentLevel is 0-based in pptxgenjs
              indentLevel: Math.max(0, (it.level || 1) - 1),
              // Level 1: primary color (bold), Level 2+: neutral text
              color: it.level === 1 ? (palette.primary || "#1E40AF") : ((palette.neutral && palette.neutral[2]) || "#334155"),
              bold: it.level === 1,
              fontSize: it.level === 1 ? 14 : (it.level === 2 ? 12 : 11),
            },
          }));

          const bodySize = clampNum(spec.styleTokens?.typography?.sizes?.step_0 ?? 16, 12, 14);

          slide.addText(bulletParas as any, {
            x: innerX,
            y: cursorY,
            w: innerW,
            h: H,
            fontFace: fontSans,
            fontSize: bodySize,
            color: (palette.neutral && palette.neutral[0]) || "#0F172A",
            bullet: true,
            paraSpaceAfter: 12,
            lineSpacing: 1.5,
            charSpacing: 0,
            wrap: true,
          });

          break;
        }

        case "callout": {
          const callout = spec.content.callouts!.find(c => c.id === anchor.refId)!;
          const { bg, border, textColor } = calloutColors(callout.variant, palette);

          // Background card
          slide.addShape(pptx.ShapeType.rect, {
            x: innerX,
            y: cursorY,
            w: innerW,
            h: H,
            fill: { color: bg },
            line: { color: border, width: 2 },
            rectRadius: 12,
          });

          // Left accent bar for callout
          slide.addShape(pptx.ShapeType.rect, {
            x: innerX,
            y: cursorY,
            w: 0.08,
            h: H,
            fill: { color: border },
            line: { type: "none" },
            rectRadius: 12,
          });

          const calloutSize = clampNum(spec.styleTokens?.typography?.sizes?.step_0 ?? 16, 14, 18);
          const calloutText = callout.title ? `${callout.title} — ${callout.text}` : callout.text;

          slide.addText(calloutText, {
            x: innerX + 0.28,
            y: cursorY + 0.18,
            w: Math.max(0, innerW - 0.50),
            h: Math.max(0, H - 0.36),
            fontFace: fontSans,
            fontSize: calloutSize,
            color: textColor,
            bold: !!callout.title,
            align: "left",
            valign: "top",
            lineSpacing: 22,
            charSpacing: 0.1,
          });
          break;
        }

        case "chart": {
          const viz = spec.content.dataViz!;
          const supported = mapChartKind(pptx, viz.kind);
          if (!supported) {
            // Styled placeholder for unsupported chart kinds
            slide.addShape(pptx.ShapeType.rect, {
              x: innerX,
              y: cursorY,
              w: innerW,
              h: H,
              fill: { color: ((palette.neutral && palette.neutral[6]) || "#E2E8F0") },
              line: { type: "none" },
              rectRadius: 8,
            });
            slide.addText(`[${viz.kind}] chart not supported in exporter yet`, {
              x: innerX,
              y: cursorY + H / 2 - 0.15,
              w: innerW,
              h: 0.3,
              fontFace: fontSans,
              fontSize: 12,
              color: (palette.neutral && palette.neutral[3]) || "#64748B",
              align: "center",
              valign: "middle",
            });
          } else {
            const chartData = (viz.series || []).map(s => ({
              name: s.name,
              labels: viz.labels,
              values: s.values,
            }));

            slide.addChart(supported, chartData as any, {
              x: innerX,
              y: cursorY,
              w: innerW,
              h: H,
              showLegend: spec.components?.chart?.legend !== "none",
              legendPos: toLegendPos(spec.components?.chart?.legend),
              catAxisLabelColor: (palette.neutral && palette.neutral[3]) || "#64748B",
              valAxisLabelColor: (palette.neutral && palette.neutral[3]) || "#64748B",
              dataLabelColor: (palette.neutral && palette.neutral[3]) || "#64748B",
              barDir: "col",
              // Gridlines subtle
              catAxisMajorGridline: spec.components?.chart?.gridlines ?? false,
              valAxisMajorGridline: spec.components?.chart?.gridlines ?? false,
            } as any);
          }
          break;
        }

        case "imagePlaceholder": {
          // Simple accessible placeholder
          slide.addShape(pptx.ShapeType.rect, {
            x: innerX,
            y: cursorY,
            w: innerW,
            h: H,
            fill: { color: ((palette.neutral && palette.neutral[5]) || "#94A3B8") + "44" },
            line: { color: (palette.neutral && palette.neutral[5]) || "#94A3B8", width: 1 },
            rectRadius: 8,
          });
          const ph = spec.content.imagePlaceholders!.find(p => p.id === anchor.refId)!;
          slide.addText(ph.alt, {
            x: innerX,
            y: cursorY + H / 2 - 0.2,
            w: innerW,
            h: 0.4,
            fontFace: fontSans,
            fontSize: 12,
            color: (palette.neutral && palette.neutral[2]) || "#334155",
            align: "center",
            valign: "middle",
          });
          break;
        }
      }

      cursorY += H + flowGap;
      if (cursorY > regionRect.y + regionRect.h - 0.1) break; // avoid overflow
    }
  }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

type Dims = { w: number; h: number };

function getSlideHeightInches(pptx: PptxGenJS): number {
  return getSlideDims(pptx).h;
}

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
  const f = value?.trim() || "Aptos, Calibri, Arial, sans-serif";
  return f;
}

/**
 * Compute grid geometry in inches from spec + slide dims
 */
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

function groupAnchorsByRegion(spec: SlideSpecV1) {
  const map = new Map<SlideSpecV1["layout"]["regions"][number]["name"], typeof spec.layout.anchors>();
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
  | "imagePlaceholder";

function resolveAnchorType(spec: SlideSpecV1, refId: string): AnchorType | null {
  if (spec.content.title?.id === refId) return "title";
  if (spec.content.subtitle?.id === refId) return "subtitle";
  if (spec.content.bullets?.some(b => b.id === refId)) return "bullets";
  if (spec.content.callouts?.some(c => c.id === refId)) return "callout";
  if (spec.content.dataViz?.id === refId) return "chart";
  if (spec.content.imagePlaceholders?.some(p => p.id === refId)) return "imagePlaceholder";
  return null;
}

function preferredHeight(type: AnchorType, remaining: number): number {
  switch (type) {
    case "title": return clampNum(0.65, 0.55, Math.min(0.85, remaining));
    case "subtitle": return clampNum(0.45, 0.35, Math.min(0.65, remaining));
    case "bullets": return Math.max(remaining - 0.2, 2.0); // Use most of remaining space
    case "callout": return clampNum(0.9, 0.6, Math.min(1.1, remaining));
    case "chart": return Math.max(1.6, remaining); // fill remainder by default
    case "imagePlaceholder": return clampNum(Math.min(remaining, 3.0), 1.2, 3.0);
  }
}

/**
 * Map SlideSpec chart kinds to PptxGenJS chart types
 */
function mapChartKind(pptx: PptxGenJS, kind?: SlideSpecV1["content"]["dataViz"] extends infer T ? T extends { kind: infer K } ? K : never : never) {
  const k = (kind || "bar").toString().toLowerCase();
  const T = pptx.ChartType;
  switch (k) {
    case "bar": return T.bar;
    case "line": return T.line;
    case "pie": return T.pie;
    case "doughnut": return T.doughnut;
    case "area": return T.area;
    case "scatter": return T.scatter;
    default: return null; // unsupported kinds fallback to placeholder
  }
}

function toLegendPos(pos?: "none" | "right" | "bottom") {
  if (pos === "right") return "r";
  if (pos === "bottom") return "b";
  return "t"; // default top; if "none" we disable via showLegend
}

function calloutColors(
  variant: "note" | "success" | "warning" | "danger",
  palette: SlideSpecV1["styleTokens"]["palette"]
) {
  switch (variant) {
    case "success":
      return { bg: "#D1FAE5", border: palette.accent || "#10B981", textColor: "#065F46" };
    case "warning":
      return { bg: "#FEF3C7", border: "#F59E0B", textColor: "#78350F" };
    case "danger":
      return { bg: "#FEE2E2", border: "#EF4444", textColor: "#7F1D1D" };
    case "note":
    default:
      return { bg: "#F3F4F6", border: palette.accent || "#EC4899", textColor: "#1F2937" };
  }
}