import { useEffect, useState } from "react";

interface ProgressIndicatorProps {
  isLoading: boolean;
  estimatedDuration?: number; // in milliseconds
}

export function ProgressIndicator({ isLoading, estimatedDuration = 5000 }: ProgressIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Initializing...");

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setStage("Initializing...");
      return;
    }

    const stages = [
      { progress: 20, label: "Analyzing prompt...", duration: 500 },
      { progress: 40, label: "Generating content...", duration: 2000 },
      { progress: 70, label: "Designing layout...", duration: 1500 },
      { progress: 90, label: "Finalizing slide...", duration: 1000 },
    ];

    let currentStageIndex = 0;
    let currentProgress = 0;

    const updateProgress = () => {
      if (currentStageIndex >= stages.length) return;

      const stage = stages[currentStageIndex];
      setStage(stage.label);

      const increment = (stage.progress - currentProgress) / (stage.duration / 50);
      
      const interval = setInterval(() => {
        currentProgress += increment;
        if (currentProgress >= stage.progress) {
          currentProgress = stage.progress;
          clearInterval(interval);
          currentStageIndex++;
          if (currentStageIndex < stages.length) {
            setTimeout(updateProgress, 100);
          }
        }
        setProgress(Math.min(currentProgress, 95)); // Never reach 100% until actually done
      }, 50);

      return () => clearInterval(interval);
    };

    updateProgress();
  }, [isLoading, estimatedDuration]);

  if (!isLoading) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--neutral-2)] font-medium">{stage}</span>
        <span className="text-[var(--neutral-3)] font-mono">{Math.round(progress)}%</span>
      </div>
      
      <div className="relative h-2 bg-[var(--neutral-8)] rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-[var(--neutral-4)]">
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>This usually takes 3-5 seconds</span>
      </div>
    </div>
  );
}

