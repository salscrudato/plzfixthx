import type { SlideSpec } from "@plzfixthx/slide-spec";

/** Env helpers */
const region = import.meta.env.VITE_FUNCTIONS_REGION || "us-central1";
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "plsfixthx-ai-2025";
const baseOverride = import.meta.env.VITE_FUNCTIONS_BASE_URL;

/**
 * Resolve base URL for Cloud Functions.
 *
 * PRODUCTION/STAGING: Always uses deployed endpoints.
 * DEVELOPMENT: Uses deployed endpoints by default. Set VITE_FUNCTIONS_BASE_URL to override.
 *
 * Emulator usage is blocked in production builds to ensure all testing happens against deployed functions.
 */
export function baseUrl(): string {
  // Prefer explicit override
  if (baseOverride) {
    // Guard: Block emulator URLs in production builds
    if (import.meta.env.PROD && isEmulatorUrl(baseOverride)) {
      throw new Error(
        `PRODUCTION BUILD ERROR: Emulator URL detected in VITE_FUNCTIONS_BASE_URL. ` +
        `Production builds must use deployed Firebase Functions. ` +
        `Remove emulator URL from environment configuration.`
      );
    }
    return baseOverride;
  }

  // Always use deployed endpoint (no emulator support)
  return `https://${region}-${projectId}.cloudfunctions.net`;
}

/**
 * Detect emulator URLs to prevent accidental production usage
 */
function isEmulatorUrl(url: string): boolean {
  const emulatorPatterns = [
    /localhost/i,
    /127\.0\.0\.1/,
    /0\.0\.0\.0/,
    /:5001\b/, // Firebase Functions emulator default port
    /\[::1\]/, // IPv6 localhost
  ];
  return emulatorPatterns.some(pattern => pattern.test(url));
}

/** Fetch with timeout, one retry on transient errors */
async function postJson<TResp>(
  path: string,
  body: unknown,
  opts?: { timeoutMs?: number }
): Promise<TResp> {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const timeoutMs = opts?.timeoutMs ?? 20000;

  const attempt = async (): Promise<Response> => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body ?? {}),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(t);
    }
  };

  // One retry on network error or 5xx
  let resp: Response;
  try {
    resp = await attempt();
  } catch (e) {
    resp = await attempt();
  }
  if (!resp.ok) {
    const text = await safeText(resp);
    throw new Error(text || `HTTP ${resp.status}`);
  }
  return (await resp.json()) as TResp;
}

/** Fetch returning Blob (for PPTX download) */
async function postBlob(
  path: string,
  body: unknown,
  opts?: { timeoutMs?: number }
): Promise<Blob> {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const timeoutMs = opts?.timeoutMs ?? 30000;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error((await safeText(resp)) || `HTTP ${resp.status}`);
    return await resp.blob();
  } finally {
    clearTimeout(t);
  }
}

async function safeText(r: Response): Promise<string> {
  try {
    return await r.text();
  } catch {
    return "";
  }
}

/* ---------------------------------------------------------------------------------- */
/*                                      API                                           */
/* ---------------------------------------------------------------------------------- */

export async function apiGenerate(prompt: string): Promise<{ spec: SlideSpec }> {
  if (!prompt || !prompt.trim()) throw new Error("Prompt is required");
  return postJson<{ spec: SlideSpec }>("/generateSlideSpec", { prompt }, { timeoutMs: 60000 });
}

export async function apiExport(spec: SlideSpec): Promise<Blob> {
  return postBlob("/exportPPTX", { spec }, { timeoutMs: 60000 });
}

export async function apiExportMultiple(specs: SlideSpec[]): Promise<Blob> {
  if (!Array.isArray(specs) || specs.length === 0) {
    throw new Error("At least one slide spec is required");
  }
  return postBlob("/exportPPTX", { specs });
}

/** Export slide preview as PNG (3x scale for crisp rendering) */
export async function apiExportPNG(element: HTMLElement): Promise<Blob> {
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(element, {
    scale: 3, // 3x scale for professional quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
  });
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, "image/png", 0.95); // 95% quality
  });
}

/** Export slide preview as PDF (3x scale for crisp rendering) */
export async function apiExportPDF(element: HTMLElement): Promise<Blob> {
  const { default: html2canvas } = await import("html2canvas");
  const { jsPDF } = await import("jspdf");

  const canvas = await html2canvas(element, {
    scale: 3, // 3x scale for professional quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png", 0.95); // 95% quality
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "mm",
    format: [canvas.width / 3.78, canvas.height / 3.78],
  });

  pdf.addImage(imgData, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
  return new Promise((resolve) => {
    const blob = pdf.output("blob");
    resolve(blob);
  });
}

// Note: downloadBlob has been moved to exportHandler.ts for centralized export management