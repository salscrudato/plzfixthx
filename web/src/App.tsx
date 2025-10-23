import { useCallback, useEffect } from "react";
import { normalizeOrFallback } from "@/lib/validation";
import { SlideCanvas } from "@/components/SlideCanvas";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { ToastContainer, useToast } from "@/components/Toast";
import { SlideChat } from "@/components/SlideChat";
import { useSlideGeneration } from "@/hooks/useSlideGeneration";
import { useSlideExport } from "@/hooks/useSlideExport";
import { Download, Loader } from "lucide-react";

export default function App() {
  const { loading, spec, error, generate } = useSlideGeneration();
  const { exporting, exportSlide } = useSlideExport();
  const toast = useToast();

  const handleChatReady = useCallback(async (slidePrompt: string) => {
    const result = await generate(slidePrompt);
    if (result) {
      toast.success("Slide generated successfully!");
    }
  }, [generate, toast]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDownload = useCallback(async () => {
    if (!spec) return;

    const success = await exportSlide(spec);
    if (success) {
      toast.success("PowerPoint downloaded successfully!");
    } else {
      toast.error("Failed to download PowerPoint");
    }
  }, [spec, exportSlide, toast]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-gradient-main)' }}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-white focus:rounded-[var(--radius-md)]"
      >
        Skip to main content
      </a>

      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12 w-full">
        {/* Premium Header */}
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

        {/* Chat Interface - ChatGPT Style */}
        <main id="main-content" className="animate-scale-in max-w-4xl mx-auto w-full">
          <SlideChat onSlideReady={handleChatReady} isGenerating={loading} />
        </main>
        {/* Preview Card - Only show if slide is generated */}
        {(spec || loading) && (
          <div className="glass rounded-[var(--radius-2xl)] p-6 sm:p-8 lg:p-10 space-y-6 animate-scale-in max-w-5xl mx-auto">
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

            {/* Download Button - Inline with preview */}
            {spec && !loading && (
              <div className="flex gap-4 justify-center pt-4">
                <button
                  onClick={handleDownload}
                  disabled={exporting}
                  className="btn-secondary group px-10 py-4 text-base text-white rounded-[var(--radius-xl)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
                  aria-label="Download PowerPoint file"
                  style={{ minWidth: '220px' }}
                >
                  {exporting ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download size={20} className="group-hover:animate-bounce" />
                      <span>Download .pptx</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

