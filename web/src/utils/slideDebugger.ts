/**
 * Slide Debugger - Diagnostic tool for slide rendering issues
 * Logs detailed information about spec structure and rendering
 */

import type { SlideSpecV1 } from "@/types/SlideSpecV1";

export interface DiagnosticReport {
  specVersion: string;
  gridConfig: {
    rows: number;
    cols: number;
    gutter: number;
    margin: { t: number; r: number; b: number; l: number };
  };
  regions: Array<{
    name: string;
    position: { rowStart: number; colStart: number };
    span: { rowSpan: number; colSpan: number };
  }>;
  anchors: Array<{
    refId: string;
    region: string;
    order: number;
  }>;
  content: {
    title?: { id: string; text: string; length: number };
    subtitle?: { id: string; text: string; length: number };
    bullets?: Array<{ id: string; itemCount: number }>;
    callouts?: Array<{ id: string; text: string }>;
  };
  styleTokens: {
    palette: { primary: string; accent: string; neutralCount: number };
    typography: {
      fonts: { sans: string };
      sizes: Record<string, number>;
      weights: Record<string, number>;
    };
  };
  issues: string[];
}

export function generateDiagnosticReport(spec: SlideSpecV1): DiagnosticReport {
  const issues: string[] = [];

  // Validate grid config
  if (!spec.layout.grid) {
    issues.push("❌ Missing layout.grid configuration");
  }

  // Validate regions
  if (!spec.layout.regions || spec.layout.regions.length === 0) {
    issues.push("❌ No regions defined");
  }

  // Validate anchors
  if (!spec.layout.anchors || spec.layout.anchors.length === 0) {
    issues.push("❌ No anchors defined");
  }

  // Check for orphaned anchors (anchors without matching regions)
  const regionNames = new Set(spec.layout.regions?.map(r => r.name) || []);
  spec.layout.anchors?.forEach(anchor => {
    if (!regionNames.has(anchor.region)) {
      issues.push(`⚠️  Anchor "${anchor.refId}" references non-existent region "${anchor.region}"`);
    }
  });

  // Check for content without anchors
  const anchorRefIds = new Set(spec.layout.anchors?.map(a => a.refId) || []);
  if (spec.content.title && !anchorRefIds.has(spec.content.title.id)) {
    issues.push(`⚠️  Title has no anchor (id: ${spec.content.title.id})`);
  }
  if (spec.content.subtitle && !anchorRefIds.has(spec.content.subtitle.id)) {
    issues.push(`⚠️  Subtitle has no anchor (id: ${spec.content.subtitle.id})`);
  }

  // Check for long text that might overflow
  if (spec.content.title?.text.length > 100) {
    issues.push(`⚠️  Title text is very long (${spec.content.title.text.length} chars)`);
  }

  return {
    specVersion: spec.meta.version,
    gridConfig: spec.layout.grid,
    regions: spec.layout.regions.map(r => ({
      name: r.name,
      position: { rowStart: r.rowStart, colStart: r.colStart },
      span: { rowSpan: r.rowSpan, colSpan: r.colSpan },
    })),
    anchors: spec.layout.anchors.map(a => ({
      refId: a.refId,
      region: a.region,
      order: a.order,
    })),
    content: {
      title: spec.content.title ? {
        id: spec.content.title.id,
        text: spec.content.title.text.substring(0, 50),
        length: spec.content.title.text.length,
      } : undefined,
      subtitle: spec.content.subtitle ? {
        id: spec.content.subtitle.id,
        text: spec.content.subtitle.text.substring(0, 50),
        length: spec.content.subtitle.text.length,
      } : undefined,
      bullets: spec.content.bullets?.map(b => ({
        id: b.id,
        itemCount: b.items.length,
      })),
      callouts: spec.content.callouts?.map(c => ({
        id: c.id,
        text: c.text.substring(0, 30),
      })),
    },
    styleTokens: {
      palette: {
        primary: spec.styleTokens.palette.primary,
        accent: spec.styleTokens.palette.accent,
        neutralCount: spec.styleTokens.palette.neutral.length,
      },
      typography: {
        fonts: { sans: spec.styleTokens.typography.fonts.sans },
        sizes: spec.styleTokens.typography.sizes,
        weights: spec.styleTokens.typography.weights,
      },
    },
    issues,
  };
}

export function logDiagnostics(spec: SlideSpecV1): void {
  const report = generateDiagnosticReport(spec);
  
  console.group("🔍 Slide Diagnostics Report");
  console.log("Spec Version:", report.specVersion);
  console.log("Grid Config:", report.gridConfig);
  console.log("Regions:", report.regions);
  console.log("Anchors:", report.anchors);
  console.log("Content:", report.content);
  console.log("Style Tokens:", report.styleTokens);
  
  if (report.issues.length > 0) {
    console.group("⚠️  Issues Found");
    report.issues.forEach(issue => console.log(issue));
    console.groupEnd();
  } else {
    console.log("✅ No issues detected");
  }
  
  console.groupEnd();
}

export function validateLayoutCalculations(spec: SlideSpecV1): void {
  const { rows, cols, gutter, margin } = spec.layout.grid;
  const SLIDE_WIDTH = 10; // inches
  const SLIDE_HEIGHT = 7.5; // inches

  const pxToIn = (px: number) => (px * 0.75) / 72;
  const marginTop = pxToIn(margin.t);
  const marginRight = pxToIn(margin.r);
  const marginBottom = pxToIn(margin.b);
  const marginLeft = pxToIn(margin.l);
  const gutterIn = pxToIn(gutter);

  const gridWidth = SLIDE_WIDTH - marginLeft - marginRight;
  const gridHeight = SLIDE_HEIGHT - marginTop - marginBottom;
  const cellWidth = (gridWidth - (cols - 1) * gutterIn) / cols;
  const cellHeight = (gridHeight - (rows - 1) * gutterIn) / rows;

  console.group("📐 Layout Calculations");
  console.log("Slide dimensions: 10in × 7.5in");
  console.log("Margins (in):", { top: marginTop.toFixed(2), right: marginRight.toFixed(2), bottom: marginBottom.toFixed(2), left: marginLeft.toFixed(2) });
  console.log("Grid dimensions (in):", { width: gridWidth.toFixed(2), height: gridHeight.toFixed(2) });
  console.log("Cell dimensions (in):", { width: cellWidth.toFixed(2), height: cellHeight.toFixed(2) });
  console.log("Gutter (in):", gutterIn.toFixed(2));
  console.groupEnd();
}

