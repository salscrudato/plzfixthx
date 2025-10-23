export type AspectRatio = "16:9" | "4:3";
export type RegionName = "header" | "body" | "footer" | "aside";
export type ChartKind = "bar" | "line" | "pie";

export interface SlideSpecV1 {
  meta: {
    version: "1.0";
    locale: string;
    theme: string;
    aspectRatio: AspectRatio;
  };
  content: {
    title: { id: string; text: string };
    subtitle?: { id: string; text: string };
    bullets?: { id: string; items: { text: string; level: 1 | 2 | 3 }[] }[];
    callouts?: { id: string; title?: string; text: string; variant: "note"|"success"|"warning"|"danger" }[];
    dataViz?: {
      id: string; kind: ChartKind; title?: string; labels: string[];
      series: { name: string; values: number[] }[]; valueFormat?: "number"|"percent"|"currency"|"auto";
    };
    imagePlaceholders?: { id: string; role: "hero" | "logo" | "illustration" | "icon"; alt: string }[];
  };
  layout: {
    grid: { rows: number; cols: number; gutter: number; margin: { t: number; r: number; b: number; l: number } };
    regions: { name: RegionName; rowStart: number; colStart: number; rowSpan: number; colSpan: number }[];
    anchors: { refId: string; region: RegionName; order: number; span?: { rows: number; cols: number } }[];
  };
  styleTokens: {
    palette: { primary: string; accent: string; neutral: string[] };
    typography: {
      fonts: { sans: string; serif?: string; mono?: string };
      sizes: { "step_-2": number; "step_-1": number; step_0: number; step_1: number; step_2: number; step_3: number };
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

