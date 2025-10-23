import * as logger from "firebase-functions/logger";
import corsLib from "cors";
import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { getApp } from "firebase-admin/app";
import { initializeApp } from "firebase-admin/app";
import { z } from "zod";
import PptxGenJS from "pptxgenjs";

// For external calls
import { fetch as undiciFetch } from "undici";

// Import AI helpers
import { callAIWithRetry, sanitizePrompt, moderateContent, enhanceSlideSpec } from "./aiHelpers";
import { ENHANCED_SYSTEM_PROMPT } from "./prompts";

// Import PPTX builders
import { buildProfessionalSlide } from "./pptxBuilder";
import { buildMinimalSlide } from "./pptxBuilder/minimalBuilder";

// Define secrets
const AI_API_KEY = defineSecret("AI_API_KEY");
const AI_BASE_URL = defineSecret("AI_BASE_URL");
const AI_MODEL = defineSecret("AI_MODEL");

setGlobalOptions({ region: "us-central1", memory: "512MiB", cpu: 1, timeoutSeconds: 60 });

// Admin init (idempotent)
try { getApp(); } catch { initializeApp(); }

const cors = corsLib({ origin: true }); // simple permissive CORS for MVP

/** SlideSpec schema (lean) */
const SlideSpecZ = z.object({
  meta: z.object({
    version: z.literal("1.0"),
    locale: z.string().default("en-US"),
    theme: z.string(),
    aspectRatio: z.enum(["16:9","4:3"]).default("16:9")
  }),
  content: z.object({
    title: z.object({ id: z.string(), text: z.string().min(1) }),
    subtitle: z.object({ id: z.string(), text: z.string().min(1) }).optional(),
    bullets: z.array(z.object({
      id: z.string(),
      items: z.array(z.object({ text: z.string(), level: z.number().int().min(1).max(3) })).min(1).max(8)
    })).max(3).optional(),
    callouts: z.array(z.object({
      id: z.string(), title: z.string().optional(), text: z.string(), variant: z.enum(["note","success","warning","danger"])
    })).max(2).optional(),
    dataViz: z.object({
      id: z.string(),
      kind: z.enum(["bar","line","pie"]),
      title: z.string().optional(),
      labels: z.array(z.string()).min(2).max(10),
      series: z.array(z.object({ name: z.string(), values: z.array(z.number()) })).min(1).max(3)
    }).optional(),
    imagePlaceholders: z.array(z.object({
      id: z.string(), role: z.enum(["hero","logo","illustration","icon"]), alt: z.string()
    })).max(2).optional()
  }),
  layout: z.object({
    grid: z.object({
      rows: z.number().int().min(3).max(12),
      cols: z.number().int().min(3).max(12),
      gutter: z.number().min(0),
      margin: z.object({ t: z.number(), r: z.number(), b: z.number(), l: z.number() })
    }),
    regions: z.array(z.object({
      name: z.enum(["header","body","footer","aside"]),
      rowStart: z.number().int().positive(), colStart: z.number().int().positive(),
      rowSpan: z.number().int().positive(),  colSpan: z.number().int().positive()
    })).min(1).max(4),
    anchors: z.array(z.object({
      refId: z.string(), region: z.enum(["header","body","footer","aside"]), order: z.number().int().min(0),
      span: z.object({ rows: z.number().int().positive(), cols: z.number().int().positive() }).optional()
    })).min(1).max(8)
  }),
  styleTokens: z.object({
    palette: z.object({ primary: z.string(), accent: z.string(), neutral: z.array(z.string()).min(5).max(9) }),
    typography: z.object({
      fonts: z.object({ sans: z.string(), serif: z.string().optional(), mono: z.string().optional() }),
      sizes: z.object({ "step_-2": z.number(), "step_-1": z.number(), step_0: z.number(), step_1: z.number(), step_2: z.number(), step_3: z.number() }),
      weights: z.object({ regular: z.number(), medium: z.number(), semibold: z.number(), bold: z.number() }),
      lineHeights: z.object({ compact: z.number(), standard: z.number() })
    }),
    spacing: z.object({ base: z.number(), steps: z.array(z.number()).min(5).max(10) }),
    radii: z.object({ sm: z.number(), md: z.number(), lg: z.number() }),
    shadows: z.object({ sm: z.string(), md: z.string(), lg: z.string() }),
    contrast: z.object({ minTextContrast: z.number(), minUiContrast: z.number() })
  }),
  components: z.object({
    bulletList: z.object({ variant: z.enum(["compact","spacious"]).optional() }).optional(),
    callout: z.object({ variant: z.enum(["flat","elevated"]).optional() }).optional(),
    chart: z.object({ legend: z.enum(["none","right","bottom"]).optional(), gridlines: z.boolean().optional() }).optional(),
    image: z.object({ fit: z.enum(["cover","contain"]).optional() }).optional(),
    title: z.object({ align: z.enum(["left","center","right"]).optional() }).optional()
  }).optional()
});
type SlideSpec = z.infer<typeof SlideSpecZ>;

/** System prompt (JSON-only) */
const SYSTEM_PROMPT = `
You are the SlideSpec generator for plzfixthx.
Return a SINGLE RFC8259-compliant JSON object that VALIDATES against SlideSpec v1.
Hard rules:
- Output ONLY JSON.
- meta.version "1.0"; aspectRatio "16:9" default.
- Concise, professional text; <=6 bullets total; levels 1-3.
- If dataViz present, labels 2..10; series lengths == labels length.
- Hex colors (#RRGGBB). IDs [A-Za-z0-9_-].
`;

/** Offline fallback SlideSpec (no AI) */
function fallbackSpec(prompt: string): SlideSpec {
  return {
    meta: { version: "1.0", locale: "en-US", theme: "Clean", aspectRatio: "16:9" },
    content: {
      title: { id: "title", text: prompt?.trim() ? prompt : "AI-Powered Slide in Seconds" },
      subtitle: { id: "subtitle", text: "plzfixthx — preview & export" },
      bullets: [{ id: "b1", items: [
        { text: "Type a prompt; get a polished slide", level: 1 },
        { text: "Live preview in browser", level: 1 },
        { text: "Download a .pptx", level: 1 }
      ]}],
      callouts: [{ id: "c1", text: "Preview ≤ 3s, Export ≤ 10s", variant: "success" }]
    },
    layout: {
      grid: { rows: 8, cols: 12, gutter: 8, margin: { t: 24, r: 24, b: 24, l: 24 } },
      regions: [
        { name: "header", rowStart: 1, colStart: 1, rowSpan: 2, colSpan: 12 },
        { name: "body",   rowStart: 3, colStart: 1, rowSpan: 5, colSpan: 8 },
        { name: "aside",  rowStart: 3, colStart: 9, rowSpan: 5, colSpan: 4 }
      ],
      anchors: [
        { refId: "title", region: "header", order: 0 },
        { refId: "subtitle", region: "header", order: 1 },
        { refId: "b1", region: "body", order: 0 },
        { refId: "c1", region: "aside", order: 0 }
      ]
    },
    styleTokens: {
      palette: { primary: "#2563EB", accent: "#F59E0B", neutral: ["#0F172A","#1E293B","#334155","#64748B","#94A3B8","#CBD5E1","#E2E8F0"] },
      typography: {
        fonts: { sans: "Inter, Arial, sans-serif" },
        sizes: { "step_-2": 12, "step_-1": 14, step_0: 16, step_1: 20, step_2: 24, step_3: 32 },
        weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { compact: 1.2, standard: 1.5 }
      },
      spacing: { base: 4, steps: [0,4,8,12,16,24,32] },
      radii: { sm: 2, md: 6, lg: 12 },
      shadows: { sm: "0 1px 2px rgba(0,0,0,.06)", md: "0 4px 8px rgba(0,0,0,.12)", lg: "0 12px 24px rgba(0,0,0,.18)" },
      contrast: { minTextContrast: 4.5, minUiContrast: 3 }
    }
  };
}


/** AI adapter (OpenAI-compatible HTTP). Returns SlideSpec or throws. */
async function callVendor(prompt: string): Promise<SlideSpec> {
  const key = AI_API_KEY.value() ?? "";
  const base = AI_BASE_URL.value() || "https://api.openai.com/v1";
  const model = AI_MODEL.value() || "gpt-4o-mini"; // any JSON-capable chat model

  if (!key) {
    logger.warn("AI_API_KEY not set — using fallback");
    return fallbackSpec(prompt);
  }

  // Use enhanced AI calling with retry logic
  const result = await callAIWithRetry(prompt, key, base, model, SlideSpecZ);

  // Post-process and enhance the result
  const enhanced = enhanceSlideSpec(result);

  return enhanced as SlideSpec;
}

/** POST /generateSlideSpec {prompt} -> {spec} */
export const generateSlideSpec = onRequest({ cors: false, secrets: [AI_API_KEY, AI_BASE_URL, AI_MODEL] }, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    try {
      // Sanitize and validate prompt
      const rawPrompt = (req.body?.prompt ?? "").toString();
      const prompt = sanitizePrompt(rawPrompt, 800);

      // Content moderation
      const moderation = moderateContent(prompt);
      if (!moderation.safe) {
        return res.status(400).json({
          error: moderation.reason || "Content not allowed",
          spec: fallbackSpec("Content moderation failed")
        });
      }

      // Generate slide spec
      const spec = await callVendor(prompt);
      res.status(200).json({ spec });
    } catch (e: any) {
      logger.error("Error generating slide spec", { error: e.message, stack: e.stack });

      // Return fallback spec on error
      const fallback = fallbackSpec(req.body?.prompt || "");
      res.status(200).json({
        spec: fallback,
        warning: "Using fallback due to error: " + e.message
      });
    }
  });
});

/** POST /exportPPTX {spec} or {specs: []} -> .pptx binary */
export const exportPPTX = onRequest({ cors: false }, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    try {
      // Support both single spec and array of specs
      const body = req.body;
      let specs: any[];

      if (body?.specs && Array.isArray(body.specs)) {
        // Multiple slides
        specs = body.specs.map((s: any) => SlideSpecZ.parse(s));
      } else if (body?.spec) {
        // Single slide (backward compatibility)
        specs = [SlideSpecZ.parse(body.spec)];
      } else {
        throw new Error("Missing spec or specs in request body");
      }

      const buf = await buildPptx(specs);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
      res.setHeader("Content-Disposition", `attachment; filename="plzfixthx-presentation.pptx"`);
      res.status(200).send(Buffer.from(buf));
    } catch (e: any) {
      logger.error(e);
      res.status(400).send(`Export error: ${e.message || String(e)}`);
    }
  });
});

/** PPTX builder - supports single or multiple slides */
async function buildPptx(specs: SlideSpec | SlideSpec[]): Promise<ArrayBuffer> {
  const specsArray = Array.isArray(specs) ? specs : [specs];
  if (specsArray.length === 0) {
    throw new Error("No slides to export");
  }

  const pptx = new PptxGenJS();
  const firstSpec = specsArray[0];
  pptx.layout = firstSpec.meta.aspectRatio === "4:3" ? "LAYOUT_4x3" : "LAYOUT_16x9";

  // Build each slide
  for (const spec of specsArray) {
    await buildSlide(pptx, spec);
  }

  return pptx.write({ outputType: "arraybuffer" }) as Promise<ArrayBuffer>;
}

/** Build a single slide */
async function buildSlide(pptx: PptxGenJS, spec: SlideSpec): Promise<void> {
  try {
    // Use minimal builder for now - clean, simple, no corruption
    await buildMinimalSlide(pptx, spec as any);
    return;
  } catch (e) {
    logger.error("Minimal slide builder failed", { error: String(e) });
    throw e;
  }
}

/** Legacy basic builder - kept for reference */
async function buildSlideBasic(pptx: PptxGenJS, spec: SlideSpec): Promise<void> {
  const slide = pptx.addSlide();

  // Helpers
  const pxToIn = (px: number) => (px * 0.75) / 72;
  const { rows, cols, gutter, margin } = spec.layout.grid;
  const slideW = pptx.presLayout.width;
  const slideH = pptx.presLayout.height;
  const pad = { t: pxToIn(margin.t), r: pxToIn(margin.r), b: pxToIn(margin.b), l: pxToIn(margin.l) };
  const gridW = slideW - pad.l - pad.r;
  const gridH = slideH - pad.t - pad.b;
  const cellW = (gridW - ((cols - 1) * pxToIn(gutter))) / cols;
  const cellH = (gridH - ((rows - 1) * pxToIn(gutter))) / rows;

  const regionRect = (r: any) => ({
    x: pad.l + (r.colStart - 1) * (cellW + pxToIn(gutter)),
    y: pad.t + (r.rowStart - 1) * (cellH + pxToIn(gutter)),
    w: r.colSpan * cellW + (r.colSpan - 1) * pxToIn(gutter),
    h: r.rowSpan * cellH + (r.rowSpan - 1) * pxToIn(gutter)
  });
  const regions: Record<string, any> = {};
  spec.layout.regions.forEach(r => { regions[r.name] = regionRect(r); });

  const fonts = spec.styleTokens.typography.fonts;
  const sizes = spec.styleTokens.typography.sizes;
  const colorText = spec.styleTokens.palette.neutral[0];

  // Title
  const tA = spec.layout.anchors.find(a => a.refId === spec.content.title.id);
  if (tA) {
    const rect = regions[tA.region];
    slide.addText(spec.content.title.text, {
      x: rect.x, y: rect.y, w: rect.w, h: 1,
      fontFace: fonts.sans, fontSize: sizes.step_3 * 0.75, bold: true, color: colorText, align: spec.components?.title?.align || "left"
    });
  }

  // Subtitle
  const sub = spec.content.subtitle;
  if (sub) {
    const a = spec.layout.anchors.find(x => x.refId === sub.id);
    if (a) {
      const rect = regions[a.region];
      slide.addText(sub.text, { x: rect.x, y: rect.y + 0.7, w: rect.w, h: 0.7, fontFace: fonts.sans, fontSize: sizes.step_1 * 0.75, color: colorText });
    }
  }

  // Bullets (first list)
  const bl = spec.content.bullets?.[0];
  if (bl) {
    const a = spec.layout.anchors.find(x => x.refId === bl.id);
    if (a) {
      const rect = regions[a.region];
      slide.addText(
        bl.items.map(it => ({ text: it.text, options: { bullet: true, indentLevel: it.level - 1 } })),
        { x: rect.x, y: rect.y, w: rect.w, h: rect.h, fontFace: fonts.sans, fontSize: sizes.step_0 * 0.75, color: colorText, wrap: true }
      );
    }
  }

  // Callout (first)
  const co = spec.content.callouts?.[0];
  if (co) {
    const a = spec.layout.anchors.find(x => x.refId === co.id);
    if (a) {
      const rect = regions[a.region];
      slide.addShape(pptx.ShapeType.roundRect, {
        x: rect.x, y: rect.y, w: rect.w, h: 1.2,
        fill: { color: "FFFFFF" }, line: { color: spec.styleTokens.palette.accent },
        shadow: { type: "outer", color: "000000", opacity: 0.08, blur: 4, offset: 2 }
      });
      slide.addText(`${co.title ? co.title + " — " : ""}${co.text}`, {
        x: rect.x + 0.1, y: rect.y + 0.15, w: rect.w - 0.2, h: 0.9,
        fontFace: fonts.sans, fontSize: sizes.step_0 * 0.75, color: colorText
      });
    }
  }

  // Chart (naive)
  const dv = spec.content.dataViz;
  if (dv) {
    const a = spec.layout.anchors.find(x => x.refId === dv.id);
    if (a) {
      const rect = regions[a.region];
      const chartData = dv.series.map(s => ({ name: s.name, labels: dv.labels, values: s.values }));
      const type = dv.kind === "pie" ? pptx.ChartType.pie : dv.kind === "line" ? pptx.ChartType.line : pptx.ChartType.bar;
      slide.addChart(type, chartData, { x: rect.x, y: rect.y, w: rect.w, h: rect.h, showLegend: true });
    }
  }
}

