import type { SlideSpec } from "@/types/SlideSpecV1";

/** Env helpers */
const region = import.meta.env.VITE_FUNCTIONS_REGION || "us-central1";
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "pls-fix-thx";
const baseOverride = import.meta.env.VITE_FUNCTIONS_BASE_URL;
const useProd = !!import.meta.env.VITE_USE_PRODUCTION_FUNCTIONS;

/** Resolve base URL for Cloud Functions (supports local emulator) */
function baseUrl(): string {
  // Prefer explicit override
  if (baseOverride) return baseOverride;

  // Dev → emulator unless forced to prod
  if (import.meta.env.DEV && !useProd) {
    // Emulator for HTTPS onRequest v2: http://127.0.0.1:5001/{project}/{region}
    return `http://127.0.0.1:5001/${projectId}/${region}`;
  }

  // Default deployed endpoint (v2 still supports cloudfunctions.net routing)
  return `https://${region}-${projectId}.cloudfunctions.net`;
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

/** Utility to trigger a browser download */
export function downloadBlob(blob: Blob, filename = "plzfixthx-presentation.pptx") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}