/**
 * Modular Layout Builders for Professional PPTX Generation
 * Status: Optional helpers for bespoke layouts (legacy/experimental).
 *
 * All functions accept a LayoutBuilderContext and use consistent typography,
 * rich-text highlighting, and spacing. These are additive to the universal
 * grid-based renderer, and may be used for custom templates.
 */

import PptxGenJS from "pptxgenjs";

/* --------------------------------- Types ---------------------------------- */

export type Theme = {
  bg: string;
  fg: string;
  accent: string;
  muted: string;
  fontFace?: string;
};

export interface LayoutBuilderContext<Spec = Record<string, unknown>> {
  slide: PptxGenJS.Slide;
  spec: Spec;
  theme: Theme;
  topY: number;
}

/** Paragraph/Bullets/Columns/Metrics/Quote/Chart lightweight specs */
export type ParagraphLayoutSpec = { bullets?: string[]; accentWords?: string[] };
export type BulletsLayoutSpec = { bullets?: string[]; accentWords?: string[] };
export type ComparisonLayoutSpec = {
  columns?: { heading?: string; bullets?: string[] }[];
  accentWords?: string[];
};
export type MetricsLayoutSpec = {
  bullets?: string[];
  callouts?: { label: string; value: string }[];
  accentWords?: string[];
};
export type QuoteLayoutSpec = { bullets?: [string, ...string[]]; accentWords?: string[] };
export type ChartLayoutSpec = { bullets?: string[]; accentWords?: string[] };

/* --------------------------- Rich-text Utilities --------------------------- */

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Convert a plain string into a rich text run array, bolding and tinting the
 * listed accent words. Returns PptxGenJS IText[] compatible objects.
 */
export function highlightAccentWords(
  text: string,
  accentWords?: string[],
  accentColor?: string
): Array<{ text: string; options?: PptxGenJS.TextPropsOptions }> {
  if (!accentWords || accentWords.length === 0 || !text) {
    return [{ text }];
  }

  const pattern = new RegExp(
    `\\b(${accentWords.map(escapeRe).join("|")})\\b`,
    "gi"
  );

  const runs: Array<{ text: string; options?: PptxGenJS.TextPropsOptions }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const [found] = match;
    const start = match.index;

    if (start > lastIndex) {
      runs.push({ text: text.slice(lastIndex, start) });
    }
    runs.push({
      text: found,
      options: { bold: true, color: accentColor },
    });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    runs.push({ text: text.slice(lastIndex) });
  }

  return runs.length > 0 ? runs : [{ text }];
}

/* --------------------------------- Layouts --------------------------------- */

/**
 * PARAGRAPH Layout: Narrative content with professional typography.
 */
export function buildParagraphLayout(
  ctx: LayoutBuilderContext<ParagraphLayoutSpec>
) {
  const { slide, spec, theme, topY } = ctx;
  const fontFace = theme.fontFace || "Aptos, Calibri, Arial";
  const content = (spec.bullets || []).join("\n\n");
  if (!content) return;

  const runs = highlightAccentWords(content, spec.accentWords, theme.accent);
  slide.addText(runs as any, {
    x: 0.7,
    y: topY,
    w: 8.6,
    h: 4.8,
    fontSize: 14,
    color: theme.fg,
    fontFace,
    lineSpacing: 22,
    wrap: true,
  } as PptxGenJS.TextPropsOptions);
}

/**
 * BULLETS Layout: Key points with professional emphasis.
 */
export function buildBulletsLayout(ctx: LayoutBuilderContext<BulletsLayoutSpec>) {
  const { slide, spec, theme, topY } = ctx;
  const fontFace = theme.fontFace || "Aptos, Calibri, Arial";
  const items = spec.bullets || [];
  if (items.length === 0) return;

  // Build a single run array with newline separators to keep bullets aligned
  const newline = { text: "\n" };
  const runs = items.flatMap((b, i) => {
    const parts = highlightAccentWords(b, spec.accentWords, theme.accent);
    return i < items.length - 1 ? [...parts, newline] : parts;
  });

  slide.addText(runs as any, {
    x: 0.7,
    y: topY,
    w: 8.6,
    h: 4.8,
    bullet: true,
    fontSize: 12,
    color: theme.fg,
    fontFace,
    lineSpacing: 20,
    wrap: true,
  } as PptxGenJS.TextPropsOptions);
}

/**
 * COMPARISON Layout: Two-column comparison with visual balance.
 */
export function buildComparisonLayout(
  ctx: LayoutBuilderContext<ComparisonLayoutSpec>
) {
  const { slide, spec, theme, topY } = ctx;
  const cols = spec.columns || [];
  if (cols.length < 2) return;

  const colW = 4.3;
  const gap = 0.4;
  const x1 = 0.5;
  const x2 = x1 + colW + gap;
  const y = topY;
  const h = 4.5;
  const fontFace = theme.fontFace || "Aptos, Calibri, Arial";

  cols.forEach((col, idx) => {
    const x = idx ? x2 : x1;

    if (col.heading) {
      slide.addText(col.heading, {
        x,
        y,
        w: colW,
        fontSize: 16,
        bold: true,
        color: theme.accent,
        fontFace,
      });
    }

    if (col.bullets && col.bullets.length > 0) {
      const newline = { text: "\n" };
      const runs = col.bullets.flatMap((b, i) => {
        const parts = highlightAccentWords(b, spec.accentWords, theme.accent);
        return i < col.bullets!.length - 1 ? [...parts, newline] : parts;
      });

      slide.addText(runs as any, {
        x,
        y: col.heading ? y + 0.4 : y,
        w: colW,
        h,
        bullet: true,
        fontSize: 11,
        color: theme.fg,
        fontFace,
        lineSpacing: 18,
        wrap: true,
      } as PptxGenJS.TextPropsOptions);
    }
  });
}

/**
 * METRICS Layout: KPIs with visual emphasis and callouts.
 */
export function buildMetricsLayout(ctx: LayoutBuilderContext<MetricsLayoutSpec>) {
  const { slide, spec, theme, topY } = ctx;
  const fontFace = theme.fontFace || "Aptos, Calibri, Arial";

  if (spec.bullets && spec.bullets.length > 0) {
    const newline = { text: "\n" };
    const runs = spec.bullets.flatMap((b, i) => {
      const parts = highlightAccentWords(b, spec.accentWords, theme.accent);
      return i < spec.bullets!.length - 1 ? [...parts, newline] : parts;
    });

    slide.addText(runs as any, {
      x: 0.7,
      y: topY,
      w: 8.6,
      h: 3.2,
      bullet: true,
      fontSize: 12,
      color: theme.fg,
      fontFace,
      lineSpacing: 18,
      wrap: true,
    } as PptxGenJS.TextPropsOptions);
  }

  if (spec.callouts && spec.callouts.length > 0) {
    const calloutY = 5.2;
    let calloutX = 0.5;

    spec.callouts.forEach((c) => {
      const label = `${c.label}: ${c.value}`;
      slide.addText(label, {
        x: calloutX,
        y: calloutY,
        w: 2.5,
        h: 0.5,
        fontSize: 11,
        color: theme.accent,
        bold: true,
        fontFace,
        align: "left",
      });
      calloutX += 2.8;
    });
  }
}

/**
 * QUOTE Layout: Powerful statements with professional typography.
 */
export function buildQuoteLayout(ctx: LayoutBuilderContext<QuoteLayoutSpec>) {
  const { slide, spec, theme, topY } = ctx;
  const quoteText = spec.bullets?.[0];
  if (!quoteText) return;
  const fontFace = theme.fontFace || "Aptos, Calibri, Arial";

  // Leading decorative quote
  slide.addText('"', {
    x: 0.5,
    y: topY - 0.3,
    w: 0.5,
    fontSize: 48,
    color: theme.accent,
    fontFace,
    // Note: opacity not supported in PptxGenJS; use lighter color instead
  });

  // Quote body
  const runs = highlightAccentWords(quoteText, spec.accentWords, theme.accent);
  slide.addText(runs as any, {
    x: 0.9,
    y: topY,
    w: 8.2,
    h: 3.5,
    fontSize: 26,
    italic: true,
    color: theme.accent,
    fontFace,
    lineSpacing: 32,
    wrap: true,
  } as PptxGenJS.TextPropsOptions);

  // Trailing decorative quote
  slide.addText('"', {
    x: 8.5,
    y: topY + 2.8,
    w: 0.5,
    fontSize: 48,
    color: theme.accent,
    fontFace,
    // Note: opacity not supported in PptxGenJS; use lighter color instead
  });
}

/**
 * CHART Layout: Data visualization placeholder with professional styling.
 * (Use the universal grid builder for real charts; this is a visual scaffold.)
 */
export function buildChartLayout(ctx: LayoutBuilderContext<ChartLayoutSpec>) {
  const { slide, spec, theme, topY } = ctx;
  const fontFace = theme.fontFace || "Aptos, Calibri, Arial";

  // Placeholder frame
  slide.addText("[Chart/Visualization Area]", {
    x: 0.7,
    y: topY + 1.5,
    w: 8.6,
    h: 0.8,
    fontSize: 14,
    color: theme.muted,
    fontFace,
    align: "center",
    valign: "middle",
  });

  // Supporting bullets below chart
  if (spec.bullets && spec.bullets.length > 0) {
    const newline = { text: "\n" };
    const runs = spec.bullets.flatMap((b, i) => {
      const parts = highlightAccentWords(b, spec.accentWords, theme.accent);
      return i < spec.bullets!.length - 1 ? [...parts, newline] : parts;
    });

    slide.addText(runs as any, {
      x: 0.7,
      y: 4.2,
      w: 8.6,
      h: 1.8,
      bullet: true,
      fontSize: 11,
      color: theme.fg,
      fontFace,
      lineSpacing: 16,
      wrap: true,
    } as PptxGenJS.TextPropsOptions);
  }
}