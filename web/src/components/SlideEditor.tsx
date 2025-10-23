import { useCallback } from "react";
import { Edit3, RefreshCw } from "lucide-react";
import { SlideCanvas } from "./SlideCanvas";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";

interface SlideEditorProps {
  spec: SlideSpecV1;
  onUpdate: (updatedSpec: SlideSpecV1) => void;
  onExport?: () => void;
}

export function SlideEditor({ spec, onUpdate, onExport }: SlideEditorProps) {
  const handleRefresh = useCallback(() => {
    onUpdate(spec);
  }, [spec, onUpdate]);

  return (
    <div className="w-full space-y-6">
      {/* Slide Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--neutral-1)] flex items-center gap-2">
            <Edit3 size={20} className="text-[var(--color-primary)]" />
            Live Preview
          </h3>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-[var(--neutral-8)] rounded-lg transition-colors"
            title="Refresh preview"
          >
            <RefreshCw size={18} className="text-[var(--neutral-4)]" />
          </button>
        </div>

        <div className="glass rounded-[var(--radius-xl)] p-6 overflow-hidden shadow-xl border border-[var(--neutral-7)]">
          <SlideCanvas spec={spec} />
        </div>

        {/* Export Button */}
        {onExport && (
          <button
            onClick={onExport}
            className="w-full px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold rounded-lg hover:shadow-lg transition-all active:scale-95"
          >
            Export to PowerPoint
          </button>
        )}
      </div>
    </div>
  );
}

