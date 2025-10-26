/**
 * PPTX Builder Module (barrel)
 * Exposes:
 *  - buildSlideFromSpec: full SlideSpec renderer using the grid engine
 *  - buildHeaderOnlySlide: legacy/simple title+subtitle slide (back-compat)
 *  - SlideSpec / SlideSpecV1 types (single import surface)
 *
 * This module is intentionally side-effect free and fully tree-shakeable.
 */

export { buildSlideFromSpec, buildHeaderOnlySlide } from "./headerOnlyBuilder";
export type { SlideSpec, SlideSpecV1 } from "../types/SlideSpecV1";