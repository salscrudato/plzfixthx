import type { SlideSpecV1 } from "./SlideSpecV1";

export interface Slide {
  id: string;
  spec: SlideSpecV1;
  createdAt: number;
  updatedAt: number;
  prompt?: string; // Original prompt used to generate this slide
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  createdAt: number;
  updatedAt: number;
  aspectRatio: "16:9" | "4:3";
}

export function createSlide(spec: SlideSpecV1, prompt?: string): Slide {
  const now = Date.now();
  return {
    id: `slide_${now}_${Math.random().toString(36).substr(2, 9)}`,
    spec,
    createdAt: now,
    updatedAt: now,
    prompt,
  };
}

export function createPresentation(title: string = "Untitled Presentation", aspectRatio: "16:9" | "4:3" = "16:9"): Presentation {
  const now = Date.now();
  return {
    id: `pres_${now}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    slides: [],
    createdAt: now,
    updatedAt: now,
    aspectRatio,
  };
}

