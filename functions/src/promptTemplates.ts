/**
 * Industry-Specific Prompt Templates
 * Tailored prompts for different industries, audiences, and use cases
 */

export interface PromptTemplate {
  name: string;
  description: string;
  systemPrompt: string;
  examplePrompts: string[];
  designGuidelines: {
    colorPalette: string[];
    typography: string;
    patterns: string[];
    tone: string;
  };
}

/**
 * Tech/Startup Pitch Deck Template
 */
export const TECH_PITCH_DECK: PromptTemplate = {
  name: "Tech Pitch Deck",
  description: "For startups pitching to investors - problem, solution, market, traction",
  systemPrompt: `
You are creating a tech startup pitch deck. Follow Y Combinator and Sequoia Capital best practices:

STRUCTURE (10-12 slides):
1. Title + Tagline (hero pattern)
2. Problem (minimal pattern with bold statement)
3. Solution (hero pattern with product visual)
4. Market Size (data-focused with TAM/SAM/SOM)
5. Product Demo (split pattern with screenshots)
6. Business Model (grid pattern)
7. Traction (data-focused with growth metrics)
8. Competition (split pattern comparison)
9. Team (grid pattern with photos)
10. Financials (data-focused with projections)
11. Ask (minimal pattern with clear CTA)

DESIGN STYLE:
- Modern, bold, innovative
- Colors: Deep blues (#1E40AF), purples (#7C3AED), cyans (#06B6D4)
- Typography: Modern sans-serif (Inter, Poppins)
- Generous white space (40%+)
- Data visualizations for all metrics
- Minimal text (3-5 bullets max per slide)

TONE:
- Confident but not arrogant
- Data-driven and specific
- Vision-focused
- Action-oriented
`,
  examplePrompts: [
    "Create a pitch deck for an AI-powered customer service platform",
    "Pitch deck for a B2B SaaS productivity tool",
    "Investor presentation for a fintech mobile app"
  ],
  designGuidelines: {
    colorPalette: ["#1E40AF", "#7C3AED", "#06B6D4", "#10B981"],
    typography: "Inter, Poppins - modern sans-serif",
    patterns: ["hero", "minimal", "data-focused", "split"],
    tone: "confident, visionary, data-driven"
  }
};

/**
 * Corporate Quarterly Business Review Template
 */
export const CORPORATE_QBR: PromptTemplate = {
  name: "Quarterly Business Review",
  description: "For executive presentations on quarterly performance and strategy",
  systemPrompt: `
You are creating a corporate quarterly business review for executive leadership.

STRUCTURE (8-10 slides):
1. Executive Summary (minimal pattern)
2. Q4 Highlights (grid pattern with key wins)
3. Financial Performance (data-focused with charts)
4. Key Metrics Dashboard (data-focused)
5. Strategic Initiatives Progress (split pattern)
6. Challenges & Risks (minimal pattern with callouts)
7. Q1 Priorities (grid pattern)
8. Recommendations (minimal pattern)

DESIGN STYLE:
- Professional, conservative, trustworthy
- Colors: Navy (#0F172A), slate (#475569), emerald (#10B981)
- Typography: Professional serif/sans (Georgia, Calibri)
- Balanced white space (30-35%)
- Heavy use of data visualizations
- Clear hierarchy and structure

TONE:
- Formal and professional
- Fact-based and analytical
- Strategic and forward-looking
- Transparent about challenges
`,
  examplePrompts: [
    "Q4 2024 business review for sales organization",
    "Quarterly performance review for product team",
    "Executive summary of Q3 results and Q4 outlook"
  ],
  designGuidelines: {
    colorPalette: ["#0F172A", "#475569", "#10B981", "#F59E0B"],
    typography: "Georgia, Calibri - professional and readable",
    patterns: ["data-focused", "split", "minimal", "grid"],
    tone: "formal, analytical, strategic"
  }
};

/**
 * Sales Presentation Template
 */
export const SALES_PRESENTATION: PromptTemplate = {
  name: "Sales Presentation",
  description: "For sales teams presenting to prospects - value proposition and ROI",
  systemPrompt: `
You are creating a sales presentation following SPIN selling methodology.

STRUCTURE (6-8 slides):
1. Title + Agenda (hero pattern)
2. Customer Pain Points (minimal pattern with bold statements)
3. Our Solution (hero pattern with product benefits)
4. How It Works (split pattern with process)
5. ROI & Value (data-focused with financial impact)
6. Customer Success Stories (grid pattern with logos/quotes)
7. Pricing & Packages (grid pattern)
8. Next Steps (minimal pattern with clear CTA)

DESIGN STYLE:
- Persuasive, benefit-focused, customer-centric
- Colors: Trust blue (#3B82F6), success green (#10B981), accent gold (#F59E0B)
- Typography: Friendly sans-serif (Segoe UI, Arial)
- Balanced white space (32-38%)
- Focus on benefits over features
- Use customer testimonials and social proof

TONE:
- Consultative and helpful
- Benefit-focused (not feature-focused)
- Specific and quantifiable
- Urgency without pressure
`,
  examplePrompts: [
    "Sales deck for enterprise software solution",
    "Product presentation for B2B service offering",
    "Value proposition deck for new customer segment"
  ],
  designGuidelines: {
    colorPalette: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"],
    typography: "Segoe UI, Arial - friendly and approachable",
    patterns: ["hero", "split", "data-focused", "grid"],
    tone: "consultative, benefit-focused, specific"
  }
};

/**
 * Training/Educational Template
 */
export const TRAINING_DECK: PromptTemplate = {
  name: "Training & Education",
  description: "For internal training, workshops, and educational content",
  systemPrompt: `
You are creating an educational training presentation following adult learning principles.

STRUCTURE (12-15 slides):
1. Title + Learning Objectives (hero pattern)
2. Agenda (minimal pattern)
3. Why This Matters (minimal pattern with context)
4. Core Concepts (split pattern for each concept)
5. Step-by-Step Process (grid pattern with numbered steps)
6. Examples & Case Studies (split pattern)
7. Common Mistakes (grid pattern with warnings)
8. Best Practices (grid pattern with tips)
9. Practice Exercise (minimal pattern)
10. Q&A (minimal pattern)
11. Resources & Next Steps (grid pattern)

DESIGN STYLE:
- Clear, educational, accessible
- Colors: Friendly blues (#0EA5E9), greens (#10B981), warm oranges (#F97316)
- Typography: Readable sans-serif (Arial, Verdana)
- Generous white space (38-42%)
- Use icons and visual aids
- Step-by-step breakdowns
- Callouts for key points

TONE:
- Educational and supportive
- Clear and simple language
- Encouraging and positive
- Practical and actionable
`,
  examplePrompts: [
    "Training deck on new software platform",
    "Workshop presentation on leadership skills",
    "Educational content on data privacy compliance"
  ],
  designGuidelines: {
    colorPalette: ["#0EA5E9", "#10B981", "#F97316", "#8B5CF6"],
    typography: "Arial, Verdana - clear and readable",
    patterns: ["split", "grid", "minimal", "asymmetric"],
    tone: "educational, supportive, practical"
  }
};

/**
 * Marketing Campaign Template
 */
export const MARKETING_CAMPAIGN: PromptTemplate = {
  name: "Marketing Campaign",
  description: "For marketing teams presenting campaign strategies and creative concepts",
  systemPrompt: `
You are creating a marketing campaign presentation with creative flair.

STRUCTURE (8-10 slides):
1. Campaign Overview (hero pattern with bold visual)
2. Target Audience (split pattern with personas)
3. Key Message & Positioning (minimal pattern)
4. Creative Concept (hero pattern with mockups)
5. Channel Strategy (grid pattern)
6. Content Calendar (data-focused with timeline)
7. Success Metrics (data-focused with KPIs)
8. Budget & Resources (grid pattern)
9. Timeline & Milestones (data-focused)

DESIGN STYLE:
- Creative, bold, eye-catching
- Colors: Vibrant magenta (#EC4899), amber (#F59E0B), violet (#8B5CF6)
- Typography: Modern and expressive (Poppins, Montserrat)
- Generous white space (40-45%)
- Use mockups and visual examples
- Bold imagery and graphics
- Asymmetric layouts for visual interest

TONE:
- Creative and inspiring
- Brand-focused
- Metrics-driven
- Energetic and enthusiastic
`,
  examplePrompts: [
    "Campaign deck for product launch",
    "Marketing strategy presentation for Q1",
    "Creative brief for brand refresh campaign"
  ],
  designGuidelines: {
    colorPalette: ["#EC4899", "#F59E0B", "#8B5CF6", "#06B6D4"],
    typography: "Poppins, Montserrat - modern and expressive",
    patterns: ["hero", "asymmetric", "split", "grid"],
    tone: "creative, inspiring, energetic"
  }
};

/**
 * Get template by industry and use case
 */
export function getPromptTemplate(
  industry: "tech" | "corporate" | "sales" | "education" | "marketing",
  useCase?: "pitch" | "review" | "training" | "campaign"
): PromptTemplate {
  const templates: Record<string, PromptTemplate> = {
    "tech-pitch": TECH_PITCH_DECK,
    "corporate-review": CORPORATE_QBR,
    "sales-presentation": SALES_PRESENTATION,
    "education-training": TRAINING_DECK,
    "marketing-campaign": MARKETING_CAMPAIGN
  };

  const key = `${industry}-${useCase || "presentation"}`;
  
  // Map to closest template
  if (industry === "tech") return TECH_PITCH_DECK;
  if (industry === "corporate") return CORPORATE_QBR;
  if (industry === "sales") return SALES_PRESENTATION;
  if (industry === "education") return TRAINING_DECK;
  if (industry === "marketing") return MARKETING_CAMPAIGN;
  
  return CORPORATE_QBR; // Default fallback
}

/**
 * Enhance user prompt with template-specific guidance
 */
export function enhancePromptWithTemplate(
  userPrompt: string,
  template: PromptTemplate
): string {
  return `
${template.systemPrompt}

USER REQUEST: ${userPrompt}

Apply the ${template.name} template structure and design guidelines.
Use the recommended color palette: ${template.designGuidelines.colorPalette.join(", ")}
Typography: ${template.designGuidelines.typography}
Tone: ${template.designGuidelines.tone}
`;
}

