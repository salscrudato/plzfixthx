import { useState } from "react";
import { Presentation, Users, Sparkles, FileText, CheckCircle2, Loader2 } from "lucide-react";

interface PresentationRequest {
  topic: string;
  audience: "executives" | "technical" | "sales" | "general" | "investors";
  tone: "formal" | "casual" | "persuasive" | "educational" | "inspirational";
  slideCount?: number;
  industry: "tech" | "finance" | "healthcare" | "marketing" | "corporate";
  includeAgenda: boolean;
  includeSummary: boolean;
}

interface PresentationGeneratorProps {
  onGenerate: (request: PresentationRequest) => Promise<void>;
  loading?: boolean;
}

export function PresentationGenerator({ onGenerate, loading = false }: PresentationGeneratorProps) {
  const [request, setRequest] = useState<PresentationRequest>({
    topic: "",
    audience: "general",
    tone: "formal",
    slideCount: 10,
    industry: "corporate",
    includeAgenda: true,
    includeSummary: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(request);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[var(--neutral-7)] p-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-xl">
          <Presentation className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--neutral-1)]">Generate Full Presentation</h2>
          <p className="text-sm text-[var(--neutral-3)]">AI-powered multi-slide generation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic */}
        <div>
          <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-2">
            Presentation Topic *
          </label>
          <input
            type="text"
            value={request.topic}
            onChange={(e) => setRequest({ ...request, topic: e.target.value })}
            placeholder="e.g., Q4 Product Launch Strategy"
            className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
            required
          />
        </div>

        {/* Audience & Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Target Audience
            </label>
            <select
              value={request.audience}
              onChange={(e) => setRequest({ ...request, audience: e.target.value as any })}
              className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
            >
              <option value="executives">Executives</option>
              <option value="technical">Technical Team</option>
              <option value="sales">Sales Team</option>
              <option value="general">General Audience</option>
              <option value="investors">Investors</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Tone
            </label>
            <select
              value={request.tone}
              onChange={(e) => setRequest({ ...request, tone: e.target.value as any })}
              className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
            >
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="persuasive">Persuasive</option>
              <option value="educational">Educational</option>
              <option value="inspirational">Inspirational</option>
            </select>
          </div>
        </div>

        {/* Industry & Slide Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-2">
              Industry
            </label>
            <select
              value={request.industry}
              onChange={(e) => setRequest({ ...request, industry: e.target.value as any })}
              className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
            >
              <option value="tech">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="marketing">Marketing</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Number of Slides
            </label>
            <input
              type="number"
              min="5"
              max="20"
              value={request.slideCount}
              onChange={(e) => setRequest({ ...request, slideCount: parseInt(e.target.value) })}
              className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 p-4 bg-[var(--neutral-8)] rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={request.includeAgenda}
              onChange={(e) => setRequest({ ...request, includeAgenda: e.target.checked })}
              className="w-5 h-5 rounded border-[var(--neutral-6)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm font-medium text-[var(--neutral-2)] group-hover:text-[var(--neutral-1)]">
                Include Agenda Slide
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={request.includeSummary}
              onChange={(e) => setRequest({ ...request, includeSummary: e.target.checked })}
              className="w-5 h-5 rounded border-[var(--neutral-6)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm font-medium text-[var(--neutral-2)] group-hover:text-[var(--neutral-1)]">
                Include Summary Slide
              </span>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !request.topic.trim()}
          className="w-full px-6 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Presentation...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate {request.slideCount} Slides
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Pro Tip:</strong> The AI will analyze your topic and create a complete presentation
          with optimal slide structure, narrative flow, and professional design.
        </p>
      </div>
    </div>
  );
}

