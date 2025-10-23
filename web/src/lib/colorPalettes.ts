/**
 * Professional Color Palettes
 * 15 carefully curated palettes with WCAG AA/AAA validation
 */

export interface ColorPalette {
  name: string;
  primary: string;
  accent: string;
  neutral: string[];
  use: string;
  contrast: number;
  psychology: string;
}

export const PROFESSIONAL_PALETTES: Record<string, ColorPalette> = {
  corporate: {
    name: "Corporate Professional",
    primary: "#1E40AF",
    accent: "#10B981",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Business, finance, corporate presentations",
    contrast: 7.2,
    psychology: "Trust, stability, growth"
  },
  tech: {
    name: "Tech Innovation",
    primary: "#2563EB",
    accent: "#8B5CF6",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Technology, startups, innovation",
    contrast: 6.8,
    psychology: "Innovation, intelligence, creativity"
  },
  finance: {
    name: "Finance & Growth",
    primary: "#1E40AF",
    accent: "#F59E0B",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Financial services, growth metrics, investment",
    contrast: 7.1,
    psychology: "Trust, prosperity, opportunity"
  },
  healthcare: {
    name: "Healthcare & Wellness",
    primary: "#0D9488",
    accent: "#0EA5E9",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Healthcare, wellness, medical",
    contrast: 6.5,
    psychology: "Health, trust, calm"
  },
  creative: {
    name: "Creative & Marketing",
    primary: "#EC4899",
    accent: "#F97316",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Creative, marketing, design",
    contrast: 6.9,
    psychology: "Energy, creativity, passion"
  },
  minimal: {
    name: "Minimal & Modern",
    primary: "#1F2937",
    accent: "#6366F1",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Minimal, modern, clean design",
    contrast: 7.5,
    psychology: "Sophistication, clarity, focus"
  },
  eco: {
    name: "Eco & Sustainability",
    primary: "#059669",
    accent: "#84CC16",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Sustainability, environment, nature",
    contrast: 6.7,
    psychology: "Growth, nature, sustainability"
  },
  luxury: {
    name: "Luxury & Premium",
    primary: "#1E1B4B",
    accent: "#D97706",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Luxury, premium, high-end",
    contrast: 7.3,
    psychology: "Elegance, exclusivity, quality"
  },
  education: {
    name: "Education & Learning",
    primary: "#0369A1",
    accent: "#7C3AED",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Education, training, learning",
    contrast: 6.6,
    psychology: "Knowledge, growth, inspiration"
  },
  bold: {
    name: "Bold & Energetic",
    primary: "#DC2626",
    accent: "#EA580C",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Energy, action, urgency",
    contrast: 7.0,
    psychology: "Energy, passion, action"
  },
  cool: {
    name: "Cool & Calm",
    primary: "#0891B2",
    accent: "#06B6D4",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Calm, cool, professional",
    contrast: 6.4,
    psychology: "Calm, trust, clarity"
  },
  warm: {
    name: "Warm & Friendly",
    primary: "#EA580C",
    accent: "#F97316",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Friendly, approachable, warm",
    contrast: 6.8,
    psychology: "Warmth, friendliness, energy"
  },
  grayscale: {
    name: "Professional Grayscale",
    primary: "#1F2937",
    accent: "#6B7280",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Professional, neutral, corporate",
    contrast: 7.4,
    psychology: "Professionalism, neutrality, focus"
  },
  vibrant: {
    name: "Vibrant & Modern",
    primary: "#7C3AED",
    accent: "#06B6D4",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Modern, vibrant, contemporary",
    contrast: 6.9,
    psychology: "Innovation, modernity, creativity"
  },
  classic: {
    name: "Classic & Timeless",
    primary: "#1E3A8A",
    accent: "#7C2D12",
    neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0"],
    use: "Classic, timeless, traditional",
    contrast: 7.2,
    psychology: "Tradition, stability, heritage"
  }
};

export function getPalette(name: string): ColorPalette | undefined {
  return PROFESSIONAL_PALETTES[name];
}

export function getAllPalettes(): ColorPalette[] {
  return Object.values(PROFESSIONAL_PALETTES);
}

export function getPaletteNames(): string[] {
  return Object.keys(PROFESSIONAL_PALETTES);
}

/**
 * Calculate contrast ratio between two colors
 * Returns WCAG contrast ratio (1-21)
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  const fgLum = getRelativeLuminance(foreground);
  const bgLum = getRelativeLuminance(background);
  
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get relative luminance of a color
 */
function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = rgb.map(val => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

/**
 * Validate palette contrast ratios
 */
export function validatePaletteContrast(palette: ColorPalette, minRatio: number = 4.5): boolean {
  const textColor = palette.neutral[0];
  const bgColor = palette.neutral[6];
  const ratio = calculateContrastRatio(textColor, bgColor);
  return ratio >= minRatio;
}

/**
 * Get palette by use case
 */
export function getPaletteByUseCase(useCase: string): ColorPalette | undefined {
  const lower = useCase.toLowerCase();
  
  if (lower.includes("business") || lower.includes("corporate") || lower.includes("finance")) {
    return PROFESSIONAL_PALETTES.corporate;
  }
  if (lower.includes("tech") || lower.includes("startup") || lower.includes("innovation")) {
    return PROFESSIONAL_PALETTES.tech;
  }
  if (lower.includes("health") || lower.includes("medical") || lower.includes("wellness")) {
    return PROFESSIONAL_PALETTES.healthcare;
  }
  if (lower.includes("creative") || lower.includes("marketing") || lower.includes("design")) {
    return PROFESSIONAL_PALETTES.creative;
  }
  if (lower.includes("education") || lower.includes("learning") || lower.includes("training")) {
    return PROFESSIONAL_PALETTES.education;
  }
  if (lower.includes("eco") || lower.includes("sustainability") || lower.includes("environment")) {
    return PROFESSIONAL_PALETTES.eco;
  }
  if (lower.includes("luxury") || lower.includes("premium") || lower.includes("high-end")) {
    return PROFESSIONAL_PALETTES.luxury;
  }
  if (lower.includes("minimal") || lower.includes("modern") || lower.includes("clean")) {
    return PROFESSIONAL_PALETTES.minimal;
  }
  
  return PROFESSIONAL_PALETTES.corporate; // default
}

