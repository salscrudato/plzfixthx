/**
 * PPTX Builder Module (barrel)
 * Exposes:
 *  - buildSlideFromSpec: full SlideSpec renderer using the grid engine
 *  - buildHeaderOnlySlide: legacy/simple title+subtitle slide (back-compat)
 *  - assertValidSpec(s): schema-backed validation for inbound specs
 *  - createPptxFromSpecs: high-level PPTX generator (lazy-loads pptxgenjs)
 *  - SlideSpec / SlideSpecV1 / SlideSpecZ and core type exports
 *
 * Side-effect free and tree-shakeable: no heavy imports at module load.
 */

export { buildSlideFromSpec, buildHeaderOnlySlide } from "./headerOnlyBuilder";
export type { HeaderOnlySlideSpec } from "./headerOnlyBuilder";

import { SlideSpecZ } from "@plzfixthx/slide-spec";
export { SlideSpecZ } from "@plzfixthx/slide-spec";
export type {
  SlideSpec,
  SlideSpecV1,
  ChartKind,
  AspectRatio,
  RegionName,
} from "@plzfixthx/slide-spec";

/* -------------------------------------------------------------------------- */
/*                             Validation Utilities                            */
/* -------------------------------------------------------------------------- */

/** Validate & parse a single spec (throws on invalid). */
export function assertValidSpec(input: unknown): import("@plzfixthx/slide-spec").SlideSpec {
  return SlideSpecZ.parse(input);
}

/** Validate & parse an array of specs (throws with index on invalid). */
export function assertValidSpecs(input: unknown[]): import("@plzfixthx/slide-spec").SlideSpec[] {
  return input.map((s, i) => {
    try {
      return SlideSpecZ.parse(s);
    } catch (e: any) {
      e.message = `Spec at index ${i}: ${e.message || e}`;
      throw e;
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                             Layout Helper (pure)                            */
/* -------------------------------------------------------------------------- */

/** Map aspect ratio to PptxGenJS layout keyword (string literal keeps this module lightweight). */
export function pptxLayoutByAspectRatio(
  ar: import("@plzfixthx/slide-spec").AspectRatio
): "LAYOUT_16x9" | "LAYOUT_4x3" {
  return ar === "4:3" ? "LAYOUT_4x3" : "LAYOUT_16x9";
}

/* -------------------------------------------------------------------------- */
/*                         High-level PPTX generation API                      */
/* -------------------------------------------------------------------------- */

/**
 * Render one or more SlideSpecV1 slides to a .pptx ArrayBuffer.
 * - Lazy-loads pptxgenjs to keep this barrel side-effect free.
 * - Uses the universal builder for each slide.
 */
export async function createPptxFromSpecs(
  specs: import("@plzfixthx/slide-spec").SlideSpec | import("@plzfixthx/slide-spec").SlideSpec[]
): Promise<ArrayBuffer> {
  const arr = Array.isArray(specs) ? specs : [specs];
  if (arr.length === 0) throw new Error("No slides to export");

  // Lazy import so apps that only need types/builders don’t pay the cost.
  const PptxGen = (await import("pptxgenjs")).default as any;
  const pptx: any = new PptxGen();

  pptx.layout = pptxLayoutByAspectRatio(arr[0].meta.aspectRatio);

  // Defer to the universal builder (already handles all content types).
  for (const spec of arr) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (await import("./headerOnlyBuilder")).buildSlideFromSpec(pptx, spec as any);
  }

  // ArrayBuffer output aligns with Cloud Functions’ send(Buffer.from(ab)).
  return (pptx.write({ outputType: "arraybuffer" }) as unknown) as Promise<ArrayBuffer>;
}