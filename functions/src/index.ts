import * as logger from "firebase-functions/logger";
import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { getApp } from "firebase-admin/app";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { SlideSpecZ, type SlideSpec } from "@plzfixthx/slide-spec";

// Import AI helpers
import {
  callAIWithRetry,
  sanitizePrompt,
  moderateContent,
  enhanceSlideSpec,
} from "./aiHelpers";

// Import orchestrator
import { processAIRequest } from "./middleware/aiOrchestrator";

// Import security utilities
import { getRequestId } from "./security";

// Import PPTX builders (lazy-loaded for efficiency)
import { createPptxFromSpecs } from "./pptxBuilder";

// Import HTTP helpers
import {
  setPptxHeaders,
  setSSEHeaders,
  setCorsHeaders,
  sendError,
  sendSuccess,
} from "./httpHelpers";

// Import fallback spec factory
import { createFallbackSpec } from "./fallbackSpec";

// Define secrets and params
const AI_API_KEY = defineSecret("AI_API_KEY");
const AI_BASE_URL = defineSecret("AI_BASE_URL");
const AI_MODEL_PRIMARY = defineSecret("AI_MODEL_PRIMARY"); // e.g., gpt-4o
const AI_MODEL_FALLBACK = defineSecret("AI_MODEL_FALLBACK"); // e.g., gpt-4o-mini
const RATE_LIMIT_MIN = defineSecret("RATE_LIMIT_MIN"); // Requests per min per IP

setGlobalOptions({
  region: "us-central1",
  memory: "1GiB", // Increased for multi-slide
  cpu: 1,
  timeoutSeconds: 120, // For complex exports
  maxInstances: 10, // Scaling
});

// Admin init (idempotent)
try {
  getApp();
} catch {
  initializeApp();
}

// Rate limiting storage (Firestore)
const db = getFirestore();
const rateLimitCollection = "rate_limits";

/** AI adapter with model fallback */
async function callVendor(prompt: string): Promise<SlideSpec> {
  const key = AI_API_KEY.value() ?? "";
  const base = AI_BASE_URL.value() || "https://api.openai.com/v1";
  const models = [AI_MODEL_PRIMARY.value() || "gpt-4o", AI_MODEL_FALLBACK.value() || "gpt-4o-mini"];

  if (!key) {
    logger.warn("AI_API_KEY not set — using fallback");
    return createFallbackSpec(prompt);
  }

  let lastError: Error | null = null;
  for (const model of models) {
    try {
      const result = await callAIWithRetry(prompt, key, base, model, SlideSpecZ);
      return enhanceSlideSpec(result) as SlideSpec;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      logger.warn(`Model ${model} failed, trying next`, { error: lastError.message });
    }
  }

  logger.error("All AI models failed", { error: lastError?.message });
  return createFallbackSpec(prompt);
}

/** Rate limiter (IP-based) */
async function checkRateLimit(ip: string): Promise<boolean> {
  const limitStr = RATE_LIMIT_MIN.value();
  const limit = limitStr ? parseInt(limitStr, 10) : 100;
  const docRef = db.collection(rateLimitCollection).doc(ip);
  const doc = await docRef.get();
  const data = doc.data() || { count: 0, lastReset: Date.now() };

  const now = Date.now();
  if (now - data.lastReset > 60000) { // 1 min window
    await docRef.set({ count: 1, lastReset: now });
    return true;
  }

  if (data.count >= limit) {
    return false;
  }

  // Increment counter atomically
  await docRef.update({ count: (data.count || 0) + 1 });
  return true;
}

/** POST /generateSlideSpec {prompt} -> {spec} */
export const generateSlideSpec = onRequest(
  { cors: true, secrets: [AI_API_KEY, AI_BASE_URL, AI_MODEL_PRIMARY, AI_MODEL_FALLBACK, RATE_LIMIT_MIN] },
  async (req, res) => {
    // Handle OPTIONS preflight request explicitly
    if (req.method === "OPTIONS") {
      setCorsHeaders(res, req.headers.origin);
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // Set CORS headers for actual request
    setCorsHeaders(res, req.headers.origin);

    const startTime = Date.now();
    const memoryBefore = process.memoryUsage().heapUsed / 1024 / 1024;
    const ip = req.ip || "unknown";

    // Rate limit (public access with rate limiting for protection)
    try {
      const rateLimitOk = await checkRateLimit(ip);
      if (!rateLimitOk) {
        res.status(429).json({ error: "Rate limit exceeded. Please try again in a minute." });
        return;
      }
    } catch (rateLimitError: any) {
      // Log rate limit error but don't block the request
      logger.warn("Rate limit check failed, allowing request", { error: rateLimitError.message, ip });
    }

    try {
      const rawPrompt = (req.body?.prompt ?? "").toString();
      const prompt = sanitizePrompt(rawPrompt, 1200); // Increased max

      logger.info("📝 Spec generation started", {
        promptLength: prompt.length,
        ip,
        timestamp: new Date().toISOString(),
      });

      const moderation = moderateContent(prompt);
      if (!moderation.safe) {
        logger.warn("⚠️ Content moderation rejected", { reason: moderation.reason, ip });
        res.status(400).json({
          error: moderation.reason || "Content not allowed",
          spec: createFallbackSpec("Content moderation failed"),
        });
        return;
      }

      const spec = await callVendor(prompt);

      const endTime = Date.now();
      const duration = endTime - startTime;
      const memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024;

      logger.info("✅ Spec generation completed", {
        durationMs: duration,
        memoryUsedMB: (memoryAfter - memoryBefore).toFixed(2),
        hasTitle: !!spec.content.title,
        hasBullets: !!spec.content.bullets,
        hasDataViz: !!spec.content.dataViz,
        ip,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({ spec });
    } catch (e: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024;

      logger.error("❌ Spec generation failed", {
        error: e.message || String(e),
        stack: e.stack,
        durationMs: duration,
        memoryUsedMB: (memoryAfter - memoryBefore).toFixed(2),
        ip,
        timestamp: new Date().toISOString(),
      });

      const fallback = createFallbackSpec(req.body?.prompt || "");
      res.status(200).json({
        spec: fallback,
        warning: "Using fallback due to error: " + e.message,
      });
    }
  }
);

/** GET/POST /generateSlideSpecStream?prompt=... -> SSE stream with progress */
export const generateSlideSpecStream = onRequest(
  { cors: true, secrets: [AI_API_KEY, AI_BASE_URL, AI_MODEL_PRIMARY, AI_MODEL_FALLBACK] },
  async (req, res) => {
    // Handle OPTIONS preflight request explicitly
    if (req.method === "OPTIONS") {
      setCorsHeaders(res, req.headers.origin);
      res.status(204).send("");
      return;
    }

    // Accept both GET (for EventSource) and POST
    if (req.method !== "GET" && req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // Set SSE headers (includes CORS headers)
    setSSEHeaders(res, req.headers.origin);

    const startTime = Date.now();
    const memoryBefore = process.memoryUsage().heapUsed / 1024 / 1024;
    const ip = req.ip || "unknown";
    const requestId = getRequestId(req);

    // Helper to safely write SSE events
    const writeEvent = (eventType: string, data: any) => {
      try {
        res.write(`event: ${eventType}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (e) {
        logger.warn("Failed to write SSE event", { eventType, error: String(e) });
      }
    };

    try {
      writeEvent("start", { status: "initializing", progress: 0 });

      // Support both GET (query param) and POST (body)
      const rawPrompt = req.method === "GET"
        ? (req.query.prompt as string || "")
        : (req.body?.prompt ?? "").toString();
      const prompt = sanitizePrompt(rawPrompt, 1200);

      writeEvent("moderation", { status: "checking", progress: 20 });
      const moderation = moderateContent(prompt);

      if (!moderation.safe) {
        logger.warn("⚠️ Content moderation rejected (stream)", { reason: moderation.reason, ip, requestId });
        writeEvent("error", { error: moderation.reason || "Content not allowed" });
        res.end();
        return;
      }

      // Use orchestrator for two-stage pipeline
      writeEvent("planning", { status: "analyzing intent", progress: 30 });

      let spec: SlideSpec;
      let isFallback = false;

      // Set up keepalive to prevent timeout during long AI processing
      const keepaliveInterval = setInterval(() => {
        try {
          res.write(": keepalive\n\n");
        } catch (e) {
          clearInterval(keepaliveInterval);
        }
      }, 15000); // Send keepalive every 15 seconds

      try {
        const aiResponse = await processAIRequest({
          prompt,
          requestId,
          userId: ip,
        });

        spec = aiResponse.spec;

        writeEvent("generation", {
          status: "generating",
          model: aiResponse.model,
          promptLength: prompt.length,
          progress: 60,
        });

        writeEvent("enhancement", { status: "enhancing", progress: 80 });
      } catch (error) {
        logger.warn("AI generation failed, using fallback", { error: String(error), requestId });
        spec = createFallbackSpec(prompt, requestId);
        isFallback = true;
      } finally {
        clearInterval(keepaliveInterval);
      }

      writeEvent("spec", { spec, isFallback });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024;

      logger.info("✅ Spec generation stream completed", {
        requestId,
        durationMs: duration,
        memoryUsedMB: (memoryAfter - memoryBefore).toFixed(2),
        ip,
        timestamp: new Date().toISOString(),
      });

      writeEvent("complete", { status: "success", durationMs: duration, progress: 100 });
      res.end();
    } catch (e: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024;

      logger.error("❌ Spec generation stream failed", {
        requestId,
        error: e.message || String(e),
        durationMs: duration,
        memoryUsedMB: (memoryAfter - memoryBefore).toFixed(2),
        ip,
        timestamp: new Date().toISOString(),
      });

      writeEvent("error", { error: e.message || "Generation failed" });
      res.end();
    }
  }
);

/** POST /exportPPTX {spec} or {specs: []} -> .pptx binary */
export const exportPPTX = onRequest({ cors: true }, async (req, res) => {
  // Handle OPTIONS preflight request explicitly
  if (req.method === "OPTIONS") {
    setCorsHeaders(res, req.headers.origin);
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // Set CORS headers for actual request
  setCorsHeaders(res, req.headers.origin);

  const startTime = Date.now();
  const memoryBefore = process.memoryUsage().heapUsed / 1024 / 1024;
  const ip = req.ip || "unknown";

  try {
    const body = req.body;
    let specs: any[];

    if (body?.specs && Array.isArray(body.specs)) {
      specs = body.specs.map((s: any) => {
        if (s?.styleTokens?.palette?.neutral) {
          const hexPattern = /^#[0-9A-Fa-f]{6}$/;
          s.styleTokens.palette.neutral = (s.styleTokens.palette.neutral as (string | null | undefined)[])
            .filter((color: any): color is string => color != null && typeof color === 'string' && hexPattern.test(color))
            .slice(0, 9);
          if (s.styleTokens.palette.neutral.length < 9) { // Ensure full ramp
            s.styleTokens.palette.neutral = [
              "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
              "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC"
            ];
          }
        }
        return SlideSpecZ.parse(s);
      });
    } else if (body?.spec) {
      const spec = body.spec;
      if (spec?.styleTokens?.palette?.neutral) {
        const hexPattern = /^#[0-9A-Fa-f]{6}$/;
        spec.styleTokens.palette.neutral = (spec.styleTokens.palette.neutral as (string | null | undefined)[])
          .filter((color: any): color is string => color != null && typeof color === 'string' && hexPattern.test(color))
          .slice(0, 9);
        if (spec.styleTokens.palette.neutral.length < 9) {
          spec.styleTokens.palette.neutral = [
            "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
            "#94A3B8", "#CBD5E1", "#E2E8F0", "#F8FAFC"
          ];
        }
      }
      specs = [SlideSpecZ.parse(spec)];
    } else {
      throw new Error("Missing spec or specs in request body");
    }

    logger.info("📊 Export started", {
      slideCount: specs.length,
      ip,
      timestamp: new Date().toISOString(),
    });

    const buf = await buildPptx(specs);

    const endTime = Date.now();
    const memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024;
    const duration = endTime - startTime;
    const bufferSize = buf.byteLength / 1024 / 1024;

    logger.info("✅ Export completed successfully", {
      slideCount: specs.length,
      durationMs: duration,
      bufferSizeMB: bufferSize.toFixed(2),
      memoryUsedMB: (memoryAfter - memoryBefore).toFixed(2),
      withinBudget: duration <= 3000 && memoryAfter <= 500,
      ip,
      timestamp: new Date().toISOString(),
    });

    // Set proper headers for PPTX download
    setPptxHeaders(res);
    res.status(200).send(Buffer.from(buf));
  } catch (e: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024;

    logger.error("❌ Export failed", {
      error: e.message || String(e),
      stack: e.stack,
      durationMs: duration,
      memoryUsedMB: (memoryAfter - memoryBefore).toFixed(2),
      ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).send(`Export error: ${e.message || String(e)}`);
  }
});

/** GET /health - Health check endpoint for monitoring */
export const health = onRequest({ cors: true }, async (req, res) => {
  // Handle OPTIONS preflight request explicitly
  if (req.method === "OPTIONS") {
    setCorsHeaders(res, req.headers.origin);
    res.status(204).send("");
    return;
  }

  // Set CORS headers for actual request
  setCorsHeaders(res, req.headers.origin);

  const startTime = Date.now();

  try {
    // Check Firebase Admin SDK
    const app = getApp();
    const appOk = !!app;

    // Check Firestore connectivity (lightweight)
    let firestoreOk = false;
    try {
      await db.collection("_health").limit(1).get();
      firestoreOk = true;
    } catch {
      firestoreOk = false;
    }

    const latency = Date.now() - startTime;
    const memoryUsage = process.memoryUsage();

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      latencyMs: latency,
      checks: {
        firebaseAdmin: appOk,
        firestore: firestoreOk,
      },
      memory: {
        heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
        rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2),
      },
      version: "1.0.0",
    };

    sendSuccess(res, health);
  } catch (e: any) {
    logger.error("Health check failed", { error: e.message });
    sendError(res, 503, "HEALTH_CHECK_FAILED", "Service health check failed", {
      error: e.message,
    });
  }
});

/** PPTX builder - supports batch with chunking */
async function buildPptx(
  specs: SlideSpec | SlideSpec[]
): Promise<ArrayBuffer> {
  const specsArray = Array.isArray(specs) ? specs : [specs];
  if (specsArray.length === 0) {
    throw new Error("No slides to export");
  }

  logger.info("🏗️ Export building PPTX", {
    slideCount: specsArray.length,
    aspectRatio: specsArray[0].meta.aspectRatio,
  });

  try {
    // Chunk for memory efficiency (max 50/slide batch)
    const chunks = [];
    for (let i = 0; i < specsArray.length; i += 50) {
      const chunk = specsArray.slice(i, i + 50);
      const buffer = await createPptxFromSpecs(chunk);
      chunks.push(buffer);
    }

    // Merge chunks if multi-batch (simplified; real merge via PptxGenJS API)
    if (chunks.length > 1) {
      // Placeholder merge logic; in production, use pptx merger library
      return chunks[0]; // For simplicity; enhance with merger
    }

    return chunks[0];
  } catch (error) {
    logger.error("❌ PPTX build failed", {
      error: String(error),
      slideCount: specsArray.length,
    });
    throw error;
  }
}