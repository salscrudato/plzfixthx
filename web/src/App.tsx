import { useCallback, useEffect, useState } from "react";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { SlideCanvas } from "@/components/SlideCanvas";
import { SlideSkeleton } from "@/components/SlideSkeleton";
import { useSlideGeneration } from "@/hooks/useSlideGeneration";
import { useSlideGenerationStream } from "@/hooks/useSlideGenerationStream";
import { useSlideExport, type ExportFormat } from "@/hooks/useSlideExport";
import { isStreamingEnabled } from "@/lib/env";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";
import { Download, FileText, Image } from "lucide-react";

export default function App() {
  const useStreaming = isStreamingEnabled();
  const { loading: loadingRegular, spec: specRegular, error: errorRegular, generate: generateRegular } = useSlideGeneration();
  const { loading: loadingStream, spec: specStream, error: errorStream, generateStream } = useSlideGenerationStream();

  const loading = useStreaming ? loadingStream : loadingRegular;
  const spec = useStreaming ? specStream : specRegular;
  const error = useStreaming ? errorStream : errorRegular;
  const generate = useStreaming ? generateStream : generateRegular;

  const { exportSlide } = useSlideExport();
  const [specs, setSpecs] = useState<SlideSpecV1[]>([]);
  const [prompt, setPrompt] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Professional prompt validation
  const MAX_PROMPT_LENGTH = 500;
  const MIN_PROMPT_LENGTH = 10;
  const charCount = prompt.length;
  const isPromptValid = charCount >= MIN_PROMPT_LENGTH && charCount <= MAX_PROMPT_LENGTH;

  useEffect(() => {
    if (spec) {
      setSpecs((prev) => [...prev, spec]);
    }
  }, [spec]);

  useEffect(() => {
    if (error) {
      setErrorMsg(error);
      setTimeout(() => setErrorMsg(null), 8000); // Extended timeout
    }
  }, [error]);

  const handleGenerate = useCallback(async () => {
    const trimmedPrompt = prompt.trim();

    // Validation
    if (!trimmedPrompt) {
      setErrorMsg("Please enter a prompt to generate a slide");
      return;
    }
    if (trimmedPrompt.length < MIN_PROMPT_LENGTH) {
      setErrorMsg(`Prompt too short. Please provide at least ${MIN_PROMPT_LENGTH} characters for better results.`);
      return;
    }
    if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
      setErrorMsg(`Prompt too long. Please keep it under ${MAX_PROMPT_LENGTH} characters.`);
      return;
    }

    setErrorMsg(null);
    setShowSuggestions(false);
    await generate(trimmedPrompt);
  }, [prompt, generate]);

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && prompt.trim() && !loading) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prompt, loading, handleGenerate]);

  const handleDownload = useCallback(
    async (format: ExportFormat = "pptx") => {
      if (specs.length === 0) return;
      const success = await exportSlide(specs[specs.length - 1], format); // Export latest or all?
      if (!success) {
        setErrorMsg(`Failed to download ${format.toUpperCase()}. Please try again.`);
      }
    },
    [specs, exportSlide]
  );

  const handleRetry = useCallback(() => {
    setErrorMsg(null);
    handleGenerate();
  }, [handleGenerate]);

  const suggestions = [
    "Q3 revenue growth strategy with bar chart",
    "Team organization chart for startup",
    "SWOT analysis for new product launch",
    "Roadmap for AI implementation in healthcare",
  ];

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
        <header className="text-center space-y-4 py-8 sm:py-12 transition-all duration-500">
          <div className="inline-block">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-accent)] bg-clip-text text-transparent mb-3" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              plsfixthx
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full"></div>
          </div>
          <p className="text-lg sm:text-xl text-[var(--neutral-3)] max-w-2xl mx-auto font-medium leading-relaxed">
            Create beautiful, professional slides with AI
          </p>
          <p className="text-sm text-[var(--neutral-4)] max-w-2xl mx-auto leading-relaxed">
            Consulting-firm quality • Context-aware design • Instant export
          </p>
        </header>

        {/* Input Section */}
        <main id="main-content" className="max-w-4xl mx-auto w-full px-4 sm:px-6">
          <div className="glass rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-4 border border-white/10 backdrop-blur-xl shadow-lg transition-all duration-500">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <label htmlFor="slide-prompt" className="block text-sm font-medium text-[var(--neutral-2)]">
                  Describe your slide
                </label>
                <span className={`text-xs font-medium ${charCount > MAX_PROMPT_LENGTH ? 'text-red-500' : charCount > MAX_PROMPT_LENGTH * 0.8 ? 'text-amber-500' : 'text-[var(--neutral-4)]'}`}>
                  {charCount}/{MAX_PROMPT_LENGTH}
                </span>
              </div>
              <p className="text-xs text-[var(--neutral-4)]">
                Be specific about content, style, or data you want to include (min {MIN_PROMPT_LENGTH} characters)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="slide-prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
                onKeyDown={(e) => e.key === "Enter" && isPromptValid && !loading && handleGenerate()}
                placeholder="e.g., 'Q3 revenue growth strategy with 3 key initiatives and bar chart'"
                disabled={loading}
                maxLength={MAX_PROMPT_LENGTH}
                aria-label="Slide prompt input"
                aria-describedby="prompt-help"
                className="flex-1 px-4 py-3 rounded-[var(--radius-md)] bg-[var(--neutral-8)] text-[var(--neutral-1)] placeholder-[var(--neutral-4)] border border-[var(--neutral-6)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50 transition-all duration-200 min-h-[44px]"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !isPromptValid}
                aria-label={loading ? "Generating slide" : "Generate slide"}
                aria-busy={loading}
                title={!isPromptValid ? `Prompt must be ${MIN_PROMPT_LENGTH}-${MAX_PROMPT_LENGTH} characters` : ''}
                className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] font-semibold hover:shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 min-h-[44px] sm:w-auto w-full"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin" aria-hidden="true">⚡</span>
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : (
                  "Generate"
                )}
              </button>
            </div>

            {errorMsg && (
              <div
                role="alert"
                aria-live="polite"
                className="p-4 bg-red-50/90 border-l-4 border-red-500 rounded-[var(--radius-md)] text-red-700 text-sm flex gap-3 items-start shadow-md transition-all duration-300"
              >
                <span className="text-red-500 flex-shrink-0 mt-0.5 font-bold text-lg" aria-hidden="true">✕</span>
                <div className="flex-1">
                  <p className="font-semibold mb-1">Error generating slide</p>
                  <p className="text-red-600 text-sm">{errorMsg}</p>
                  <p className="text-red-500 text-xs mt-2 opacity-75">Try rephrasing or check connection</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            )}

            {loading && <ProgressIndicator isLoading={true} />}

            {showSuggestions && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-[var(--neutral-2)] mb-2">Try these prompts:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(sug)}
                      className="text-left p-3 bg-[var(--neutral-7)] rounded-[var(--radius-md)] text-[var(--neutral-2)] text-sm hover:bg-[var(--neutral-6)] transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Preview and Download */}
        {(specs.length > 0 || loading) && (
          <div className={`mt-12 space-y-8 transition-all duration-500 ${loading ? "opacity-75 pointer-events-none" : ""}`}>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-[var(--neutral-1)]">
                  {loading ? "Generating your slide..." : "Your Slide Preview"}
                </h2>
                <p className="text-[var(--neutral-3)] text-sm">
                  {loading ? "Creating professional slide with AI..." : "Ready to download in multiple formats"}
                </p>
              </div>
              {loading ? <SlideSkeleton /> : specs[specs.length - 1] && <SlideCanvas spec={specs[specs.length - 1]} />}
              <div className="flex justify-center gap-2 sm:gap-3 flex-wrap px-4 sm:px-0">
                <button
                  onClick={() => handleDownload("pptx")}
                  disabled={loading || specs.length === 0}
                  aria-label="Download as PowerPoint"
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] font-semibold hover:shadow-2xl hover:opacity-90 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 min-h-[44px] flex-1 sm:flex-none"
                  title="Download as PowerPoint (.pptx)"
                >
                  <Download size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">PowerPoint</span>
                  <span className="sm:hidden">PPTX</span>
                </button>
                <button
                  onClick={() => handleDownload("pdf")}
                  disabled={loading || specs.length === 0}
                  aria-label="Download as PDF"
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[var(--color-accent)] text-white rounded-[var(--radius-md)] font-semibold hover:shadow-2xl hover:opacity-90 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 min-h-[44px] flex-1 sm:flex-none"
                  title="Download as PDF"
                >
                  <FileText size={16} aria-hidden="true" />
                  PDF
                </button>
                <button
                  onClick={() => handleDownload("png")}
                  disabled={loading || specs.length === 0}
                  aria-label="Download as PNG"
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[var(--neutral-6)] text-[var(--neutral-1)] rounded-[var(--radius-md)] font-semibold hover:bg-[var(--neutral-5)] disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs sm:text-sm border border-[var(--neutral-5)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-6)] focus:ring-offset-2 min-h-[44px] flex-1 sm:flex-none"
                  title="Download as PNG"
                >
                  <Image size={16} aria-hidden="true" />
                  PNG
                </button>
                <button
                  onClick={() => {
                    setPrompt("");
                    setSpecs([]);
                    setShowSuggestions(true);
                  }}
                  disabled={loading}
                  aria-label="Create another slide"
                  className="px-4 sm:px-6 py-3 bg-[var(--neutral-7)] text-[var(--neutral-1)] rounded-[var(--radius-md)] font-semibold hover:bg-[var(--neutral-6)] disabled:opacity-50 transition-all duration-200 border border-[var(--neutral-6)] hover:border-[var(--neutral-5)] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neutral-7)] focus:ring-offset-2 min-h-[44px] flex-1 sm:flex-none"
                  title="Create another slide"
                >
                  <span className="hidden sm:inline">Create Another</span>
                  <span className="sm:hidden">New</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}