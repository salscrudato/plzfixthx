const region = import.meta.env.VITE_FUNCTIONS_REGION || "us-central1";
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "pls-fix-thx";

// ALWAYS use deployed production functions URL, even in development
function baseUrl() {
  return `https://${region}-${projectId}.cloudfunctions.net`;
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

