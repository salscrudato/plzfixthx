/**
 * Advanced Color Palette Generator
 * Generates context-aware, accessible color palettes based on prompt analysis
 * Enhanced with more presets from top consulting firms (McKinsey, BCG, Bain)
 * Improved context detection with weighted keyword matching
 * Automatic contrast adjustment for accessibility
 * Expanded utilities for color manipulation
 */

/* -------------------------------------------------------------------------- */
/*                          Color Utilities                                   */
/* -------------------------------------------------------------------------- */

/** Convert hex to RGB */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "").slice(0, 6);
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return { r, g, b };
}

/** Convert RGB to hex */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

/** Calculate relative luminance (WCAG) */
function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const norm = (c: number) => c / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(norm(r)) + 0.7152 * lin(norm(g)) + 0.0722 * lin(norm(b));
}

/** Calculate contrast ratio (WCAG) */
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Lighten or darken color by percentage */
function adjustColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = percent / 100;
  const adjust = (c: number) => Math.min(255, Math.max(0, c + c * factor));
  return rgbToHex(adjust(r), adjust(g), adjust(b));
}

/** Generate neutral ramp (9 colors from dark to light) with consulting-style grays */
function generateNeutralRamp(baseDark = "#0F172A", baseLight = "#F8FAFC"): string[] {
  const ramp: string[] = [];
  const darkRgb = hexToRgb(baseDark);
  const lightRgb = hexToRgb(baseLight);

  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const r = Math.round(darkRgb.r + (lightRgb.r - darkRgb.r) * t);
    const g = Math.round(darkRgb.g + (lightRgb.g - darkRgb.g) * t);
    const b = Math.round(darkRgb.b + (lightRgb.b - darkRgb.b) * t);
    ramp.push(rgbToHex(r, g, b));
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
  fallbackAccent?: string[]; // Alternatives if contrast fails
}

const PALETTE_PRESETS: Record<string, PaletteOption> = {
  // Original presets
  tech: { primary: "#1E40AF", accent: "#F59E0B", name: "Tech Blue", fallbackAccent: ["#EA580C", "#D97706"] },
  finance: { primary: "#0F172A", accent: "#10B981", name: "Finance Navy", fallbackAccent: ["#059669", "#84CC16"] },
  creative: { primary: "#7C3AED", accent: "#EC4899", name: "Creative Purple", fallbackAccent: ["#DB2777", "#F472B6"] },
  energy: { primary: "#EA580C", accent: "#F97316", name: "Energy Orange", fallbackAccent: ["#DC2626", "#EF4444"] },
  healthcare: { primary: "#0891B2", accent: "#06B6D4", name: "Healthcare Cyan", fallbackAccent: ["#0E7490", "#22D3EE"] },
  sustainability: { primary: "#15803D", accent: "#84CC16", name: "Sustainability Green", fallbackAccent: ["#65A30D", "#A3E635"] },
  corporate: { primary: "#1F2937", accent: "#6366F1", name: "Corporate Gray", fallbackAccent: ["#4F46E5", "#818CF8"] },
  luxury: { primary: "#1E1B4B", accent: "#D4AF37", name: "Luxury Gold", fallbackAccent: ["#CA8A04", "#EAB308"] },
  
  // New consulting-firm inspired presets
  mckinsey: { primary: "#005EB8", accent: "#F3C13A", name: "McKinsey Blue", fallbackAccent: ["#FFCC00", "#FFD700"] },
  bcg: { primary: "#002E5D", accent: "#E31E24", name: "BCG Navy", fallbackAccent: ["#D32F2F", "#EF5350"] },
  bain: { primary: "#0033A0", accent: "#FFC220", name: "Bain Blue", fallbackAccent: ["#FFA000", "#FFECB3"] },
  strategy: { primary: "#00457C", accent: "#00A3E0", name: "Strategy Teal", fallbackAccent: ["#0097A7", "#4DD0E1"] },
  data: { primary: "#2E3192", accent: "#29ABE2", name: "Data Indigo", fallbackAccent: ["#00BFFF", "#87CEEB"] },
};

/** Weighted keyword matching for better context detection */
interface KeywordWeight {
  keyword: RegExp;
  weight: number;
}

const CONTEXT_KEYWORDS: Record<string, KeywordWeight[]> = {
  tech: [
    { keyword: /\b(tech|technology|software|ai|artificial intelligence|machine learning|data|digital|cloud|api|platform|app|devops|cyber|blockchain)\b/i, weight: 3 },
    { keyword: /\b(innovation|startup|tech stack|programming|code|algorithm)\b/i, weight: 2 },
  ],
  finance: [
    { keyword: /\b(finance|financial|revenue|profit|investment|market|trading|banking|fintech|stocks|crypto|portfolio|audit|compliance|risk)\b/i, weight: 3 },
    { keyword: /\b(economy|budget|forecast|valuation|merger|acquisition|ipo)\b/i, weight: 2 },
  ],
  creative: [
    { keyword: /\b(creative|design|brand|marketing|campaign|content|media|advertising|ux|ui|graphic|art|photography|video)\b/i, weight: 3 },
    { keyword: /\b(innovation|storytelling|visual|concept|idea|brainstorm)\b/i, weight: 2 },
  ],
  energy: [
    { keyword: /\b(energy|power|oil|gas|renewable|solar|wind|battery|electric|ev|growth|momentum|accelerate|drive|transform)\b/i, weight: 3 },
    { keyword: /\b(sustainable energy|grid|utility|fossil fuel|carbon capture)\b/i, weight: 2 },
  ],
  healthcare: [
    { keyword: /\b(health|healthcare|medical|patient|care|wellness|pharma|biotech|hospital|doctor|medicine|telehealth)\b/i, weight: 3 },
    { keyword: /\b(clinical|trial|drug|therapy|diagnostics|epidemic|pandemic)\b/i, weight: 2 },
  ],
  sustainability: [
    { keyword: /\b(sustain|sustainability|green|eco|environment|carbon|renewable|climate|esg|recycle|circular economy)\b/i, weight: 3 },
    { keyword: /\b(net zero|emissions|conservation|biodiversity|green tech)\b/i, weight: 2 },
  ],
  corporate: [
    { keyword: /\b(corporate|business|enterprise|management|strategy|operations|hr|leadership|team|organization)\b/i, weight: 3 },
    { keyword: /\b(policy|governance|compliance|risk management|board|executive)\b/i, weight: 2 },
  ],
  luxury: [
    { keyword: /\b(luxury|premium|high-end|exclusive|brand|fashion|jewelry|watches|cars|travel|hospitality)\b/i, weight: 3 },
    { keyword: /\b(elegant|sophisticated|elite|bespoke|couture)\b/i, weight: 2 },
  ],
  mckinsey: [
    { keyword: /\b(mckinsey|consulting|strategy consulting|management consulting)\b/i, weight: 4 },
  ],
  bcg: [
    { keyword: /\b(bcg|boston consulting group)\b/i, weight: 4 },
  ],
  bain: [
    { keyword: /\b(bain)\b/i, weight: 4 },
  ],
  strategy: [
    { keyword: /\b(strategy|strategic|planning|roadmap|vision|mission|goals|objectives)\b/i, weight: 3 },
  ],
  data: [
    { keyword: /\b(data|analytics|bi|business intelligence|big data|insights|metrics|kpi|dashboard|visualization)\b/i, weight: 3 },
  ],
};

/** Detect context from prompt using weighted scoring */
export function selectPaletteByContext(prompt: string): PaletteOption {
  const lower = prompt.toLowerCase();
  const scores: Record<string, number> = {};
  
  Object.keys(CONTEXT_KEYWORDS).forEach((context) => {
    scores[context] = CONTEXT_KEYWORDS[context].reduce((sum, { keyword, weight }) => 
      keyword.test(lower) ? sum + weight : sum, 0);
  });

  // Find the context with the highest score
  let maxScore = 0;
  let selectedContext = "corporate"; // Default
  Object.entries(scores).forEach(([context, score]) => {
    if (score > maxScore) {
      maxScore = score;
      selectedContext = context;
    }
  });

  return PALETTE_PRESETS[selectedContext];
}

/**
 * Ensure accent meets minimum contrast with primary and background
 * If not, select from fallbacks or adjust lightness
 */
function ensureAccessibleAccent(primary: string, accent: string, fallbackAccents: string[] = [], bg: string = "#FFFFFF"): string {
  let currentAccent = accent;
  let ratioPrim = getContrastRatio(primary, currentAccent);
  let ratioBg = getContrastRatio(currentAccent, bg);

  if (ratioPrim >= 4.5 && ratioBg >= 7) return currentAccent;

  // Try fallbacks
  for (const fallback of fallbackAccents) {
    ratioPrim = getContrastRatio(primary, fallback);
    ratioBg = getContrastRatio(fallback, bg);
    if (ratioPrim >= 4.5 && ratioBg >= 7) return fallback;
  }

  // Adjust lightness if still not compliant
  let adjustPercent = 10;
  while (adjustPercent <= 50) {
    currentAccent = adjustColor(accent, -adjustPercent); // Darken
    ratioPrim = getContrastRatio(primary, currentAccent);
    ratioBg = getContrastRatio(currentAccent, bg);
    if (ratioPrim >= 4.5 && ratioBg >= 7) return currentAccent;

    currentAccent = adjustColor(accent, adjustPercent); // Lighten
    ratioPrim = getContrastRatio(primary, currentAccent);
    ratioBg = getContrastRatio(currentAccent, bg);
    if (ratioPrim >= 4.5 && ratioBg >= 7) return currentAccent;

    adjustPercent += 10;
  }

  // Fallback to safe accent
  return "#F59E0B";
}

/* -------------------------------------------------------------------------- */
/*                      Palette Generation & Validation                       */
/* -------------------------------------------------------------------------- */

export interface GeneratedPalette {
  primary: string;
  accent: string;
  neutral: string[];
  contrastRatioPrimBg: number;
  contrastRatioAccentBg: number;
  accessible: boolean;
}

/**
 * Generate a complete, accessible color palette
 * - Selects primary/accent based on context
 * - Ensures minimum contrasts (4.5:1 primary/accent, 7:1 text/bg)
 * - Generates neutral ramp
 * - Adjusts accent if necessary for accessibility
 */
export function generatePalette(prompt: string): GeneratedPalette {
  const preset = selectPaletteByContext(prompt);
  const neutral = generateNeutralRamp();
  const bg = neutral[8]; // Lightest neutral as bg
  const text = neutral[0]; // Darkest as text

  // Ensure text/bg contrast
  const textBgRatio = getContrastRatio(text, bg);
  if (textBgRatio < 7) {
    neutral[0] = adjustColor(neutral[0], -20); // Darken text if needed
  }

  let accent = ensureAccessibleAccent(preset.primary, preset.accent, preset.fallbackAccent || [], bg);

  const contrastRatioPrimBg = getContrastRatio(preset.primary, bg);
  const contrastRatioAccentBg = getContrastRatio(accent, bg);

  return {
    primary: preset.primary,
    accent,
    neutral,
    contrastRatioPrimBg,
    contrastRatioAccentBg,
    accessible: contrastRatioPrimBg >= 7 && contrastRatioAccentBg >= 4.5,
  };
}

export default {
  generatePalette,
  selectPaletteByContext,
  getContrastRatio,
  adjustColor,
};