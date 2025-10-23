import { useEffect, useState, useMemo } from "react";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";
import type { SlideSpecV2 } from "@/types/SlideSpecV2";
import { Chart } from "./Chart";
import { logDiagnostics, validateLayoutCalculations } from "@/utils/slideDebugger";

type SlideSpec = SlideSpecV1 | SlideSpecV2;

export function SlideCanvas({ spec }: { spec: SlideSpec }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Log diagnostics when spec changes
    console.log("🎨 SlideCanvas spec:", spec);
    console.log("📋 Content:", spec.content);
    console.log("📐 Layout:", spec.layout);
    logDiagnostics(spec as SlideSpecV1);
    validateLayoutCalculations(spec as SlideSpecV1);

    // Trigger animation when spec changes
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [spec]);

  // Get design tokens from spec (handle both V1 and V2)
  const designTokens = useMemo(() => {
    const v2Spec = spec as SlideSpecV2;
    const v1Spec = spec as SlideSpecV1;

    // Extract palette and typography from styleTokens
    const palette = v1Spec.styleTokens?.palette || {
      primary: "#6366F1",
      accent: "#EC4899",
      neutral: ["#0F172A", "#1E293B", "#334155", "#475569", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC"]
    };

    const typography = v1Spec.styleTokens?.typography || {
      fonts: { sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
      sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 24, step_3: 32 },
      weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeights: { compact: 1.2, standard: 1.5 }
    };

    return {
      palette,
      typography,
      pattern: v2Spec.design?.pattern || "split",
      whitespace: v2Spec.design?.whitespace || { strategy: "balanced", breathingRoom: 30 },
    };
  }, [spec]);

  // Create inline styles for design tokens with gradient background
  const slideStyle: React.CSSProperties = designTokens ? {
    background: getGradientBackground(designTokens),
    color: designTokens.palette.neutral[0],
  } : {
    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #F8FAFC 100%)',
  };

  // Responsive 16:9 surface - with proper aspect ratio and sizing
  return (
    <div
      className={`relative w-full overflow-hidden rounded-[var(--radius-lg)] transition-all duration-500 shadow-lg ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        aspectRatio: '16 / 9',
        ...slideStyle,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: 'var(--space-5)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderRegions(spec, designTokens)}
      </div>
    </div>
  );
}

function renderRegions(spec: SlideSpec, designTokens: any) {
  const { rows, cols, gutter, margin } = spec.layout.grid;

  // Convert pixel values to percentages for responsive layout
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateRows: `repeat(${rows}, minmax(0,1fr))`,
    gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
    gap: `${gutter}px`,
    padding: `${margin.t}px ${margin.r}px ${margin.b}px ${margin.l}px`,
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
  };

  const regionToStyle = (r: any): React.CSSProperties => ({
    gridRow: `${r.rowStart} / span ${r.rowSpan}`,
    gridColumn: `${r.colStart} / span ${r.colSpan}`,
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
    justifyContent: "flex-start",
    alignItems: "stretch",
  });

  return (
    <div style={gridStyle}>
      {spec.layout.regions.map((r, i) => (
        <div key={i} style={regionToStyle(r)}>
          {spec.layout.anchors
            .filter(a => a.region === r.name)
            .sort((a, b) => a.order - b.order)
            .map(a => <ElementByRef key={a.refId} spec={spec} refId={a.refId} designTokens={designTokens} />)}
        </div>
      ))}
    </div>
  );
}

function ElementByRef({ spec, refId, designTokens }: { spec: SlideSpec; refId: string; designTokens: any }) {
  const c = spec.content;

  // Get typography config from design tokens
  const getTitleStyle = (): React.CSSProperties => {
    const sizes = designTokens?.typography?.sizes || { step_3: 32 };
    const weights = designTokens?.typography?.weights || { bold: 700 };
    const lineHeights = designTokens?.typography?.lineHeights || { compact: 1.2 };

    return {
      fontSize: `${sizes.step_3 || 32}px`,
      fontWeight: weights.bold || 700,
      lineHeight: lineHeights.compact || 1.2,
      color: designTokens?.palette?.primary || '#6366F1',
      margin: 0,
      padding: 0,
    };
  };

  const getSubtitleStyle = (): React.CSSProperties => {
    const sizes = designTokens?.typography?.sizes || { step_2: 24 };
    const weights = designTokens?.typography?.weights || { semibold: 600 };
    const lineHeights = designTokens?.typography?.lineHeights || { standard: 1.5 };

    return {
      fontSize: `${sizes.step_2 || 24}px`,
      fontWeight: weights.semibold || 600,
      lineHeight: lineHeights.standard || 1.5,
      color: designTokens?.palette?.neutral?.[2] || '#334155',
      margin: 0,
      padding: 0,
    };
  };

  const getBodyStyle = (): React.CSSProperties => {
    const sizes = designTokens?.typography?.sizes || { step_0: 16 };
    const weights = designTokens?.typography?.weights || { regular: 400 };
    const lineHeights = designTokens?.typography?.lineHeights || { standard: 1.5 };

    return {
      fontSize: `${sizes.step_0 || 16}px`,
      fontWeight: weights.regular || 400,
      lineHeight: lineHeights.standard || 1.5,
      color: designTokens?.palette?.neutral?.[0] || '#0F172A',
      margin: 0,
      padding: 0,
    };
  };

  if (c.title?.id === refId) {
    return (
      <h2 style={getTitleStyle()}>
        {c.title.text}
      </h2>
    );
  }

  if (c.subtitle?.id === refId) {
    return (
      <p style={getSubtitleStyle()}>
        {c.subtitle.text}
      </p>
    );
  }

  const bl = c.bullets?.find(x => x.id === refId);
  if (bl) {
    return (
      <ul style={{ ...getBodyStyle(), listStyle: 'none', margin: 0, padding: 0 }}>
        {bl.items.map((it, i) => (
          <li
            key={i}
            style={{
              marginLeft: `${(it.level - 1) * 24}px`,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: designTokens?.palette?.primary || '#6366F1',
                marginTop: '8px',
                flexShrink: 0,
              }}
            />
            <span>{it.text}</span>
          </li>
        ))}
      </ul>
    );
  }

  const co = c.callouts?.find(x => x.id === refId);
  if (co) {
    const bgColor = co.variant === "warning" ? "#FEF3C7" :
                    co.variant === "danger"  ? "#FEE2E2" :
                    co.variant === "success" ? "#D1FAE5" : "#F3F4F6";
    const borderColor = designTokens?.palette?.accent || "#EC4899";
    return (
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          border: `2px solid ${borderColor}`,
          backgroundColor: bgColor,
          color: designTokens?.palette?.neutral[0] || '#0F172A',
          fontSize: '14px',
          lineHeight: 1.5,
        }}
      >
        {co.title && <b>{co.title} — </b>}{co.text}
      </div>
    );
  }

  if (c.dataViz?.id === refId) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
        <Chart
          labels={c.dataViz.labels}
          series={c.dataViz.series}
          kind={c.dataViz.kind}
          title={c.dataViz.title}
          valueFormat={c.dataViz.valueFormat}
          colors={designTokens?.palette ? [designTokens.palette.primary, designTokens.palette.accent] : undefined}
        />
      </div>
    );
  }

  const ph = c.imagePlaceholders?.find(x => x.id === refId);
  if (ph) {
    return (
      <div
        role="img"
        aria-label={ph.alt}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: designTokens?.palette?.neutral[5] || '#94A3B8',
          color: designTokens?.palette?.neutral[2] || '#334155',
          fontSize: '14px',
          textAlign: 'center',
          padding: '16px',
          boxSizing: 'border-box',
        }}
      >
        <span>{ph.alt}</span>
      </div>
    );
  }

  return null;
}

/**
 * Generate gradient background based on design pattern
 */
function getGradientBackground(designTokens: any): string {
  const pattern = designTokens.pattern || 'split';
  const primary = designTokens.palette.primary || '#6366F1';
  const accent = designTokens.palette.accent || '#EC4899';
  const neutralLight = designTokens.palette.neutral[6] || '#F8FAFC';
  const neutralMid = designTokens.palette.neutral[4] || '#94A3B8';

  switch (pattern) {
    case 'hero':
      // Dramatic top-to-bottom gradient
      return `linear-gradient(180deg, ${neutralLight} 0%, ${primary}08 50%, ${accent}05 100%)`;

    case 'minimal':
      // Very subtle vignette effect
      return `radial-gradient(ellipse at center, ${neutralLight} 0%, ${neutralMid}05 100%)`;

    case 'data-focused':
      // Left-to-right gradient
      return `linear-gradient(90deg, ${neutralLight} 0%, ${accent}06 100%)`;

    case 'split':
      // Diagonal gradient
      return `linear-gradient(135deg, ${neutralLight} 0%, ${primary}05 50%, ${neutralLight} 100%)`;

    case 'asymmetric':
      // Dynamic angular gradient
      return `linear-gradient(120deg, ${neutralLight} 0%, ${accent}08 60%, ${primary}05 100%)`;

    case 'grid':
      // Subtle radial gradient
      return `radial-gradient(circle at 50% 50%, ${neutralLight} 0%, ${neutralMid}04 100%)`;

    default:
      // Default subtle gradient
      return `linear-gradient(135deg, ${neutralLight} 0%, ${neutralMid}03 50%, ${neutralLight} 100%)`;
  }
}

