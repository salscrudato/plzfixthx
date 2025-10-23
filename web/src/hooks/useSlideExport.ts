import { useState, useCallback } from "react";
import { apiExport } from "@/lib/api";
import { logger } from "@/lib/logger";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";

export function useSlideExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportSlide = useCallback(async (spec: SlideSpecV1, filename = "plzfixthx-slide.pptx") => {
    setError(null);
    setExporting(true);

    const startTime = performance.now();
    logger.userAction("export_slide", { filename });

    try {
      const blob = await apiExport(spec);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      const duration = performance.now() - startTime;
      logger.performance("slide_export", duration);
      logger.info("Slide exported successfully", { filename, size: blob.size, duration });

      return true;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to export slide";
      setError(errorMessage);
      logger.error("Failed to export slide", e, { filename });
      return false;
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exporting,
    error,
    exportSlide
  };
}

