const region = import.meta.env.VITE_FUNCTIONS_REGION || "us-central1";
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "pls-fix-thx";

// Use local emulator in development, deployed functions in production
function baseUrl() {
  // Check if we're in development mode and should use emulator
  const isDev = import.meta.env.DEV;
  const useEmulator = isDev && !import.meta.env.VITE_USE_PRODUCTION_FUNCTIONS;

  if (useEmulator) {
    return "http://127.0.0.1:5001/pls-fix-thx/us-central1";
  }

  // For Firebase Functions v2 (2nd Gen), use the direct function URLs
  // These are Cloud Run URLs, not the old cloudfunctions.net format
  return import.meta.env.VITE_FUNCTIONS_BASE_URL || `https://${region}-${projectId}.cloudfunctions.net`;
}

export async function apiGenerate(prompt: string) {
  const r = await fetch(`${baseUrl()}/generateSlideSpec`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function apiExport(spec: unknown) {
  const r = await fetch(`${baseUrl()}/exportPPTX`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ spec })
  });
  if (!r.ok) throw new Error(await r.text());
  const blob = await r.blob();
  return blob;
}

export async function apiExportMultiple(specs: unknown[]) {
  const r = await fetch(`${baseUrl()}/exportPPTX`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ specs })
  });
  if (!r.ok) throw new Error(await r.text());
  const blob = await r.blob();
  return blob;
}

