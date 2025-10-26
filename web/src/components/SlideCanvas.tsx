import { memo, useEffect, useMemo, useState } from "react";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

/* -------------------------------------------------------------------------- */
/*                                   Tokens                                   */
/* -------------------------------------------------------------------------- */

type Tokens = {
  palette: { primary: string; accent: string; neutral: string[] };
  typography: SlideSpecV1["styleTokens"]["typography"];
  pattern: NonNullable<SlideSpecV1["design"]>["pattern"] | "split";
};

const DEFAULT_NEUTRAL = [
  "#0F172A",
  "#1E293B",
  "#334155",
  "#475569",
  "#64748B",
  "#94A3B8",
  "#CBD5E1",
  "#E2E8F0",
  "#F8FAFC",
];

const HEX6 = /^#[0-9A-Fa-f]{6}$/;

/** Ensure primary, accent, and a 9‑step neutral ramp are always present/valid */
function normalizePalette(p?: SlideSpecV1["styleTokens"]["palette"]): Tokens["palette"] {
  const primary = p?.primary && HEX6.test(p.primary) ? p.primary : "#6366F1";
  const accent = p?.accent && HEX6.test(p.accent) ? p.accent : "#EC4899";

  let neutral = Array.isArray(p?.neutral) ? p!.neutral.filter((c): c is string => !!c && HEX6.test(c)) : [];
  if (neutral.length < 9) neutral = DEFAULT_NEUTRAL;

  return { primary, accent, neutral: neutral.slice(0, 9) };
}

function normalizeTypography(t?: SlideSpecV1["styleTokens"]["typography"]): Tokens["typography"] {
  return (
    t ?? {
      fonts: { sans: "Inter, Arial, sans-serif" },
      sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 24, step_3: 40 },
      weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeights: { compact: 1.2, standard: 1.5 },
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                              Main Slide Canvas                              */
/* -------------------------------------------------------------------------- */

export const SlideCanvas = memo(function SlideCanvas({ spec }: { spec: SlideSpecV1 }) {
  const [isVisible, setIsVisible] = useState(false);

  // soft enter animation on spec change
  useEffect(() => {
    setIsVisible(false);
    const t = setTimeout(() => setIsVisible(true), 40);
    return () => clearTimeout(t);
  }, [spec]);

  const tokens: Tokens = useMemo(() => {
    const palette = normalizePalette(spec.styleTokens?.palette);
    const typography = normalizeTypography(spec.styleTokens?.typography);
    const pattern = spec.design?.pattern ?? "split";
    return { palette, typography, pattern };
  }, [spec]);

  const aspect = spec.meta.aspectRatio === "4:3" ? "4 / 3" : "16 / 9";
  const slideStyle: React.CSSProperties = useMemo(
    () => ({
      background: getGradientBackground(tokens),
      color: tokens.palette.neutral[0],
    }),
    [tokens]
  );

  return (
    <div className="w-full">
      <div
        className={`relative w-full overflow-hidden rounded-2xl transition-all duration-500 shadow-2xl border border-white/10 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{ aspectRatio: aspect, ...slideStyle }}
        aria-label="Slide preview"
      >
        {/* Left accent bar */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            insetInlineStart: 0,
            top: 0,
            width: "0.12in",
            height: "100%",
            background: tokens.palette.primary,
            boxShadow: "3px 0 12px rgba(0,0,0,0.15)",
          }}
        />
        {/* Top-right glaze */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "0.2in",
            right: "0.2in",
            width: "3.0in",
            height: "1.0in",
            background: hexWithAlpha(tokens.palette.accent, 0.1),
            borderRadius: 12,
          }}
        />
        {/* Bottom accent block */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "0.8in",
            left: "0.3in",
            width: "2.5in",
            height: "0.6in",
            background: hexWithAlpha(tokens.palette.primary, 0.06),
            borderRadius: 8,
          }}
        />
        {/* Slim vertical accent line */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "0.08in",
            left: "0.22in",
            width: "0.04in",
            height: "calc(100% - 0.16in)",
            background: hexWithAlpha(tokens.palette.accent, 0.12),
            borderRadius: 2,
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            padding: 0,
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {renderRegions(spec, tokens)}
        </div>
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                                   Layout                                   */
/* -------------------------------------------------------------------------- */

function renderRegions(spec: SlideSpecV1, tokens: Tokens) {
  const { rows, cols, gutter, margin } = spec.layout.grid;

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gap: `${gutter}px`,
    padding: `${margin.t}px ${margin.r}px ${margin.b}px ${margin.l}px`,
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
    position: "relative",
  };

  const regionStyle = (r: SlideSpecV1["layout"]["regions"][number]): React.CSSProperties => ({
    gridRow: `${r.rowStart} / span ${r.rowSpan}`,
    gridColumn: `${r.colStart} / span ${r.colSpan}`,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
    justifyContent: "flex-start",
    alignItems: "stretch",
  });

  return (
    <div style={gridStyle}>
      {spec.layout.regions.map((r, idx) => {
        const anchors = spec.layout.anchors
          .filter((a) => a.region === r.name)
          .sort((a, b) => a.order - b.order);

        return (
          <div key={`${r.name}-${idx}`} style={regionStyle(r)}>
            {anchors.map((a) => (
              <ElementByRef key={a.refId} spec={spec} refId={a.refId} tokens={tokens} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Elements                                  */
/* -------------------------------------------------------------------------- */

const ElementByRef = memo(function ElementByRef({
  spec,
  refId,
  tokens,
}: {
  spec: SlideSpecV1;
  refId: string;
  tokens: Tokens;
}) {
  const c = spec.content;

  if (c.title?.id === refId) {
    return <Title text={c.title.text} tokens={tokens} align={spec.components?.title?.align} />;
  }
  if (c.subtitle?.id === refId) {
    return <Subtitle text={c.subtitle.text} tokens={tokens} />;
  }

  const bl = c.bullets?.find((x) => x.id === refId);
  if (bl) {
    return <Bullets items={bl.items} tokens={tokens} variant={spec.components?.bulletList?.variant} />;
  }

  const co = c.callouts?.find((x) => x.id === refId);
  if (co) {
    return <Callout item={co} tokens={tokens} variantCard={spec.components?.callout?.variant} />;
  }

  if (c.dataViz?.id === refId) {
    return <Chart spec={spec} tokens={tokens} />;
  }

  const img = c.images?.find((x) => x.id === refId);
  if (img) {
    return <ImageBlock item={img} tokens={tokens} />;
  }

  const ph = c.imagePlaceholders?.find((x) => x.id === refId);
  if (ph) {
    return <ImagePlaceholder alt={ph.alt} tokens={tokens} />;
  }

  return null;
});

/* ------------------------------- Typography -------------------------------- */

const Title = memo(function Title({
  text,
  tokens,
  align,
}: {
  text: string;
  tokens: Tokens;
  align?: "left" | "center" | "right";
}) {
  const s = tokens.typography.sizes;
  const w = tokens.typography.weights;
  const lh = tokens.typography.lineHeights;
  return (
    <h2
      style={{
        fontFamily: tokens.typography.fonts.sans,
        fontSize: `${s.step_3 ?? 44}px`,
        fontWeight: w.bold ?? 700,
        lineHeight: lh.compact ?? 1.2,
        color: tokens.palette.primary,
        margin: 0,
        marginBottom: "8px",
        textAlign: align ?? "left",
        letterSpacing: "0.5px",
        paddingBottom: "12px",
        borderBottom: `3px solid ${tokens.palette.primary}`,
        position: "relative",
      }}
    >
      {text}
      <span
        style={{
          display: "inline-block",
          width: "9px",
          height: "9px",
          borderRadius: "50%",
          backgroundColor: tokens.palette.accent,
          marginLeft: "12px",
          verticalAlign: "middle",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      />
    </h2>
  );
});

const Subtitle = memo(function Subtitle({ text, tokens }: { text: string; tokens: Tokens }) {
  const s = tokens.typography.sizes;
  const w = tokens.typography.weights;
  const lh = tokens.typography.lineHeights;
  return (
    <p
      style={{
        fontFamily: tokens.typography.fonts.sans,
        fontSize: `${s.step_1 ?? 20}px`,
        fontWeight: w.medium ?? 500,
        lineHeight: lh.standard ?? 1.5,
        color: tokens.palette.neutral[3] ?? "#64748B",
        margin: 0,
        marginTop: "4px",
        letterSpacing: "0.2px",
      }}
    >
      {text}
    </p>
  );
});

const Bullets = memo(function Bullets({
  items,
  tokens,
  variant,
}: {
  items: { text: string; level: 1 | 2 | 3 }[];
  tokens: Tokens;
  variant?: "compact" | "spacious";
}) {
  const s = tokens.typography.sizes;
  const w = tokens.typography.weights;
  const lh = tokens.typography.lineHeights;
  const gap = variant === "compact" ? 8 : 12;

  return (
    <ul
      role="list"
      style={{
        fontFamily: tokens.typography.fonts.sans,
        fontSize: `${s.step_0 ?? 16}px`,
        fontWeight: w.regular ?? 400,
        lineHeight: lh.standard ?? 1.5,
        color: tokens.palette.neutral[0] ?? "#0F172A",
        listStyle: "none",
        margin: 0,
        padding: 0,
      }}
    >
      {items.map((it, i) => {
        const isLevel1 = it.level === 1;
        const fontSize = isLevel1 ? 16 : it.level === 2 ? 14 : 12;
        const fontWeight = isLevel1 ? (w.semibold ?? 600) : (w.regular ?? 400);
        const color = isLevel1 ? tokens.palette.primary : tokens.palette.neutral[2] ?? "#334155";

        return (
          <li
            key={i}
            role="listitem"
            style={{
              marginLeft: `${(it.level - 1) * 24}px`,
              marginBottom: `${gap}px`,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              fontSize: `${fontSize}px`,
              fontWeight,
              color,
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: isLevel1 ? 7 : 5,
                height: isLevel1 ? 7 : 5,
                borderRadius: "50%",
                backgroundColor: isLevel1 ? tokens.palette.primary : tokens.palette.neutral[4],
                marginTop: isLevel1 ? 6 : 7,
                flexShrink: 0,
              }}
            />
            <span>{it.text}</span>
          </li>
        );
      })}
    </ul>
  );
});

const Callout = memo(function Callout({
  item,
  tokens,
  variantCard,
}: {
  item: NonNullable<SlideSpecV1["content"]["callouts"]>[number];
  tokens: Tokens;
  variantCard?: "flat" | "elevated";
}) {
  const variants = {
    warning: { bg: "#FEF3C7", border: "#F59E0B", text: "#78350F" },
    danger: { bg: "#FEE2E2", border: "#EF4444", text: "#7F1D1D" },
    success: { bg: "#D1FAE5", border: "#10B981", text: "#065F46" },
    note: { bg: "#F3F4F6", border: tokens.palette.accent, text: "#1F2937" },
  } as const;

  const v = variants[item.variant] || variants.note;

  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: 12,
        border: `2px solid ${v.border}`,
        backgroundColor: v.bg,
        color: v.text,
        boxShadow: variantCard === "elevated" ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.06)",
        fontSize: 14,
        lineHeight: 1.6,
        borderLeft: `4px solid ${v.border}`,
        position: "relative",
      }}
    >
      {item.title && (
        <b style={{ display: "block", marginBottom: "4px", fontSize: "15px" }}>{item.title}</b>
      )}
      {item.text}
    </div>
  );
});

/* --------------------------------- Charts ---------------------------------- */

const Chart = memo(function Chart({ spec, tokens }: { spec: SlideSpecV1; tokens: Tokens }) {
  const viz = spec.content.dataViz!;
  const series = viz.series ?? [];
  const labels = viz.labels ?? [];

  // Normalize to shortest series length
  const minLen = Math.max(0, Math.min(labels.length, ...series.map((s) => s.values.length)));
  const data = labels.slice(0, minLen).map((label, idx) => {
    const row: Record<string, number | string> = { label };
    for (const s of series) row[s.name] = s.values[idx] ?? 0;
    return row;
  });

  const colors = paletteSeries(tokens);
  const showLegend = legendWanted(spec);
  const legendProps = getLegendProps(spec.components?.chart?.legend);
  const showGrid = spec.components?.chart?.gridlines ?? false;
  const fmt = getNumberFormatter(viz.valueFormat);

  const frameStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    minHeight: 200,
    backgroundColor: tokens.palette.neutral[6] ?? "#E2E8F0",
    borderRadius: 8,
    padding: 8,
    boxSizing: "border-box",
  };

  if (!data.length || !series.length) {
    return <Placeholder text="[Chart] Missing series/labels" tokens={tokens} />;
  }

  switch (viz.kind) {
    case "bar":
      return (
        <div style={frameStyle} aria-label="Bar chart">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid stroke={hexWithAlpha(tokens.palette.neutral[5] ?? "#94A3B8", showGrid ? 0.4 : 0)} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: tokens.palette.neutral[3] }} />
              <YAxis tick={{ fill: tokens.palette.neutral[3] }} tickFormatter={fmt} />
              <Tooltip formatter={(v: any) => fmt(Number(v))} />
              {series.map((s, i) => (
                <Bar
                  key={s.name}
                  dataKey={s.name}
                  fill={colors[i % colors.length]}
                  radius={4}
                  label={viz.valueFormat ? { formatter: (v: any) => fmt(Number(v)), position: "top" as const } : undefined}
                />
              ))}
              {showLegend && <Legend {...legendProps} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case "line":
      return (
        <div style={frameStyle} aria-label="Line chart">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid stroke={hexWithAlpha(tokens.palette.neutral[5] ?? "#94A3B8", showGrid ? 0.4 : 0)} />
              <XAxis dataKey="label" tick={{ fill: tokens.palette.neutral[3] }} />
              <YAxis tick={{ fill: tokens.palette.neutral[3] }} tickFormatter={fmt} />
              <Tooltip formatter={(v: any) => fmt(Number(v))} />
              {series.map((s, i) => (
                <Line
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={viz.valueFormat ? { fill: colors[i % colors.length], r: 4 } : false}
                  label={viz.valueFormat ? { formatter: (v: any) => fmt(Number(v)), position: "top" as const } : undefined}
                />
              ))}
              {showLegend && <Legend {...legendProps} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );

    case "area":
      return (
        <div style={frameStyle} aria-label="Area chart">
          <ResponsiveContainer>
            <AreaChart data={data}>
              <CartesianGrid stroke={hexWithAlpha(tokens.palette.neutral[5] ?? "#94A3B8", showGrid ? 0.4 : 0)} />
              <XAxis dataKey="label" tick={{ fill: tokens.palette.neutral[3] }} />
              <YAxis tick={{ fill: tokens.palette.neutral[3] }} tickFormatter={fmt} />
              <Tooltip formatter={(v: any) => fmt(Number(v))} />
              {series.map((s, i) => (
                <Area
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={colors[i % colors.length]}
                  fill={hexWithAlpha(colors[i % colors.length], 0.35)}
                  strokeWidth={2}
                />
              ))}
              {showLegend && <Legend {...legendProps} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );

    case "pie":
    case "doughnut": {
      const single = series[0] ?? { name: "Series", values: [] as number[] };
      const pieData = labels.slice(0, minLen).map((label, i) => ({
        name: label,
        value: single.values[i] ?? 0,
      }));

      return (
        <div style={frameStyle} aria-label={viz.kind === "doughnut" ? "Doughnut chart" : "Pie chart"}>
          <ResponsiveContainer>
            <PieChart>
              <Tooltip formatter={(v: any) => fmt(Number(v))} />
              {showLegend && <Legend {...legendProps} />}
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={viz.kind === "doughnut" ? "55%" : 0}
                outerRadius="80%"
                strokeWidth={1}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    case "scatter": {
      const x = series[0]?.values ?? [];
      const y = series[1]?.values ?? [];
      const scatterData = labels.slice(0, Math.min(x.length, y.length)).map((_, i) => ({
        x: x[i] ?? i,
        y: y[i] ?? 0,
      }));
      return (
        <div style={frameStyle} aria-label="Scatter plot">
          <ResponsiveContainer>
            <ScatterChart>
              <CartesianGrid stroke={hexWithAlpha(tokens.palette.neutral[5] ?? "#94A3B8", showGrid ? 0.4 : 0)} />
              <XAxis dataKey="x" tick={{ fill: tokens.palette.neutral[3] }} tickFormatter={fmt} />
              <YAxis dataKey="y" tick={{ fill: tokens.palette.neutral[3] }} tickFormatter={fmt} />
              <Tooltip formatter={(v: any) => fmt(Number(v))} />
              <Scatter data={scatterData} fill={tokens.palette.primary} />
              {showLegend && <Legend {...legendProps} />}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      );
    }

    default:
      return <Placeholder text={`[${viz.kind}] chart not supported in preview yet`} tokens={tokens} />;
  }
});

/** Respect back‑end legend semantics: "none" | "right" | "bottom" */
function legendWanted(spec: SlideSpecV1) {
  const pos = spec.components?.chart?.legend;
  return pos !== "none";
}

function getLegendProps(pos?: "none" | "right" | "bottom") {
  if (pos === "right") {
    return { layout: "vertical" as const, align: "right" as const, verticalAlign: "middle" as const };
  }
  if (pos === "bottom") {
    return { layout: "horizontal" as const, align: "center" as const, verticalAlign: "bottom" as const };
  }
  return { layout: "horizontal" as const, align: "center" as const, verticalAlign: "top" as const };
}

/* --------------------------------- Images ---------------------------------- */

const ImageBlock = memo(function ImageBlock({
  item,
  tokens,
}: {
  item: NonNullable<SlideSpecV1["content"]["images"]>[number];
  tokens: Tokens;
}) {
  const [broken, setBroken] = useState(false);
  const fit = item.fit ?? "cover";
  const url = item.source.type === "url" && item.source.url ? item.source.url : undefined;

  if (!url || broken) {
    return <ImagePlaceholder alt={item.alt} tokens={tokens} />;
  }

  return (
    <img
      src={url}
      alt={item.alt}
      decoding="async"
      loading="lazy"
      onError={() => setBroken(true)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: fit as React.CSSProperties["objectFit"],
        borderRadius: 8,
        display: "block",
      }}
    />
  );
});

const ImagePlaceholder = memo(function ImagePlaceholder({ alt, tokens }: { alt: string; tokens: Tokens }) {
  return (
    <div
      role="img"
      aria-label={alt}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: tokens.palette.neutral[5] ?? "#94A3B8",
        color: tokens.palette.neutral[2] ?? "#334155",
        fontSize: 14,
        textAlign: "center",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <span>{alt}</span>
    </div>
  );
});

/* -------------------------------- Utility ---------------------------------- */

function Placeholder({ text, tokens }: { text: string; tokens: Tokens }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: tokens.palette.neutral[6] ?? "#E2E8F0",
        borderRadius: 8,
        color: tokens.palette.neutral[3] ?? "#64748B",
        fontSize: 14,
        textAlign: "center",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      {text}
    </div>
  );
}

function getGradientBackground(tokens: Tokens): string {
  const pattern = tokens.pattern || "split";
  const primary = tokens.palette.primary || "#6366F1";
  const accent = tokens.palette.accent || "#EC4899";
  const neutralLight = tokens.palette.neutral[8] || "#F8FAFC";
  const neutralMid = tokens.palette.neutral[5] || "#94A3B8";

  switch (pattern) {
    case "hero":
      return `linear-gradient(180deg, ${neutralLight} 0%, ${hexWithAlpha(primary, 0.08)} 50%, ${hexWithAlpha(
        accent,
        0.05
      )} 100%)`;
    case "minimal":
      return `radial-gradient(ellipse at center, ${neutralLight} 0%, ${hexWithAlpha(neutralMid, 0.05)} 100%)`;
    case "data-focused":
      return `linear-gradient(90deg, ${neutralLight} 0%, ${hexWithAlpha(accent, 0.06)} 100%)`;
    case "split":
      return `linear-gradient(135deg, ${neutralLight} 0%, ${hexWithAlpha(primary, 0.05)} 50%, ${neutralLight} 100%)`;
    case "asymmetric":
      return `linear-gradient(120deg, ${neutralLight} 0%, ${hexWithAlpha(accent, 0.08)} 60%, ${hexWithAlpha(
        primary,
        0.05
      )} 100%)`;
    case "grid":
      return `radial-gradient(circle at 50% 50%, ${neutralLight} 0%, ${hexWithAlpha(neutralMid, 0.04)} 100%)`;
    default:
      return `linear-gradient(135deg, ${neutralLight} 0%, ${hexWithAlpha(neutralMid, 0.03)} 50%, ${neutralLight} 100%)`;
  }
}

function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
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

/* ------------------------------- Number fmt -------------------------------- */

function getNumberFormatter(format?: SlideSpecV1["content"]["dataViz"] extends infer T ? T extends { valueFormat?: infer F } ? F : never : never) {
  if (format === "percent") {
    return (n: number) => {
      // Accept either 0..1 or 0..100 inputs
      const v = Math.abs(n) <= 1 ? n * 100 : n;
      return `${roundSmart(v)}%`;
    };
  }
  if (format === "currency") {
    // Default to USD if unspecified by schema
    const nf = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    return (n: number) => nf.format(n);
  }
  if (format === "number") {
    return (n: number) => shortNumber(n);
  }
  // auto
  return (n: number) => shortNumber(n);
}

function shortNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${roundSmart(n / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${roundSmart(n / 1_000_000)}M`;
  if (abs >= 1_000) return `${roundSmart(n / 1_000)}k`;
  return `${roundSmart(n)}`;
}

function roundSmart(n: number): string {
  const v = Math.abs(n) < 10 ? Number(n.toFixed(2)) : Math.abs(n) < 100 ? Number(n.toFixed(1)) : Math.round(n);
  return `${v}`;
}

/* ------------------------------ Series colors ------------------------------ */

function paletteSeries(tokens: Tokens): string[] {
  const p = tokens.palette;
  const base = [p.primary, p.accent, p.neutral[2], p.neutral[3], p.neutral[4]];
  return base.map((c, i) => (i <= 1 ? c : hexWithAlpha(c, 0.85)));
}