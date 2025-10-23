import { useState, useCallback, useEffect } from "react";
import { normalizeOrFallback } from "@/lib/validation";
import { SlideCanvas } from "@/components/SlideCanvas";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { ToastContainer, useToast } from "@/components/Toast";
import { useSlideGeneration } from "@/hooks/useSlideGeneration";
import { useSlideExport } from "@/hooks/useSlideExport";

const MAX_PROMPT_LENGTH = 800;

export default function App() {
  const [prompt, setPrompt] = useState("");

  const { loading, spec, error, generate } = useSlideGeneration();
  const { exporting, exportSlide } = useSlideExport();
  const toast = useToast();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleGenerate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.warning("Please enter a prompt");
      return;
    }

    const result = await generate(prompt);
    if (result) {
      toast.success("Slide generated successfully!");
    }
  }, [prompt, generate, toast]);

  const handleDownload = useCallback(async () => {
    if (!spec) return;
    
    const success = await exportSlide(spec);
    if (success) {
      toast.success("PowerPoint downloaded successfully!");
    } else {
      toast.error("Failed to download PowerPoint");
    }
  }, [spec, exportSlide, toast]);



  const charCount = prompt.length;
  const isOverLimit = charCount > MAX_PROMPT_LENGTH;
  const isNearLimit = charCount > MAX_PROMPT_LENGTH * 0.9;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-main)' }}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-white focus:rounded-[var(--radius-md)]"
      >
        Skip to main content
      </a>

      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
        {/* Premium Header */}
        <header className="text-center space-y-6 py-12 sm:py-16 animate-fade-in">
          <div className="inline-block">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-accent)] bg-clip-text text-transparent mb-4" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              plsfixthx
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full"></div>
          </div>
          <p className="text-xl sm:text-2xl text-[var(--neutral-3)] max-w-3xl mx-auto font-medium leading-relaxed">
            Create world-class professional presentations with AI-powered design
          </p>
        </header>

        {/* Premium Main Input Card */}
        <main id="main-content" className="glass rounded-[var(--radius-2xl)] p-8 sm:p-10 lg:p-12 animate-scale-in shadow-lg border border-white/20">
          <form onSubmit={handleGenerate} className="space-y-8" aria-label="Slide generation form">
            <div className="space-y-4">
              <label htmlFor="prompt-input" className="block text-lg font-semibold text-[var(--neutral-1)]" style={{ letterSpacing: '-0.01em' }}>
                Describe your slide
              </label>
              <p className="text-sm text-[var(--neutral-4)]">
                Be specific about content, design style, and key metrics
              </p>
              <div className="relative">
                <textarea
                  id="prompt-input"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
                  placeholder="e.g., Executive summary for Q3 growth with revenue chart and key achievements..."
                  className={`w-full px-5 py-4 text-base rounded-[var(--radius-xl)] border-2 transition-all duration-200 ${
                    isOverLimit
                      ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/10'
                      : isNearLimit
                      ? 'border-[var(--color-warning)] focus:border-[var(--color-warning)] focus:ring-[var(--color-warning)]/10'
                      : 'border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10'
                  } focus:ring-4 focus:outline-none resize-none bg-white shadow-sm`}
                  rows={4}
                  aria-label="Slide description prompt"
                  aria-invalid={isOverLimit}
                  aria-describedby="prompt-validation"
                  style={{ lineHeight: 'var(--lh-relaxed)' }}
                />
              </div>
              <div className="flex justify-between items-center text-sm" id="prompt-validation">
                <div className="flex items-center gap-2">
                  <span className={`font-medium transition-colors ${
                    isOverLimit
                      ? 'text-[var(--color-error)]'
                      : isNearLimit
                      ? 'text-[var(--color-warning)]'
                      : 'text-[var(--neutral-4)]'
                  }`}>
                    {charCount} / {MAX_PROMPT_LENGTH}
                  </span>
                  {isOverLimit && (
                    <span className="text-[var(--color-error)] text-xs animate-fade-in">
                      ⚠️ Character limit exceeded
                    </span>
                  )}
                  {isNearLimit && !isOverLimit && (
                    <span className="text-[var(--color-warning)] text-xs animate-fade-in">
                      ⚡ Approaching limit
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-center flex-wrap pt-4">
              <button
                type="submit"
                disabled={loading || !prompt.trim() || isOverLimit}
                className="btn-primary w-full sm:w-auto sm:ml-auto px-8 py-4 text-base text-white rounded-[var(--radius-xl)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                style={{ minWidth: '180px' }}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {loading ? "Generating..." : "Generate Slide"}
              </button>
            </div>
          </form>
        </main>



        {/* Preview Card */}
        <div className="glass rounded-[var(--radius-2xl)] p-6 sm:p-8 lg:p-10 space-y-6 animate-scale-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--neutral-1)]">
              Preview
            </h2>
            {spec && !loading && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Ready</span>
              </div>
            )}
          </div>

          {loading && (
            <div className="mb-6">
              <ProgressIndicator isLoading={loading} />
            </div>
          )}

          <div className="relative">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="rounded-[var(--radius-xl)] overflow-hidden shadow-2xl border border-[var(--neutral-7)]">
                <SlideCanvas spec={spec || normalizeOrFallback(null)} />
              </div>
            )}
          </div>
        </div>

        {/* Download Button */}
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={handleDownload}
            disabled={!spec || exporting}
            className="btn-secondary group px-10 py-4 text-base text-white rounded-[var(--radius-xl)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
            aria-label="Download PowerPoint file"
            style={{ minWidth: '220px' }}
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download .pptx</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

