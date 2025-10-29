import { useState, useCallback } from "react";
import { apiExport, apiExportPNG, apiExportPDF } from "@/lib/api";
import { logger } from "@/lib/logger";
import { handleError, retryWithBackoff } from "@/lib/errorHandler";
import {
  downloadBlob,
  generateFilename,
  validateExportBlob,
  type ExportFormat,
} from "@/lib/exportHandler";
import type { SlideSpecV1 } from "@plzfixthx/slide-spec";

export { type ExportFormat } from "@/lib/exportHandler";

export function useSlideExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportSlide = useCallback(
    async (spec: SlideSpecV1, format: ExportFormat = "pptx", customFilename?: string) => {
      setError(null);
      setExporting(true);

      const startTime = performance.now();
      logger.userAction("export_slide", { format, filename: customFilename });

      try {
        let blob: Blob;

        if (format === "pptx") {
          blob = await retryWithBackoff(() => apiExport(spec), 2, 500);
        } else if (format === "png" || format === "pdf") {
          // For PNG/PDF, we need the DOM element
          const element = document.querySelector('[aria-label="Slide preview"]') as HTMLElement;
          if (!element) {
            throw new Error("Slide preview element not found");
          }

          if (format === "png") {
            blob = await retryWithBackoff(() => apiExportPNG(element), 2, 500);
          } else {
            blob = await retryWithBackoff(() => apiExportPDF(element), 2, 500);
          }
        } else {
          throw new Error(`Unsupported export format: ${format}`);
        }

        // Validate blob
        if (!validateExportBlob(blob, format)) {
          throw new Error(`Invalid ${format.toUpperCase()} export`);
        }

        const duration = performance.now() - startTime;
        const filename = generateFilename(format, customFilename);

        downloadBlob(blob, filename);

        logger.performance("slide_export", duration);
        logger.info("Slide exported successfully", {
          format,
          filename,
          size: blob.size,
          duration,
        });

        return true;
      } catch (e: unknown) {
        const duration = performance.now() - startTime;
        const appError = handleError(e, { format, duration });
        setError(appError.userMessage);
        logger.error("Failed to export slide", e, { format, duration });
        return false;
      } finally {
        setExporting(false);
      }
    },
    []
  );

  return {
    exporting,
    error,
    exportSlide,
  };
}

