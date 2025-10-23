import { useEffect, useState, useMemo } from "react";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";
import type { SlideSpecV2 } from "@/types/SlideSpecV2";
import { Chart } from "./Chart";

type SlideSpec = SlideSpecV1 | SlideSpecV2;

export function SlideCanvas({ spec }: { spec: SlideSpec }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation when spec changes
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [spec]);

  // Get design tokens from spec
  const designTokens = useMemo(() => {
    const v2Spec = spec as SlideSpecV2;
    if (v2Spec.design) {
      return {
        palette: v2Spec.styleTokens.palette,
        typography: v2Spec.styleTokens.typography,
        pattern: v2Spec.design.pattern,
        whitespace: v2Spec.design.whitespace,
      };
    }
    return null;
  }, [spec]);

  // Create inline styles for design tokens with gradient background
  const slideStyle: React.CSSProperties = designTokens ? {
    background: getGradientBackground(designTokens),
    color: designTokens.palette.neutral[0],
  } : {
    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #F8FAFC 100%)',
  };

  // Responsive 16:9 surface
  return (
    <div
      className={`relative w-full aspect-video overflow-hidden rounded-[var(--radius-lg)] p-[var(--space-5)] transition-all duration-500 shadow-lg ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={slideStyle}
    >
      {renderRegions(spec, designTokens)}
    </div>
  );
}

function renderRegions(spec: SlideSpec, designTokens: any) {
  const { rows, cols, gutter, margin } = spec.layout.grid;
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateRows: `repeat(${rows}, minmax(0,1fr))`,
    gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
    gap: `${gutter}px`,
    padding: `${margin.t}px ${margin.r}px ${margin.b}px ${margin.l}px`,
    height: "100%", width: "100%"
  };

  const regionToStyle = (r: any): React.CSSProperties => ({
    gridRow: `${r.rowStart} / span ${r.rowSpan}`,
    gridColumn: `${r.colStart} / span ${r.colSpan}`
  });

  return (
    <div style={gridStyle}>
      {spec.layout.regions.map((r, i) => (
        <div key={i} style={regionToStyle(r)} className="flex flex-col gap-[var(--space-3)]">
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

  // Get typography config from design tokens if available
  const getTitleStyle = (): React.CSSProperties => {
    if (designTokens?.typography) {
      const v2Spec = spec as SlideSpecV2;
      const titleConfig = v2Spec.design?.typography?.hierarchy?.title;
      return {
        fontSize: titleConfig?.size ? `${titleConfig.size}px` : 'var(--step-3)',
        fontWeight: titleConfig?.weight || 700,
        lineHeight: titleConfig?.lineHeight || 1.2,
        color: designTokens.palette.neutral[0],
      };
    }
    return {};
  };

  const getBodyStyle = (): React.CSSProperties => {
    if (designTokens?.typography) {
      const v2Spec = spec as SlideSpecV2;
      const bodyConfig = v2Spec.design?.typography?.hierarchy?.body;
      return {
        fontSize: bodyConfig?.size ? `${bodyConfig.size}px` : 'var(--step-0)',
        fontWeight: bodyConfig?.weight || 400,
        lineHeight: bodyConfig?.lineHeight || 1.5,
        color: designTokens.palette.neutral[0],
      };
    }
    return {};
  };

  if (c.title?.id === refId) {
    return <h2 className="font-semibold" style={getTitleStyle()}>{c.title.text}</h2>;
  }
  if (c.subtitle?.id === refId) {
    return <p className="text-[var(--step-1)]" style={{ color: designTokens?.palette?.neutral[2] || 'var(--neutral-2)' }}>{c.subtitle.text}</p>;
  }
  const bl = c.bullets?.find(x => x.id === refId);
  if (bl) {
    return (
      <ul className="space-y-[var(--space-1)]" style={getBodyStyle()}>
        {bl.items.map((it, i) => (
          <li key={i} style={{ marginLeft: (it.level - 1) * 16 }}>
            {it.text}
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
    const borderColor = designTokens?.palette?.accent || "var(--color-accent)";
    return (
      <div
        className="p-[var(--space-3)] rounded-[var(--radius-md)] border-2"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          color: designTokens?.palette?.neutral[0] || 'var(--neutral-0)'
        }}
      >
        {co.title && <b>{co.title} — </b>}{co.text}
      </div>
    );
  }
  if (c.dataViz?.id === refId) {
    return (
      <div className="w-full h-full min-h-[200px]">
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
        className="w-full h-full rounded-[var(--radius-md)] flex items-center justify-center"
        style={{ backgroundColor: designTokens?.palette?.neutral[5] || 'var(--neutral-5)' }}
      >
        <span style={{ color: designTokens?.palette?.neutral[2] || 'var(--neutral-2)' }}>
          {ph.alt}
        </span>
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

