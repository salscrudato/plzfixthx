import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Presentation } from "@/types/Presentation";
import { logger } from "./logger";

export interface PDFExportOptions {
  orientation?: "portrait" | "landscape";
  quality?: number;
  includeMetadata?: boolean;
}

export async function exportPresentationToPDF(
  presentation: Presentation,
  slideElements: HTMLElement[],
  options: PDFExportOptions = {}
): Promise<Blob> {
  const {
    orientation = "landscape",
    quality = 0.95,
    includeMetadata = true,
  } = options;

  const startTime = performance.now();
  logger.info("Starting PDF export", { 
    slideCount: presentation.slides.length,
    orientation 
  });

  try {
    // Create PDF document
    const pdf = new jsPDF({
      orientation,
      unit: "px",
      format: orientation === "landscape" ? [1920, 1080] : [1080, 1920],
      compress: true,
    });

    // Add metadata
    if (includeMetadata) {
      pdf.setProperties({
        title: presentation.title,
        subject: "Generated presentation",
        author: "plzfixthx",
        creator: "plzfixthx",
        keywords: "presentation, slides",
      });
    }

    // Process each slide
    for (let i = 0; i < slideElements.length; i++) {
      const element = slideElements[i];
      
      logger.info(`Rendering slide ${i + 1} to canvas`);
      
      // Convert slide to canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL("image/jpeg", quality);
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = pdf.internal.pageSize.getHeight();

      // Add new page for slides after the first
      if (i > 0) {
        pdf.addPage();
      }

      // Add image to PDF
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      
      logger.info(`Added slide ${i + 1} to PDF`);
    }

    // Generate blob
    const blob = pdf.output("blob");
    
    const duration = performance.now() - startTime;
    logger.performance("pdf_export", duration);
    logger.info("PDF export completed", { 
      slideCount: presentation.slides.length,
      size: blob.size,
      duration 
    });

    return blob;
  } catch (error) {
    logger.error("PDF export failed", error);
    throw new Error("Failed to export presentation to PDF");
  }
}

export async function downloadPDF(
  presentation: Presentation,
  slideElements: HTMLElement[],
  filename?: string,
  options?: PDFExportOptions
): Promise<void> {
  const blob = await exportPresentationToPDF(presentation, slideElements, options);
  
  const finalFilename = filename || 
    `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = finalFilename;
  a.click();
  URL.revokeObjectURL(url);
  
  logger.info("PDF downloaded", { filename: finalFilename });
}

