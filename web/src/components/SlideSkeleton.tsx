/**
 * Loading skeleton for slide preview
 * Shows a placeholder while slide is being generated
 */

export function SlideSkeleton() {
  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--neutral-7)] to-[var(--neutral-6)] border border-white/10 animate-pulse"
        style={{ aspectRatio: "16 / 9" }}
        aria-label="Loading slide preview"
        aria-busy="true"
      >
        {/* Left accent bar */}
        <div
          className="absolute inset-y-0 left-0 w-1 bg-[var(--color-primary)]/30"
          aria-hidden="true"
        />

        {/* Header skeleton */}
        <div className="absolute top-12 left-8 right-8 space-y-3">
          <div className="h-12 bg-[var(--neutral-5)]/50 rounded-lg w-3/4" />
          <div className="h-6 bg-[var(--neutral-5)]/30 rounded-lg w-1/2" />
        </div>

        {/* Content skeleton */}
        <div className="absolute bottom-12 left-8 right-8 space-y-2">
          <div className="h-4 bg-[var(--neutral-5)]/40 rounded w-full" />
          <div className="h-4 bg-[var(--neutral-5)]/40 rounded w-5/6" />
          <div className="h-4 bg-[var(--neutral-5)]/40 rounded w-4/5" />
        </div>

        {/* Shimmer effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

