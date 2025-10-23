import { useState } from "react";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";

interface CustomizationPanelProps {
  spec: SlideSpecV1;
  onUpdate: (spec: SlideSpecV1) => void;
}

export function CustomizationPanel({ spec, onUpdate }: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "layout">("colors");

  const updatePrimaryColor = (color: string) => {
    onUpdate({
      ...spec,
      styleTokens: {
        ...spec.styleTokens,
        palette: {
          ...spec.styleTokens.palette,
          primary: color,
        },
      },
    });
  };

  const updateAccentColor = (color: string) => {
    onUpdate({
      ...spec,
      styleTokens: {
        ...spec.styleTokens,
        palette: {
          ...spec.styleTokens.palette,
          accent: color,
        },
      },
    });
  };

  const updateFontSize = (step: keyof SlideSpecV1["styleTokens"]["typography"]["sizes"], size: number) => {
    onUpdate({
      ...spec,
      styleTokens: {
        ...spec.styleTokens,
        typography: {
          ...spec.styleTokens.typography,
          sizes: {
            ...spec.styleTokens.typography.sizes,
            [step]: size,
          },
        },
      },
    });
  };

  const updateTitleAlignment = (align: "left" | "center" | "right") => {
    onUpdate({
      ...spec,
      components: {
        ...spec.components,
        title: {
          ...spec.components?.title,
          align,
        },
      },
    });
  };

  const tabs = [
    { id: "colors" as const, label: "Colors", icon: "🎨" },
    { id: "typography" as const, label: "Typography", icon: "📝" },
    { id: "layout" as const, label: "Layout", icon: "📐" },
  ];

  const presetColors = [
    { name: "Blue", primary: "#1E40AF", accent: "#10B981" },
    { name: "Purple", primary: "#8B5CF6", accent: "#EC4899" },
    { name: "Green", primary: "#059669", accent: "#F59E0B" },
    { name: "Orange", primary: "#EA580C", accent: "#EAB308" },
    { name: "Pink", primary: "#EC4899", accent: "#F59E0B" },
    { name: "Teal", primary: "#0D9488", accent: "#06B6D4" },
  ];

  return (
    <div className="glass rounded-[var(--radius-2xl)] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[var(--neutral-1)]">Customize Slide</h3>
        <button
          onClick={() => {/* Reset to defaults */}}
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--neutral-7)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--neutral-4)] hover:text-[var(--neutral-2)]"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Colors Tab */}
      {activeTab === "colors" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[var(--neutral-2)]">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={spec.styleTokens.palette.primary}
                onChange={(e) => updatePrimaryColor(e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-[var(--neutral-7)] cursor-pointer"
              />
              <input
                type="text"
                value={spec.styleTokens.palette.primary}
                onChange={(e) => updatePrimaryColor(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:outline-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[var(--neutral-2)]">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={spec.styleTokens.palette.accent}
                onChange={(e) => updateAccentColor(e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-[var(--neutral-7)] cursor-pointer"
              />
              <input
                type="text"
                value={spec.styleTokens.palette.accent}
                onChange={(e) => updateAccentColor(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:outline-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[var(--neutral-2)]">
              Color Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presetColors.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    updatePrimaryColor(preset.primary);
                    updateAccentColor(preset.accent);
                  }}
                  className="p-3 rounded-lg border-2 border-[var(--neutral-7)] hover:border-[var(--color-primary)] transition-all"
                >
                  <div className="flex gap-1 mb-2">
                    <div
                      className="flex-1 h-8 rounded"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="flex-1 h-8 rounded"
                      style={{ backgroundColor: preset.accent }}
                    />
                  </div>
                  <p className="text-xs font-medium text-[var(--neutral-2)]">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Typography Tab */}
      {activeTab === "typography" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[var(--neutral-2)]">
              Title Size
            </label>
            <input
              type="range"
              min="24"
              max="48"
              value={spec.styleTokens.typography.sizes.step_3}
              onChange={(e) => updateFontSize("step_3", parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-[var(--neutral-4)]">
              {spec.styleTokens.typography.sizes.step_3}px
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[var(--neutral-2)]">
              Body Text Size
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={spec.styleTokens.typography.sizes.step_0}
              onChange={(e) => updateFontSize("step_0", parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-[var(--neutral-4)]">
              {spec.styleTokens.typography.sizes.step_0}px
            </div>
          </div>
        </div>
      )}

      {/* Layout Tab */}
      {activeTab === "layout" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[var(--neutral-2)]">
              Title Alignment
            </label>
            <div className="flex gap-2">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateTitleAlignment(align)}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    spec.components?.title?.align === align
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                      : "border-[var(--neutral-7)] text-[var(--neutral-2)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  <span className="text-sm font-medium capitalize">{align}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[var(--neutral-2)]">
              Spacing
            </label>
            <p className="text-sm text-[var(--neutral-4)]">
              Grid: {spec.layout.grid.rows} × {spec.layout.grid.cols}
            </p>
            <p className="text-sm text-[var(--neutral-4)]">
              Gutter: {spec.layout.grid.gutter}px
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

