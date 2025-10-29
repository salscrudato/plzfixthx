/**
 * Unified Export Handler
 * ======================
 * Centralized logic for PPTX, PNG, and PDF exports with consistent file naming,
 * error handling, and performance tracking.
 */

import { logger } from "./logger";
import type { AppError } from "./errorHandler";

/* -------------------------------------------------------------------------- */
/*                            Export Types                                    */
/* -------------------------------------------------------------------------- */

export type ExportFormat = "pptx" | "png" | "pdf";

export interface ExportOptions {
  filename?: string;
  quality?: number; // 0-1 for PNG/PDF
  scale?: number; // For PNG/PDF rendering
  timeoutMs?: number;
}

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  filename: string;
  size: number;
  duration: number;
  error?: AppError;
}

/* -------------------------------------------------------------------------- */
/*                            File Naming                                     */
/* -------------------------------------------------------------------------- */

/**
 * Generate a consistent filename with timestamp
 */
export function generateFilename(format: ExportFormat, customName?: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const baseName = customName || "slide";
  const ext = format === "pptx" ? "pptx" : format === "pdf" ? "pdf" : "png";
  return `${baseName}-${timestamp}.${ext}`;
}

/**
 * Validate filename for safety
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, "-") // Remove invalid characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .slice(0, 255); // Limit length
}

/* -------------------------------------------------------------------------- */
/*                            Blob Download                                   */
/* -------------------------------------------------------------------------- */

/**
 * Trigger browser download of a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = sanitizeFilename(filename);
  document.body.appendChild(link);

  try {
    link.click();
    logger.info("Download triggered", { filename, size: blob.size });
  } catch (error) {
    logger.error("Download failed", error, { filename });
    throw error;
  } finally {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/* -------------------------------------------------------------------------- */
/*                            Export Utilities                                */
/* -------------------------------------------------------------------------- */

/**
 * Get MIME type for export format
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
}

/**
 * Get content disposition header value
 */
export function getContentDisposition(filename: string): string {
  return `attachment; filename="${sanitizeFilename(filename)}"`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/* -------------------------------------------------------------------------- */
/*                            Export Validation                               */
/* -------------------------------------------------------------------------- */

/**
 * Validate export blob
 */
export function validateExportBlob(blob: Blob | null, format: ExportFormat): boolean {
  if (!blob || blob.size === 0) {
    logger.warn("Invalid export blob", { format, size: blob?.size });
    return false;
  }

  const expectedMimeType = getMimeType(format);
  if (blob.type && blob.type !== expectedMimeType) {
    logger.warn("Unexpected MIME type", { format, expected: expectedMimeType, actual: blob.type });
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/*                            Export Tracking                                 */
/* -------------------------------------------------------------------------- */

/**
 * Track export metrics
 */
export function trackExport(
  format: ExportFormat,
  size: number,
  duration: number,
  success: boolean
): void {
  logger.performance(`export_${format}`, duration, "ms");
  logger.info("Export completed", {
    format,
    size: formatFileSize(size),
    duration,
    success,
  });
}

/* -------------------------------------------------------------------------- */
/*                            Export Result Builder                           */
/* -------------------------------------------------------------------------- */

/**
 * Build a successful export result
 */
export function buildExportResult(
  blob: Blob,
  format: ExportFormat,
  duration: number,
  customFilename?: string
): ExportResult {
  const filename = generateFilename(format, customFilename);
  trackExport(format, blob.size, duration, true);

  return {
    success: true,
    blob,
    filename,
    size: blob.size,
    duration,
  };
}

/**
 * Build a failed export result
 */
export function buildExportError(
  format: ExportFormat,
  error: AppError,
  duration: number
): ExportResult {
  const filename = generateFilename(format);
  logger.error(`Export failed: ${format}`, undefined, {
    error: error.message,
    duration,
  });

  return {
    success: false,
    filename,
    size: 0,
    duration,
    error,
  };
}

