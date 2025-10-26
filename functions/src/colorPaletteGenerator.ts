/**
 * Advanced Color Palette Generator
 * Generates context-aware, accessible color palettes based on prompt analysis
 */

/* -------------------------------------------------------------------------- */
/*                          Color Utilities                                   */
/* -------------------------------------------------------------------------- */

/** Convert hex to RGB */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").slice(0, 6);
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

/** Convert RGB to hex */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

/** Calculate relative luminance (WCAG) */
function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((x) => x / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Calculate contrast ratio (WCAG) */
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Generate neutral ramp (9 colors from dark to light) */
function generateNeutralRamp(): string[] {
  const ramp: string[] = [];

  // Generate 9 steps from dark (#0F172A) to light (#F8FAFC)
  const darkBase = [15, 23, 42];
  const lightBase = [248, 250, 252];

  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const nr = Math.round(darkBase[0] + (lightBase[0] - darkBase[0]) * t);
    const ng = Math.round(darkBase[1] + (lightBase[1] - darkBase[1]) * t);
    const nb = Math.round(darkBase[2] + (lightBase[2] - darkBase[2]) * t);
    ramp.push(rgbToHex(nr, ng, nb));
  }

  return ramp;
}

/* -------------------------------------------------------------------------- */
/*                      Context-Aware Palette Selection                       */
/* -------------------------------------------------------------------------- */

interface PaletteOption {
  primary: string;
  accent: string;
  name: string;
}

const PALETTE_PRESETS: Record<string, PaletteOption> = {
  tech: { primary: "#1E40AF", accent: "#F59E0B", name: "Tech Blue" },
  finance: { primary: "#0F172A", accent: "#10B981", name: "Finance Navy" },
  creative: { primary: "#7C3AED", accent: "#EC4899", name: "Creative Purple" },
  energy: { primary: "#EA580C", accent: "#F97316", name: "Energy Orange" },
  healthcare: { primary: "#0891B2", accent: "#06B6D4", name: "Healthcare Cyan" },
  sustainability: { primary: "#15803D", accent: "#84CC16", name: "Sustainability Green" },
  corporate: { primary: "#1F2937", accent: "#6366F1", name: "Corporate Gray" },
  luxury: { primary: "#1E1B4B", accent: "#D4AF37", name: "Luxury Gold" },
};

/** Detect context from prompt and select appropriate palette */
export function selectPaletteByContext(prompt: string): PaletteOption {
  const lower = prompt.toLowerCase();
  
  // Tech keywords
  if (/\b(tech|software|ai|data|digital|cloud|api|platform)\b/i.test(lower)) {
    return PALETTE_PRESETS.tech;
  }
  
  // Finance keywords
  if (/\b(finance|revenue|profit|investment|market|trading|banking)\b/i.test(lower)) {
    return PALETTE_PRESETS.finance;
  }
  
  // Creative keywords
  if (/\b(creative|design|brand|marketing|campaign|content|media)\b/i.test(lower)) {
    return PALETTE_PRESETS.creative;
  }
  
  // Energy keywords
  if (/\b(energy|power|growth|momentum|accelerate|drive|transform)\b/i.test(lower)) {
    return PALETTE_PRESETS.energy;
  }
  
  // Healthcare keywords
  if (/\b(health|medical|patient|care|wellness|pharma|biotech)\b/i.test(lower)) {
    return PALETTE_PRESETS.healthcare;
  }
  
  // Sustainability keywords
  if (/\b(sustain|green|eco|environment|carbon|renewable|climate)\b/i.test(lower)) {
    return PALETTE_PRESETS.sustainability;
  }
  
  // Default to corporate
  return PALETTE_PRESETS.corporate;
}

/* -------------------------------------------------------------------------- */
/*                      Palette Generation & Validation                       */
/* -------------------------------------------------------------------------- */

export interface GeneratedPalette {
  primary: string;
  accent: string;
  neutral: string[];
  contrastRatio: number;
  accessible: boolean;
}

/**
 * Generate a complete, accessible color palette
 * - Selects primary/accent based on context
 * - Validates 7:1 contrast ratio
 * - Generates neutral ramp
 */
export function generatePalette(prompt: string): GeneratedPalette {
  const preset = selectPaletteByContext(prompt);
  const neutral = generateNeutralRamp();
  const contrastRatio = getContrastRatio(preset.primary, neutral[8]); // primary vs. white

  return {
    primary: preset.primary,
    accent: preset.accent,
    neutral,
    contrastRatio,
    accessible: contrastRatio >= 7,
  };
}

export default {
  generatePalette,
  selectPaletteByContext,
  getContrastRatio,
};

