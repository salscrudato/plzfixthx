/**
 * Modular Layout Builders for Professional PPTX Generation
 * Each builder handles a specific layout type with expert-level design
 */

import PptxGenJS from "pptxgenjs";

export type Theme = { bg: string; fg: string; accent: string; muted: string };

export interface LayoutBuilderContext {
  slide: any;
  spec: any;
  theme: Theme;
  topY: number;
}

/**
 * Helper: Convert bullet text to rich text with accent word highlighting
 */
export function highlightAccentWords(text: string, accentWords?: string[], accentColor?: string): any[] {
  if (!accentWords || accentWords.length === 0) {
    return [{ text }];
  }

  const result: any[] = [];
  let remaining = text;
  let foundAny = false;

  for (const word of accentWords) {
    const regex = new RegExp(`(${word})`, "gi");
    const parts = remaining.split(regex);

    if (parts.length > 1) {
      foundAny = true;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].toLowerCase() === word.toLowerCase()) {
          result.push({ text: parts[i], color: accentColor, bold: true });
        } else if (parts[i]) {
          result.push({ text: parts[i] });
        }
      }
      remaining = "";
      break;
    }
  }

  if (!foundAny) {
    return [{ text }];
  }

  return result.length > 0 ? result : [{ text }];
}

/**
 * PARAGRAPH Layout: Narrative content with professional typography
 */
export function buildParagraphLayout(ctx: LayoutBuilderContext) {
  const { slide, spec, theme, topY } = ctx;

  if (spec.bullets && spec.bullets.length > 0) {
    const paragraphText = spec.bullets.join("\n\n");
    const bulletTexts = highlightAccentWords(paragraphText, spec.accentWords, theme.accent);

    slide.addText(bulletTexts, {
      x: 0.7,
      y: topY,
      w: 8.6,
      h: 4.8,
      fontSize: 14,
      color: theme.fg,
      fontFace: "Calibri",
      lineSpacing: 22,
    });
  }
}

/**
 * BULLETS Layout: Key points with professional emphasis
 */
export function buildBulletsLayout(ctx: LayoutBuilderContext) {
  const { slide, spec, theme, topY } = ctx;

  if (spec.bullets && spec.bullets.length > 0) {
    const bulletTexts = spec.bullets.flatMap((b: string) => [...highlightAccentWords(b, spec.accentWords, theme.accent), { text: "\n" }]);

    slide.addText(bulletTexts, {
      x: 0.7,
      y: topY,
      w: 8.6,
      h: 4.8,
      fontSize: 12,
      color: theme.fg,
      fontFace: "Calibri",
      bullet: true,
      lineSpacing: 20,
    });
  }
}

/**
 * COMPARISON Layout: Two-column comparison with visual balance
 */
export function buildComparisonLayout(ctx: LayoutBuilderContext) {
  const { slide, spec, theme, topY } = ctx;

  if (spec.columns && spec.columns.length >= 2) {
    const colW = 4.3;
    const gap = 0.4;
    const x1 = 0.5;
    const x2 = x1 + colW + gap;
    const y = topY;
    const h = 4.5;

    spec.columns.forEach((col: any, idx: number) => {
      const x = idx ? x2 : x1;

      // Column heading with accent color
      if (col.heading) {
        slide.addText(col.heading, {
          x,
          y,
          w: colW,
          fontSize: 16,
          bold: true,
          color: theme.accent,
          fontFace: "Calibri",
        });
      }

      // Column bullets
      if (col.bullets && col.bullets.length > 0) {
        const bulletTexts = col.bullets.flatMap((b: string) => [...highlightAccentWords(b, spec.accentWords, theme.accent), { text: "\n" }]);

        slide.addText(bulletTexts, {
          x,
          y: col.heading ? y + 0.4 : y,
          w: colW,
          h,
          fontSize: 11,
          color: theme.fg,
          fontFace: "Calibri",
          bullet: true,
          lineSpacing: 18,
        });
      }
    });
  }
}

/**
 * METRICS Layout: KPIs with visual emphasis and callouts
 */
export function buildMetricsLayout(ctx: LayoutBuilderContext) {
  const { slide, spec, theme, topY } = ctx;

  // Main content bullets
  if (spec.bullets && spec.bullets.length > 0) {
    const bulletTexts = spec.bullets.flatMap((b: string) => [...highlightAccentWords(b, spec.accentWords, theme.accent), { text: "\n" }]);

    slide.addText(bulletTexts, {
      x: 0.7,
      y: topY,
      w: 8.6,
      h: 3.2,
      fontSize: 12,
      color: theme.fg,
      fontFace: "Calibri",
      bullet: true,
      lineSpacing: 18,
    });
  }

  // KPI callouts at bottom
  if (spec.callouts && spec.callouts.length > 0) {
    const calloutY = 5.2;
    let calloutX = 0.5;
    const pad = 0.3;

    spec.callouts.forEach((c: any) => {
      const label = `${c.label}: ${c.value}`;

      // Text callout (simplified - no background shape for now)
      slide.addText(label, {
        x: calloutX,
        y: calloutY,
        w: 2.5,
        h: 0.5,
        fontSize: 11,
        color: theme.accent,
        bold: true,
        fontFace: "Calibri",
        align: "left",
      });

      calloutX += 2.8;
    });
  }
}

/**
 * QUOTE Layout: Powerful statements with professional typography
 */
export function buildQuoteLayout(ctx: LayoutBuilderContext) {
  const { slide, spec, theme, topY } = ctx;

  if (spec.bullets && spec.bullets[0]) {
    const quoteText = spec.bullets[0];
    const bulletTexts = highlightAccentWords(quoteText, spec.accentWords, theme.accent);

    // Quote mark styling
    slide.addText('"', {
      x: 0.5,
      y: topY - 0.3,
      w: 0.5,
      fontSize: 48,
      color: theme.accent,
      fontFace: "Calibri",
      opacity: 0.3,
    });

    // Quote text
    slide.addText(bulletTexts, {
      x: 0.9,
      y: topY,
      w: 8.2,
      h: 3.5,
      fontSize: 26,
      italic: true,
      color: theme.accent,
      fontFace: "Calibri",
      lineSpacing: 32,
    });

    // Closing quote mark
    slide.addText('"', {
      x: 8.5,
      y: topY + 2.8,
      w: 0.5,
      fontSize: 48,
      color: theme.accent,
      fontFace: "Calibri",
      opacity: 0.3,
    });
  }
}

/**
 * CHART Layout: Data visualization placeholder with professional styling
 */
export function buildChartLayout(ctx: LayoutBuilderContext) {
  const { slide, spec, theme, topY } = ctx;

  // Placeholder text
  slide.addText("[Chart/Visualization Area]", {
    x: 0.7,
    y: topY + 1.5,
    w: 8.6,
    h: 0.8,
    fontSize: 14,
    color: theme.muted,
    fontFace: "Calibri",
    align: "center",
    valign: "middle",
  });

  // Supporting bullets below chart
  if (spec.bullets && spec.bullets.length > 0) {
    const bulletTexts = spec.bullets.flatMap((b: string) => [...highlightAccentWords(b, spec.accentWords, theme.accent), { text: "\n" }]);

    slide.addText(bulletTexts, {
      x: 0.7,
      y: 4.2,
      w: 8.6,
      h: 1.8,
      fontSize: 11,
      color: theme.fg,
      fontFace: "Calibri",
      bullet: true,
      lineSpacing: 16,
    });
  }
}

