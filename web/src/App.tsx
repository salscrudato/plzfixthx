import { useCallback, useEffect, useState } from "react";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { SlideCanvas } from "@/components/SlideCanvas";
import { useSlideGeneration } from "@/hooks/useSlideGeneration";
import { useSlideExport } from "@/hooks/useSlideExport";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";
import { Download } from "lucide-react";

export default function App() {
  const { loading, spec, error, generate } = useSlideGeneration();
  const { exportSlide } = useSlideExport();
  const [currentSpec, setCurrentSpec] = useState<SlideSpecV1 | null>(null);
  const [prompt, setPrompt] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (spec) {
      setCurrentSpec(spec);
    }
  }, [spec]);

  useEffect(() => {
    if (error) {
      setErrorMsg(error);
      setTimeout(() => setErrorMsg(null), 6000);
    }
  }, [error]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setErrorMsg(null);
    await generate(prompt);
  }, [prompt, generate]);

  const handleDownload = useCallback(async () => {
    if (!currentSpec) return;
    const success = await exportSlide(currentSpec);
    if (!success) {
      setErrorMsg("Failed to download PowerPoint. Please try again.");
    }
  }, [currentSpec, exportSlide]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-gradient-main)' }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-white focus:rounded-[var(--radius-md)]"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12 w-full">
        {/* Header */}
        <header className="text-center space-y-4 py-8 sm:py-12 animate-fade-in">
          <div className="inline-block">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-accent)] bg-clip-text text-transparent mb-3" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              plsfixthx
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full"></div>
          </div>
          <p className="text-lg sm:text-xl text-[var(--neutral-3)] max-w-2xl mx-auto font-medium leading-relaxed">
            Create beautiful, professional slides with AI
          </p>
          <p className="text-sm text-[var(--neutral-4)] max-w-2xl mx-auto">
            Powered by advanced AI • Consulting-firm quality • Ready to export
          </p>
        </header>

        {/* Input Section */}
        <main id="main-content" className="animate-scale-in max-w-4xl mx-auto w-full">
          <div className="glass rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-4 border border-white/10 backdrop-blur-xl shadow-lg">
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="Describe your slide... (e.g., 'Q3 revenue growth strategy')"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-[var(--radius-md)] bg-[var(--neutral-8)] text-[var(--neutral-1)] placeholder-[var(--neutral-4)] border border-[var(--neutral-6)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50 transition-all duration-200"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] font-semibold hover:shadow-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 whitespace-nowrap transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin">⚡</span>
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50/90 border-l-4 border-red-500 rounded-[var(--radius-md)] text-red-700 text-sm flex gap-3 items-start animate-in fade-in slide-in-from-top-2 shadow-md">
                <span className="text-red-500 flex-shrink-0 mt-0.5 font-bold text-lg">✕</span>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Error generating slide</p>
                  <p className="text-red-600 text-sm">{errorMsg}</p>
                </div>
              </div>
            )}

            {loading && <ProgressIndicator isLoading={true} />}
          </div>
        </main>

        {/* Preview and Download */}
        {currentSpec && !loading && (
          <div className="animate-scale-in max-w-7xl mx-auto w-full space-y-8">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-[var(--neutral-1)]">Your Slide Preview</h2>
                <p className="text-[var(--neutral-3)] text-sm">Professional quality, ready to download</p>
              </div>
              <SlideCanvas spec={currentSpec} />
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] font-semibold hover:shadow-2xl hover:opacity-90 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <Download size={20} />
                  Download PowerPoint
                </button>
                <button
                  onClick={() => {
                    setPrompt("");
                    setCurrentSpec(null);
                  }}
                  className="px-8 py-4 bg-[var(--neutral-7)] text-[var(--neutral-1)] rounded-[var(--radius-md)] font-semibold hover:bg-[var(--neutral-6)] transition-all duration-200 border border-[var(--neutral-6)] hover:border-[var(--neutral-5)]"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

