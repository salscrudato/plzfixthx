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
      setTimeout(() => setErrorMsg(null), 5000);
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
      setErrorMsg("Failed to download PowerPoint");
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
        </header>

        {/* Input Section */}
        <main id="main-content" className="animate-scale-in max-w-4xl mx-auto w-full">
          <div className="glass rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="Describe your slide..."
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-[var(--radius-md)] bg-[var(--neutral-8)] text-[var(--neutral-1)] placeholder-[var(--neutral-4)] border border-[var(--neutral-6)] focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-red-700 text-sm">
                {errorMsg}
              </div>
            )}

            {loading && <ProgressIndicator isLoading={true} />}
          </div>
        </main>

        {/* Preview and Download */}
        {(currentSpec || loading) && (
          <div className="animate-scale-in max-w-7xl mx-auto w-full space-y-6">
            {loading ? (
              <div className="glass rounded-[var(--radius-2xl)] p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl font-bold text-[var(--neutral-1)] mb-6">
                  Creating your slide...
                </h2>
                <ProgressIndicator isLoading={true} />
              </div>
            ) : currentSpec ? (
              <div className="space-y-6">
                <SlideCanvas spec={currentSpec} />
                <div className="flex justify-center">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] font-medium hover:opacity-90 transition-opacity"
                  >
                    <Download size={20} />
                    Download PowerPoint
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

