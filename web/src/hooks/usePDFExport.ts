import { useState, useCallback } from "react";
import { downloadPDF, type PDFExportOptions } from "@/lib/pdfExport";
import type { Presentation } from "@/types/Presentation";
import { logger } from "@/lib/logger";

export function usePDFExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const exportToPDF = useCallback(
    async (
      presentation: Presentation,
      slideElements: HTMLElement[],
      filename?: string,
      options?: PDFExportOptions
    ) => {
      setError(null);
      setExporting(true);
      setProgress(0);

      logger.userAction("export_pdf", { 
        filename: filename || presentation.title,
        slideCount: presentation.slides.length 
      });

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        await downloadPDF(presentation, slideElements, filename, options);

        clearInterval(progressInterval);
        setProgress(100);

        // Reset after a short delay
        setTimeout(() => {
          setProgress(0);
          setExporting(false);
        }, 1000);

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to export PDF";
        setError(errorMessage);
        logger.error("PDF export failed", err);
        setExporting(false);
        setProgress(0);
        return false;
      }
    },
    []
  );

  return {
    exporting,
    error,
    progress,
    exportToPDF,
  };
}

