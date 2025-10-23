import { useState } from "react";
import { Shuffle, Palette, Layout, Type, Minimize2, Sparkles } from "lucide-react";

type VariantType = "color" | "layout" | "typography" | "minimal";

interface SlideVariantGeneratorProps {
  currentSlide: any;
  onGenerateVariant: (variantType: VariantType) => Promise<any>;
  onApplyVariant: (variant: any) => void;
}

export function SlideVariantGenerator({ onGenerateVariant, onApplyVariant }: SlideVariantGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState<Array<{ type: VariantType; slide: any }>>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const variantTypes: Array<{ type: VariantType; label: string; icon: any; description: string; color: string }> = [
    { 
      type: "color", 
      label: "Color Palette", 
      icon: Palette, 
      description: "Alternative color schemes",
      color: "from-purple-500 to-pink-500"
    },
    { 
      type: "layout", 
      label: "Layout", 
      icon: Layout, 
      description: "Different design patterns",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      type: "typography", 
      label: "Typography", 
      icon: Type, 
      description: "Alternative font sizes",
      color: "from-green-500 to-emerald-500"
    },
    { 
      type: "minimal", 
      label: "Minimal", 
      icon: Minimize2, 
      description: "Simplified content",
      color: "from-orange-500 to-red-500"
    }
  ];

  const handleGenerateAll = async () => {
    setGenerating(true);
    const newVariants: Array<{ type: VariantType; slide: any }> = [];

    for (const variantType of variantTypes) {
      try {
        const variant = await onGenerateVariant(variantType.type);
        if (variant) {
          newVariants.push({ type: variantType.type, slide: variant });
        }
      } catch (error) {
        console.error(`Failed to generate ${variantType.type} variant:`, error);
      }
    }

    setVariants(newVariants);
    setGenerating(false);
  };

  const handleApply = () => {
    if (selectedVariant !== null && variants[selectedVariant]) {
      onApplyVariant(variants[selectedVariant].slide);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[var(--neutral-7)] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
            <Shuffle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--neutral-1)]">A/B Variants</h2>
            <p className="text-sm text-[var(--neutral-3)]">Generate alternative designs</p>
          </div>
        </div>
        <button
          onClick={handleGenerateAll}
          disabled={generating}
          className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {generating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate All Variants
            </>
          )}
        </button>
      </div>

      {/* Variant Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variantTypes.map((variantType) => {
          const Icon = variantType.icon;
          const variant = variants.find(v => v.type === variantType.type);
          const isSelected = selectedVariant === variants.findIndex(v => v.type === variantType.type);

          return (
            <div
              key={variantType.type}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-lg"
                  : variant
                  ? "border-[var(--neutral-7)] hover:border-[var(--color-primary)] hover:shadow-md"
                  : "border-[var(--neutral-7)] opacity-50"
              }`}
              onClick={() => {
                if (variant) {
                  const variantIndex = variants.findIndex(v => v.type === variantType.type);
                  setSelectedVariant(variantIndex);
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-3 bg-gradient-to-br ${variantType.color} rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--neutral-1)] mb-1">
                    {variantType.label}
                  </h3>
                  <p className="text-sm text-[var(--neutral-3)] mb-3">
                    {variantType.description}
                  </p>
                  {variant ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-600 font-semibold">Ready</span>
                    </div>
                  ) : generating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs text-blue-600 font-semibold">Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[var(--neutral-5)] rounded-full" />
                      <span className="text-xs text-[var(--neutral-4)]">Not generated</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview (simplified) */}
              {variant && (
                <div className="mt-4 p-3 bg-[var(--neutral-8)] rounded-lg">
                  <div className="text-xs text-[var(--neutral-3)] space-y-1">
                    {variantType.type === "color" && (
                      <div className="flex gap-2">
                        <div
                          className="w-6 h-6 rounded border border-[var(--neutral-7)]"
                          style={{ backgroundColor: variant.slide?.styleTokens?.palette?.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded border border-[var(--neutral-7)]"
                          style={{ backgroundColor: variant.slide?.styleTokens?.palette?.accent }}
                        />
                      </div>
                    )}
                    {variantType.type === "typography" && (
                      <p>Title: {variant.slide?.styleTokens?.typography?.sizes?.step_3}px</p>
                    )}
                    {variantType.type === "minimal" && (
                      <p>Bullets: {variant.slide?.content?.bullets?.[0]?.items?.length || 0}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Apply Button */}
      {selectedVariant !== null && (
        <div className="flex gap-3 pt-4 border-t border-[var(--neutral-7)]">
          <button
            onClick={() => setSelectedVariant(null)}
            className="flex-1 px-6 py-3 border border-[var(--neutral-7)] text-[var(--neutral-2)] font-semibold rounded-xl hover:bg-[var(--neutral-8)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Apply Selected Variant
          </button>
        </div>
      )}

      {/* Info */}
      {variants.length === 0 && !generating && (
        <div className="text-center py-8">
          <Shuffle className="w-16 h-16 text-[var(--neutral-5)] mx-auto mb-4" />
          <p className="text-[var(--neutral-3)]">No variants generated yet</p>
          <p className="text-sm text-[var(--neutral-4)] mt-2">
            Click "Generate All Variants" to create alternative designs
          </p>
        </div>
      )}
    </div>
  );
}

