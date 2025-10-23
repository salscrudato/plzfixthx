import { useCallback, useEffect, useState } from "react";
import { SlideEditor } from "@/components/SlideEditor";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { ToastContainer, useToast } from "@/components/Toast";
import { SlideChat } from "@/components/SlideChat";
import { useSlideGeneration } from "@/hooks/useSlideGeneration";
import { useSlideExport } from "@/hooks/useSlideExport";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";

export default function App() {
  const { loading, spec, error, generate } = useSlideGeneration();
  const { exportSlide } = useSlideExport();
  const toast = useToast();
  const [currentSpec, setCurrentSpec] = useState<SlideSpecV1 | null>(null);

  useEffect(() => {
    if (spec) {
      setCurrentSpec(spec);
    }
  }, [spec]);

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

  const handleSlideUpdate = useCallback((updatedSpec: SlideSpecV1) => {
    setCurrentSpec(updatedSpec);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!currentSpec) return;

    const success = await exportSlide(currentSpec);
    if (success) {
      toast.success("PowerPoint downloaded successfully!");
    } else {
      toast.error("Failed to download PowerPoint");
    }
  }, [currentSpec, exportSlide, toast]);

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

        {/* Slide Editor with Live Preview and Edit Chat */}
        {(currentSpec || loading) && (
          <div className="animate-scale-in max-w-7xl mx-auto w-full">
            {loading ? (
              <div className="glass rounded-[var(--radius-2xl)] p-6 sm:p-8 lg:p-10 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--neutral-1)]">
                    Creating your slide...
                  </h2>
                </div>
                <ProgressIndicator isLoading={loading} />
              </div>
            ) : currentSpec ? (
              <div className="space-y-6">
                <SlideEditor
                  spec={currentSpec}
                  onUpdate={handleSlideUpdate}
                  onExport={handleDownload}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

