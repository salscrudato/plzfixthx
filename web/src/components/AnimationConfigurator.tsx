import { useState } from "react";
import { Zap, Play, Settings } from "lucide-react";

type EntranceAnimation = "fade" | "wipe" | "fly-in" | "zoom" | "appear" | "split";
type SlideTransition = "fade" | "push" | "wipe" | "split" | "reveal" | "cover" | "dissolve";

interface AnimationConfig {
  slideTransition?: {
    type: SlideTransition;
    duration: number;
  };
  entranceAnimations?: Array<{
    elementId: string;
    type: EntranceAnimation;
    duration: number;
    delay: number;
  }>;
  usePreset?: "minimal" | "professional" | "dynamic" | "none";
}

interface AnimationConfiguratorProps {
  currentConfig?: AnimationConfig;
  onApplyConfig: (config: AnimationConfig) => void;
}

export function AnimationConfigurator({ currentConfig, onApplyConfig }: AnimationConfiguratorProps) {
  const [config, setConfig] = useState<AnimationConfig>(currentConfig || {
    usePreset: "professional"
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const presets: Array<{ id: AnimationConfig["usePreset"]; label: string; description: string }> = [
    { id: "none", label: "No Animations", description: "Static slides, no transitions" },
    { id: "minimal", label: "Minimal", description: "Subtle fade effects only" },
    { id: "professional", label: "Professional", description: "Balanced, polished animations" },
    { id: "dynamic", label: "Dynamic", description: "Bold, attention-grabbing effects" }
  ];

  const transitions: Array<{ type: SlideTransition; label: string; description: string }> = [
    { type: "fade", label: "Fade", description: "Smooth crossfade" },
    { type: "push", label: "Push", description: "Slide pushes in" },
    { type: "wipe", label: "Wipe", description: "Wipe across" },
    { type: "split", label: "Split", description: "Split from center" },
    { type: "reveal", label: "Reveal", description: "Reveal underneath" },
    { type: "cover", label: "Cover", description: "Cover previous" },
    { type: "dissolve", label: "Dissolve", description: "Pixelated dissolve" }
  ];

  const entranceTypes: Array<{ type: EntranceAnimation; label: string }> = [
    { type: "fade", label: "Fade In" },
    { type: "wipe", label: "Wipe In" },
    { type: "fly-in", label: "Fly In" },
    { type: "zoom", label: "Zoom In" },
    { type: "appear", label: "Appear" },
    { type: "split", label: "Split" }
  ];

  const handleApply = () => {
    onApplyConfig(config);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[var(--neutral-7)] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--neutral-1)]">Animations & Transitions</h2>
            <p className="text-sm text-[var(--neutral-3)]">Add motion to your slides</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 border border-[var(--neutral-7)] text-[var(--neutral-2)] rounded-lg hover:bg-[var(--neutral-8)] transition-all flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          {showAdvanced ? "Simple" : "Advanced"}
        </button>
      </div>

      {/* Preset Selection */}
      <div>
        <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-3">
          Animation Preset
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setConfig({ ...config, usePreset: preset.id })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                config.usePreset === preset.id
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-[var(--neutral-7)] hover:border-[var(--color-primary)]/50"
              }`}
            >
              <div className="font-semibold text-sm text-[var(--neutral-1)] mb-1">
                {preset.label}
              </div>
              <div className="text-xs text-[var(--neutral-4)]">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <>
          {/* Slide Transition */}
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-3">
              Slide Transition
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {transitions.map((transition) => (
                <button
                  key={transition.type}
                  onClick={() => setConfig({
                    ...config,
                    slideTransition: {
                      type: transition.type,
                      duration: config.slideTransition?.duration || 600
                    }
                  })}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    config.slideTransition?.type === transition.type
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--neutral-7)] hover:border-[var(--color-primary)]/50"
                  }`}
                >
                  <div className="font-semibold text-xs text-[var(--neutral-1)]">
                    {transition.label}
                  </div>
                  <div className="text-xs text-[var(--neutral-4)] mt-1">
                    {transition.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Duration Slider */}
            {config.slideTransition && (
              <div className="mt-4">
                <label className="block text-xs text-[var(--neutral-3)] mb-2">
                  Transition Duration: {config.slideTransition.duration}ms
                </label>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="100"
                  value={config.slideTransition.duration}
                  onChange={(e) => setConfig({
                    ...config,
                    slideTransition: {
                      ...config.slideTransition!,
                      duration: parseInt(e.target.value)
                    }
                  })}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Entrance Animations */}
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-3">
              Default Entrance Animation
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {entranceTypes.map((entrance) => (
                <button
                  key={entrance.type}
                  onClick={() => {
                    // This would set default entrance for all elements
                    setConfig({
                      ...config,
                      entranceAnimations: [{
                        elementId: "default",
                        type: entrance.type,
                        duration: 600,
                        delay: 0
                      }]
                    });
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    config.entranceAnimations?.[0]?.type === entrance.type
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--neutral-7)] hover:border-[var(--color-primary)]/50"
                  }`}
                >
                  <div className="font-semibold text-xs text-[var(--neutral-1)] text-center">
                    {entrance.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Preview */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 mb-3">
          <Play className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-sm text-blue-900">Animation Preview</span>
        </div>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Preset:</strong> {presets.find(p => p.id === config.usePreset)?.label || "None"}
          </p>
          {config.slideTransition && (
            <p>
              <strong>Transition:</strong> {transitions.find(t => t.type === config.slideTransition?.type)?.label} 
              ({config.slideTransition.duration}ms)
            </p>
          )}
          {config.entranceAnimations && config.entranceAnimations.length > 0 && (
            <p>
              <strong>Entrance:</strong> {entranceTypes.find(e => e.type === config.entranceAnimations?.[0]?.type)?.label}
            </p>
          )}
        </div>
      </div>

      {/* Best Practices */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-900">
          <strong>💡 Best Practice:</strong> Use animations sparingly. Too many animations can distract from your message.
          The "Professional" preset is recommended for most presentations.
        </p>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-full px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <Zap className="w-5 h-5" />
        Apply Animation Settings
      </button>
    </div>
  );
}

