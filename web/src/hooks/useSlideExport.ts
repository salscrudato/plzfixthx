import { useState, useCallback } from "react";
import { apiExport, apiExportPNG, apiExportPDF, downloadBlob } from "@/lib/api";
import { logger } from "@/lib/logger";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";

export type ExportFormat = "pptx" | "png" | "pdf";

export function useSlideExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportSlide = useCallback(
    async (spec: SlideSpecV1, format: ExportFormat = "pptx", filename?: string) => {
      setError(null);
      setExporting(true);

      const startTime = performance.now();
      const defaultFilename = {
        pptx: "plzfixthx-slide.pptx",
        png: "plzfixthx-slide.png",
        pdf: "plzfixthx-slide.pdf",
      }[format];

      const finalFilename = filename || defaultFilename;
      logger.userAction("export_slide", { format, filename: finalFilename });

      try {
        let blob: Blob;

        if (format === "pptx") {
          blob = await apiExport(spec);
        } else if (format === "png" || format === "pdf") {
          // For PNG/PDF, we need the DOM element
          const element = document.querySelector('[aria-label="Slide preview"]') as HTMLElement;
          if (!element) {
            throw new Error("Slide preview element not found");
          }

          if (format === "png") {
            blob = await apiExportPNG(element);
          } else {
            blob = await apiExportPDF(element);
          }
        } else {
          throw new Error(`Unsupported export format: ${format}`);
        }

        downloadBlob(blob, finalFilename);

        const duration = performance.now() - startTime;
        logger.performance("slide_export", duration);
        logger.info("Slide exported successfully", {
          format,
          filename: finalFilename,
          size: blob.size,
          duration,
        });

        return true;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Failed to export slide";
        setError(errorMessage);
        logger.error("Failed to export slide", e, { format, filename: finalFilename });
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

