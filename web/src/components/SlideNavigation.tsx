import type { Slide } from "@/types/Presentation";

interface SlideNavigationProps {
  slides: Slide[];
  currentIndex: number;
  onSelectSlide: (index: number) => void;
  onRemoveSlide: (slideId: string) => void;
  onDuplicateSlide: (slideId: string) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function SlideNavigation({
  slides,
  currentIndex,
  onSelectSlide,
  onRemoveSlide,
  onDuplicateSlide,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
}: SlideNavigationProps) {
  if (slides.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="p-2 rounded-lg hover:bg-[var(--neutral-8)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6 text-[var(--neutral-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-[var(--neutral-2)]">
            Slide {currentIndex + 1} of {slides.length}
          </span>
        </div>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="p-2 rounded-lg hover:bg-[var(--neutral-8)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6 text-[var(--neutral-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Thumbnail Strip */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative flex-shrink-0 group"
            >
              <button
                onClick={() => onSelectSlide(index)}
                className={`relative w-32 h-20 rounded-lg border-2 transition-all overflow-hidden ${
                  index === currentIndex
                    ? 'border-[var(--color-primary)] shadow-lg scale-105'
                    : 'border-[var(--neutral-7)] hover:border-[var(--color-primary)] hover:shadow-md'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {/* Thumbnail preview */}
                <div className="w-full h-full bg-[var(--neutral-8)] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs font-bold text-[var(--neutral-3)] mb-1">
                      {slide.spec.content.title.text.slice(0, 20)}
                      {slide.spec.content.title.text.length > 20 ? '...' : ''}
                    </div>
                    <div className="text-[10px] text-[var(--neutral-4)]">
                      Slide {index + 1}
                    </div>
                  </div>
                </div>

                {/* Current indicator */}
                {index === currentIndex && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-primary)]" />
                )}
              </button>

              {/* Action buttons - show on hover */}
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSlide(slide.id);
                  }}
                  className="p-1.5 bg-white rounded-full shadow-md hover:bg-[var(--neutral-8)] border border-[var(--neutral-7)]"
                  aria-label="Duplicate slide"
                  title="Duplicate slide"
                >
                  <svg className="w-3 h-3 text-[var(--neutral-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>

                {slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete slide ${index + 1}?`)) {
                        onRemoveSlide(slide.id);
                      }
                    }}
                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 border border-[var(--neutral-7)]"
                    aria-label="Delete slide"
                    title="Delete slide"
                  >
                    <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-[var(--neutral-4)] text-center">
        Use <kbd className="px-1.5 py-0.5 bg-[var(--neutral-8)] rounded text-[10px] font-mono">←</kbd> and{' '}
        <kbd className="px-1.5 py-0.5 bg-[var(--neutral-8)] rounded text-[10px] font-mono">→</kbd> to navigate
      </div>
    </div>
  );
}

