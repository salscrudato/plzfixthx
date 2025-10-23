import { useState } from "react";
import { useToast } from "./Toast";
import { ChevronRight, Plus, X, Sparkles } from "lucide-react";

interface SlideBuilderProps {
  onSlideReady?: (prompt: string) => void;
  isGenerating?: boolean;
}

interface SlideData {
  title: string;
  subtitle: string;
  contentType: "bullets" | "metrics" | "narrative" | "mixed";
  bullets: string[];
  metrics: { label: string; value: string }[];
  narrative: string;
  designStyle: "professional" | "creative" | "minimal" | "bold";
  audience: string;
}

export function SlideBuilder({ onSlideReady, isGenerating = false }: SlideBuilderProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [data, setData] = useState<SlideData>({
    title: "",
    subtitle: "",
    contentType: "bullets",
    bullets: [""],
    metrics: [{ label: "", value: "" }],
    narrative: "",
    designStyle: "professional",
    audience: "",
  });
  const toast = useToast();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, title: e.target.value });
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, subtitle: e.target.value });
  };

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...data.bullets];
    newBullets[index] = value;
    setData({ ...data, bullets: newBullets });
  };

  const addBullet = () => {
    setData({ ...data, bullets: [...data.bullets, ""] });
  };

  const removeBullet = (index: number) => {
    setData({ ...data, bullets: data.bullets.filter((_, i) => i !== index) });
  };

  const handleMetricChange = (index: number, field: "label" | "value", value: string) => {
    const newMetrics = [...data.metrics];
    newMetrics[index][field] = value;
    setData({ ...data, metrics: newMetrics });
  };

  const addMetric = () => {
    setData({ ...data, metrics: [...data.metrics, { label: "", value: "" }] });
  };

  const removeMetric = (index: number) => {
    setData({ ...data, metrics: data.metrics.filter((_, i) => i !== index) });
  };

  const handleNarrativeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData({ ...data, narrative: e.target.value });
  };

  const generatePrompt = (): string => {
    const parts: string[] = [];
    
    parts.push(`Create a professional PowerPoint slide with the following specifications:`);
    parts.push(`\nTitle: "${data.title}"`);
    
    if (data.subtitle) {
      parts.push(`Subtitle: "${data.subtitle}"`);
    }

    if (data.contentType === "bullets" && data.bullets.some(b => b.trim())) {
      parts.push(`\nContent (bullet points):`);
      data.bullets.forEach(b => {
        if (b.trim()) parts.push(`- ${b}`);
      });
    }

    if (data.contentType === "metrics" && data.metrics.some(m => m.label && m.value)) {
      parts.push(`\nKey Metrics:`);
      data.metrics.forEach(m => {
        if (m.label && m.value) parts.push(`- ${m.label}: ${m.value}`);
      });
    }

    if (data.contentType === "narrative" && data.narrative.trim()) {
      parts.push(`\nContent: ${data.narrative}`);
    }

    if (data.contentType === "mixed") {
      if (data.bullets.some(b => b.trim())) {
        parts.push(`\nBullet Points:`);
        data.bullets.forEach(b => {
          if (b.trim()) parts.push(`- ${b}`);
        });
      }
      if (data.metrics.some(m => m.label && m.value)) {
        parts.push(`\nMetrics:`);
        data.metrics.forEach(m => {
          if (m.label && m.value) parts.push(`- ${m.label}: ${m.value}`);
        });
      }
    }

    if (data.audience) {
      parts.push(`\nTarget Audience: ${data.audience}`);
    }

    parts.push(`\nDesign Style: ${data.designStyle}`);
    parts.push(`\nMake it visually appealing and professional.`);

    return parts.join("\n");
  };

  const handleGenerate = () => {
    if (!data.title.trim()) {
      toast.warning("Please enter a slide title");
      return;
    }

    const prompt = generatePrompt();
    if (onSlideReady) {
      onSlideReady(prompt);
    }
  };

  const canProceed = (): boolean => {
    if (step === 1) return data.title.trim().length > 0;
    if (step === 2) return data.contentType !== "bullets" || data.bullets.some(b => b.trim());
    if (step === 3) return true;
    return true;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[var(--radius-2xl)] shadow-lg border border-[var(--neutral-7)] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-6 py-4 text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <h2 className="text-lg font-semibold">Slide Builder</h2>
        </div>
        <p className="text-sm opacity-90 mt-1">Step {step} of 4 - {["Title & Subtitle", "Content", "Audience & Style", "Review"][step - 1]}</p>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-[var(--neutral-8)]">
        <div
          className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Step 1: Title & Subtitle */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--neutral-1)] mb-2">
                Slide Title
              </label>
              <input
                type="text"
                value={data.title}
                onChange={handleTitleChange}
                placeholder="e.g., Q3 Financial Results"
                className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--neutral-1)] mb-2">
                Subtitle (Optional)
              </label>
              <input
                type="text"
                value={data.subtitle}
                onChange={handleSubtitleChange}
                placeholder="e.g., Performance Overview"
                className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--neutral-1)] mb-3">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["bullets", "metrics", "narrative", "mixed"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setData({ ...data, contentType: type })}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium capitalize ${
                      data.contentType === type
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "border-[var(--neutral-7)] text-[var(--neutral-2)] hover:border-[var(--color-primary)]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Bullets */}
            {(data.contentType === "bullets" || data.contentType === "mixed") && (
              <div>
                <label className="block text-sm font-semibold text-[var(--neutral-1)] mb-2">
                  Bullet Points
                </label>
                <div className="space-y-2">
                  {data.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        placeholder={`Point ${idx + 1}`}
                        className="flex-1 px-3 py-2 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                      />
                      {data.bullets.length > 1 && (
                        <button
                          onClick={() => removeBullet(idx)}
                          className="p-2 text-[var(--neutral-3)] hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addBullet}
                    className="flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium mt-2"
                  >
                    <Plus size={16} />
                    Add Bullet
                  </button>
                </div>
              </div>
            )}

            {/* Metrics */}
            {(data.contentType === "metrics" || data.contentType === "mixed") && (
              <div>
                <label className="block text-sm font-semibold text-[var(--neutral-1)] mb-2">
                  Key Metrics
                </label>
                <div className="space-y-2">
                  {data.metrics.map((metric, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={metric.label}
                        onChange={(e) => handleMetricChange(idx, "label", e.target.value)}
                        placeholder="Label"
                        className="flex-1 px-3 py-2 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                      />
                      <input
                        type="text"
                        value={metric.value}
                        onChange={(e) => handleMetricChange(idx, "value", e.target.value)}
                        placeholder="Value"
                        className="flex-1 px-3 py-2 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm"
                      />
                      {data.metrics.length > 1 && (
                        <button
                          onClick={() => removeMetric(idx)}
                          className="p-2 text-[var(--neutral-3)] hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addMetric}
                    className="flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium mt-2"
                  >
                    <Plus size={16} />
                    Add Metric
                  </button>
                </div>
              </div>
            )}

            {/* Narrative */}
            {(data.contentType === "narrative" || data.contentType === "mixed") && (
              <div>
                <label className="block text-sm font-semibold text-[var(--neutral-1)] mb-2">
                  Content
                </label>
                <textarea
                  value={data.narrative}
                  onChange={handleNarrativeChange}
                  placeholder="Describe your slide content..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-sm resize-none"
                  rows={4}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Audience & Style */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--neutral-1)] mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={data.audience}
                onChange={(e) => setData({ ...data, audience: e.target.value })}
                placeholder="e.g., Executive team, Investors, Clients"
                className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--neutral-1)] mb-3">
                Design Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["professional", "creative", "minimal", "bold"] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setData({ ...data, designStyle: style })}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium capitalize ${
                      data.designStyle === style
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "border-[var(--neutral-7)] text-[var(--neutral-2)] hover:border-[var(--color-primary)]"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-[var(--neutral-9)] rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-[var(--neutral-3)] uppercase">Title</p>
                <p className="text-lg font-bold text-[var(--neutral-1)]">{data.title}</p>
              </div>
              {data.subtitle && (
                <div>
                  <p className="text-xs font-semibold text-[var(--neutral-3)] uppercase">Subtitle</p>
                  <p className="text-[var(--neutral-2)]">{data.subtitle}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-[var(--neutral-3)] uppercase">Content Type</p>
                <p className="text-[var(--neutral-2)] capitalize">{data.contentType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--neutral-3)] uppercase">Design Style</p>
                <p className="text-[var(--neutral-2)] capitalize">{data.designStyle}</p>
              </div>
              {data.audience && (
                <div>
                  <p className="text-xs font-semibold text-[var(--neutral-3)] uppercase">Audience</p>
                  <p className="text-[var(--neutral-2)]">{data.audience}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--neutral-7)] p-4 bg-[var(--neutral-9)] flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep((step - 1) as any)}
            className="px-4 py-2 rounded-lg border border-[var(--neutral-7)] text-[var(--neutral-1)] hover:bg-[var(--neutral-8)] transition-colors font-medium"
          >
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={() => setStep((step + 1) as any)}
            disabled={!canProceed() || isGenerating}
            className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            {isGenerating ? "Creating..." : "Create Slide"}
          </button>
        )}
      </div>
    </div>
  );
}

