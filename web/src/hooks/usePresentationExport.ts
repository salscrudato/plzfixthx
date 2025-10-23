import { useState, useCallback } from "react";
import { apiExport, apiExportMultiple } from "@/lib/api";
import { logger } from "@/lib/logger";
import type { Presentation } from "@/types/Presentation";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";

export function usePresentationExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportPresentation = useCallback(async (presentation: Presentation, filename?: string) => {
    setError(null);
    setExporting(true);

    const startTime = performance.now();
    const finalFilename = filename || `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx`;
    
    logger.userAction("export_presentation", { 
      filename: finalFilename, 
      slideCount: presentation.slides.length 
    });

    try {
      const specs = presentation.slides.map(slide => slide.spec);
      
      let blob: Blob;
      if (specs.length === 1) {
        // Single slide - use original API for backward compatibility
        blob = await apiExport(specs[0]);
      } else {
        // Multiple slides
        blob = await apiExportMultiple(specs);
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalFilename;
      a.click();
      URL.revokeObjectURL(url);

      const duration = performance.now() - startTime;
      logger.performance("presentation_export", duration);
      logger.info("Presentation exported successfully", { 
        filename: finalFilename, 
        slideCount: specs.length,
        size: blob.size, 
        duration 
      });

      return true;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to export presentation";
      setError(errorMessage);
      logger.error("Failed to export presentation", e, { filename: finalFilename });
      return false;
    } finally {
      setExporting(false);
    }
  }, []);

  const exportSingleSlide = useCallback(async (spec: SlideSpecV1, filename = "slide.pptx") => {
    setError(null);
    setExporting(true);

    const startTime = performance.now();
    logger.userAction("export_single_slide", { filename });

    try {
      const blob = await apiExport(spec);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      const duration = performance.now() - startTime;
      logger.performance("single_slide_export", duration);
      logger.info("Single slide exported successfully", { filename, size: blob.size, duration });

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
    exportPresentation,
    exportSingleSlide,
  };
}

