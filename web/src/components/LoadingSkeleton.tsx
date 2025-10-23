export function LoadingSkeleton() {
  return (
    <div className="relative w-full aspect-video bg-[var(--neutral-6)] overflow-hidden rounded-[var(--radius-lg)] p-[var(--space-5)] animate-pulse">
      <div className="h-full w-full flex flex-col gap-4">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-[var(--neutral-5)] rounded w-3/4"></div>
          <div className="h-4 bg-[var(--neutral-5)] rounded w-1/2"></div>
        </div>
        
        {/* Body skeleton */}
        <div className="flex-1 grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-3">
            <div className="h-4 bg-[var(--neutral-5)] rounded w-full"></div>
            <div className="h-4 bg-[var(--neutral-5)] rounded w-5/6"></div>
            <div className="h-4 bg-[var(--neutral-5)] rounded w-4/5"></div>
            <div className="h-4 bg-[var(--neutral-5)] rounded w-full"></div>
            <div className="h-4 bg-[var(--neutral-5)] rounded w-3/4"></div>
          </div>
          <div className="col-span-1">
            <div className="h-32 bg-[var(--neutral-5)] rounded"></div>
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/5">
        <div className="text-[var(--neutral-3)] text-lg font-medium">
          Generating your slide...
        </div>
      </div>
    </div>
  );
}

