/** Aspect ratios supported by the deck */
export type AspectRatio = "16:9" | "4:3";

/** Named layout regions (grid areas) */
export type RegionName = "header" | "body" | "footer" | "aside";

/** Chart kinds supported by the universal builder/preview */
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

    bullets?: {
      id: string;
      items: { text: string; level: 1 | 2 | 3 }[];
    }[];

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

    /** For preview placeholders when real images are not yet resolved */
    imagePlaceholders?: {
      id: string;
      role: "hero" | "logo" | "illustration" | "icon" | "background";
      alt: string;
    }[];

    /** Concrete images (optional) with sourcing hints */
    images?: {
      id: string;
      role: "hero" | "logo" | "illustration" | "icon" | "background";
      source: {
        type: "url" | "unsplash" | "placeholder";
        url?: string;
        query?: string;
      };
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
    regions: {
      name: RegionName;
      rowStart: number;
      colStart: number;
      rowSpan: number;
      colSpan: number;
    }[];
    anchors: {
      refId: string;
      region: RegionName;
      order: number;
      span?: { rows: number; cols: number };
    }[];
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

/** Convenience alias for import symmetry with server */
export type SlideSpec = SlideSpecV1;