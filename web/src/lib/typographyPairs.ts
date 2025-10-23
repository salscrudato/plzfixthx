/**
 * Professional Typography Pairings
 * 12 carefully curated font pairings with specifications
 */

export interface TypographyPair {
  name: string;
  strategy: string;
  primary: string; // heading font
  secondary: string; // body font
  sizes: {
    title: number;
    subtitle: number;
    body: number;
    caption: number;
  };
  weights: {
    title: number;
    subtitle: number;
    body: number;
    caption: number;
  };
  lineHeights: {
    title: number;
    subtitle: number;
    body: number;
    caption: number;
  };
  use: string;
}

export const TYPOGRAPHY_PAIRS: Record<string, TypographyPair> = {
  classic: {
    name: "Classic Elegance",
    strategy: "classic",
    primary: "Georgia, serif",
    secondary: "Inter, sans-serif",
    sizes: { title: 40, subtitle: 28, body: 16, caption: 14 },
    weights: { title: 700, subtitle: 600, body: 400, caption: 400 },
    lineHeights: { title: 1.2, subtitle: 1.4, body: 1.6, caption: 1.5 },
    use: "Traditional, elegant, professional"
  },
  modern: {
    name: "Modern Minimalist",
    strategy: "modern",
    primary: "Poppins, sans-serif",
    secondary: "Inter, sans-serif",
    sizes: { title: 36, subtitle: 24, body: 16, caption: 14 },
    weights: { title: 600, subtitle: 500, body: 400, caption: 400 },
    lineHeights: { title: 1.4, subtitle: 1.5, body: 1.5, caption: 1.4 },
    use: "Modern, clean, contemporary"
  },
  bold: {
    name: "Bold & Impactful",
    strategy: "bold",
    primary: "Playfair Display, serif",
    secondary: "Montserrat, sans-serif",
    sizes: { title: 44, subtitle: 32, body: 16, caption: 14 },
    weights: { title: 700, subtitle: 600, body: 400, caption: 400 },
    lineHeights: { title: 1.3, subtitle: 1.4, body: 1.5, caption: 1.4 },
    use: "Bold, impactful, creative"
  },
  minimal: {
    name: "Minimal & Refined",
    strategy: "minimal",
    primary: "Inter, sans-serif",
    secondary: "Inter, sans-serif",
    sizes: { title: 40, subtitle: 28, body: 16, caption: 14 },
    weights: { title: 700, subtitle: 600, body: 400, caption: 400 },
    lineHeights: { title: 1.4, subtitle: 1.5, body: 1.5, caption: 1.4 },
    use: "Minimal, refined, focused"
  },
  elegant: {
    name: "Elegant & Sophisticated",
    strategy: "elegant",
    primary: "Cormorant, serif",
    secondary: "Lato, sans-serif",
    sizes: { title: 48, subtitle: 32, body: 16, caption: 14 },
    weights: { title: 600, subtitle: 500, body: 400, caption: 400 },
    lineHeights: { title: 1.5, subtitle: 1.6, body: 1.6, caption: 1.5 },
    use: "Elegant, sophisticated, luxury"
  },
  tech: {
    name: "Tech & Modern",
    strategy: "tech",
    primary: "Sora, sans-serif",
    secondary: "Sora, sans-serif",
    sizes: { title: 40, subtitle: 28, body: 16, caption: 14 },
    weights: { title: 700, subtitle: 600, body: 400, caption: 400 },
    lineHeights: { title: 1.4, subtitle: 1.5, body: 1.5, caption: 1.4 },
    use: "Technology, modern, innovative"
  },
  friendly: {
    name: "Friendly & Approachable",
    strategy: "friendly",
    primary: "Quicksand, sans-serif",
    secondary: "Open Sans, sans-serif",
    sizes: { title: 36, subtitle: 24, body: 16, caption: 14 },
    weights: { title: 600, subtitle: 500, body: 400, caption: 400 },
    lineHeights: { title: 1.5, subtitle: 1.6, body: 1.6, caption: 1.5 },
    use: "Friendly, approachable, warm"
  },
  corporate: {
    name: "Professional & Corporate",
    strategy: "corporate",
    primary: "Roboto, sans-serif",
    secondary: "Roboto, sans-serif",
    sizes: { title: 40, subtitle: 28, body: 16, caption: 14 },
    weights: { title: 700, subtitle: 600, body: 400, caption: 400 },
    lineHeights: { title: 1.4, subtitle: 1.5, body: 1.5, caption: 1.4 },
    use: "Professional, corporate, business"
  },
  creative: {
    name: "Creative & Artistic",
    strategy: "creative",
    primary: "Abril Fatface, serif",
    secondary: "Raleway, sans-serif",
    sizes: { title: 48, subtitle: 32, body: 16, caption: 14 },
    weights: { title: 400, subtitle: 400, body: 400, caption: 400 },
    lineHeights: { title: 1.5, subtitle: 1.6, body: 1.6, caption: 1.5 },
    use: "Creative, artistic, design-focused"
  },
  educational: {
    name: "Educational & Clear",
    strategy: "educational",
    primary: "Nunito, sans-serif",
    secondary: "Nunito, sans-serif",
    sizes: { title: 40, subtitle: 28, body: 16, caption: 14 },
    weights: { title: 700, subtitle: 600, body: 400, caption: 400 },
    lineHeights: { title: 1.5, subtitle: 1.6, body: 1.6, caption: 1.5 },
    use: "Educational, clear, accessible"
  },
  premium: {
    name: "Luxury & Premium",
    strategy: "premium",
    primary: "Bodoni Moda, serif",
    secondary: "Lora, serif",
    sizes: { title: 48, subtitle: 32, body: 16, caption: 14 },
    weights: { title: 700, subtitle: 600, body: 400, caption: 400 },
    lineHeights: { title: 1.6, subtitle: 1.7, body: 1.7, caption: 1.6 },
    use: "Luxury, premium, high-end"
  },
  energetic: {
    name: "Bold & Energetic",
    strategy: "energetic",
    primary: "Bebas Neue, sans-serif",
    secondary: "Lato, sans-serif",
    sizes: { title: 44, subtitle: 32, body: 16, caption: 14 },
    weights: { title: 700, subtitle: 600, body: 400, caption: 400 },
    lineHeights: { title: 1.3, subtitle: 1.5, body: 1.5, caption: 1.4 },
    use: "Bold, energetic, dynamic"
  }
};

export function getTypographyPair(strategy: string): TypographyPair | undefined {
  return TYPOGRAPHY_PAIRS[strategy];
}

export function getAllTypographyPairs(): TypographyPair[] {
  return Object.values(TYPOGRAPHY_PAIRS);
}

export function getTypographyPairNames(): string[] {
  return Object.keys(TYPOGRAPHY_PAIRS);
}

/**
 * Get typography pair by use case
 */
export function getTypographyByUseCase(useCase: string): TypographyPair | undefined {
  const lower = useCase.toLowerCase();
  
  if (lower.includes("business") || lower.includes("corporate")) {
    return TYPOGRAPHY_PAIRS.corporate;
  }
  if (lower.includes("tech") || lower.includes("modern")) {
    return TYPOGRAPHY_PAIRS.tech;
  }
  if (lower.includes("creative") || lower.includes("artistic")) {
    return TYPOGRAPHY_PAIRS.creative;
  }
  if (lower.includes("education") || lower.includes("learning")) {
    return TYPOGRAPHY_PAIRS.educational;
  }
  if (lower.includes("luxury") || lower.includes("premium")) {
    return TYPOGRAPHY_PAIRS.premium;
  }
  if (lower.includes("minimal") || lower.includes("clean")) {
    return TYPOGRAPHY_PAIRS.minimal;
  }
  if (lower.includes("elegant") || lower.includes("sophisticated")) {
    return TYPOGRAPHY_PAIRS.elegant;
  }
  if (lower.includes("friendly") || lower.includes("approachable")) {
    return TYPOGRAPHY_PAIRS.friendly;
  }
  if (lower.includes("bold") || lower.includes("energetic")) {
    return TYPOGRAPHY_PAIRS.energetic;
  }
  
  return TYPOGRAPHY_PAIRS.modern; // default
}

/**
 * Validate typography pair
 */
export function validateTypographyPair(pair: TypographyPair): boolean {
  return !!(
    pair.primary &&
    pair.secondary &&
    pair.sizes.title > pair.sizes.subtitle &&
    pair.sizes.subtitle > pair.sizes.body &&
    pair.sizes.body > pair.sizes.caption &&
    pair.lineHeights.title > 0 &&
    pair.lineHeights.body >= 1.5
  );
}

