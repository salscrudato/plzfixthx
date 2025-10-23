/**
 * Presentation-Level AI Intelligence
 * Multi-slide generation, narrative flow, slide relationships
 */

import { logger } from "firebase-functions/v2";
import type { SlideSpecV1 } from "./types/SlideSpecV1";

export interface PresentationRequest {
  topic: string;
  audience?: "executives" | "technical" | "sales" | "general" | "investors";
  tone?: "formal" | "casual" | "persuasive" | "educational" | "inspirational";
  slideCount?: number; // Desired number of slides (default: auto-determine)
  industry?: "tech" | "finance" | "healthcare" | "marketing" | "corporate";
  includeAgenda?: boolean;
  includeSummary?: boolean;
}

export interface PresentationStructure {
  title: string;
  slides: Array<{
    type: "title" | "agenda" | "content" | "data" | "quote" | "summary" | "cta";
    title: string;
    purpose: string;
    keyPoints: string[];
    suggestedPattern: "hero" | "split" | "asymmetric" | "grid" | "minimal" | "data-focused";
  }>;
  narrativeFlow: string;
  transitionStrategy: string;
}

/**
 * Analyze presentation request and generate structure
 */
export function analyzePresentationRequest(request: PresentationRequest): PresentationStructure {
  const { topic, audience = "general", tone = "formal", slideCount, industry = "corporate" } = request;
  
  // Determine optimal slide count if not specified
  const optimalSlideCount = slideCount || determineOptimalSlideCount(topic, audience);
  
  // Generate presentation structure
  const structure: PresentationStructure = {
    title: topic,
    slides: [],
    narrativeFlow: generateNarrativeFlow(topic, audience, tone),
    transitionStrategy: determineTransitionStrategy(tone, industry)
  };
  
  // Add title slide
  structure.slides.push({
    type: "title",
    title: topic,
    purpose: "Introduce the presentation topic and set the tone",
    keyPoints: [topic, `Presented to ${audience} audience`],
    suggestedPattern: "hero"
  });
  
  // Add agenda slide if requested
  if (request.includeAgenda) {
    structure.slides.push({
      type: "agenda",
      title: "Agenda",
      purpose: "Outline the presentation structure",
      keyPoints: ["Overview", "Key Topics", "Conclusion"],
      suggestedPattern: "minimal"
    });
  }
  
  // Generate content slides based on topic analysis
  const contentSlides = generateContentSlides(topic, optimalSlideCount - 2, audience, industry);
  structure.slides.push(...contentSlides);
  
  // Add summary slide if requested
  if (request.includeSummary) {
    structure.slides.push({
      type: "summary",
      title: "Key Takeaways",
      purpose: "Summarize main points and reinforce message",
      keyPoints: ["Summary point 1", "Summary point 2", "Summary point 3"],
      suggestedPattern: "minimal"
    });
  }
  
  return structure;
}

/**
 * Determine optimal slide count based on topic complexity
 */
function determineOptimalSlideCount(topic: string, audience: string): number {
  const topicLength = topic.split(" ").length;
  
  // Base count on topic complexity
  let baseCount = 5; // Default
  
  if (topicLength > 10) baseCount = 8; // Complex topic
  if (topicLength > 15) baseCount = 12; // Very complex topic
  
  // Adjust for audience
  if (audience === "executives") baseCount = Math.min(baseCount, 7); // Executives prefer concise
  if (audience === "technical") baseCount += 2; // Technical audiences need more detail
  
  return baseCount;
}

/**
 * Generate narrative flow description
 */
function generateNarrativeFlow(topic: string, audience: string, tone: string): string {
  const flows = {
    executives: "Problem → Solution → Impact → ROI → Next Steps",
    technical: "Context → Architecture → Implementation → Results → Future Work",
    sales: "Pain Point → Solution → Benefits → Proof → Call to Action",
    general: "Introduction → Key Points → Supporting Details → Conclusion",
    investors: "Opportunity → Market → Solution → Traction → Ask"
  };
  
  return flows[audience as keyof typeof flows] || flows.general;
}

/**
 * Determine transition strategy
 */
function determineTransitionStrategy(tone: string, industry: string): string {
  if (tone === "formal" && industry === "finance") {
    return "Minimal transitions (fade only) for professional, serious tone";
  }
  
  if (tone === "inspirational" || industry === "marketing") {
    return "Dynamic transitions (push, zoom) for energetic, engaging feel";
  }
  
  if (industry === "tech") {
    return "Modern transitions (wipe, split) for contemporary, innovative feel";
  }
  
  return "Balanced transitions (fade, push) for professional yet engaging presentation";
}

/**
 * Generate content slides based on topic
 */
function generateContentSlides(
  topic: string,
  count: number,
  audience: string,
  industry: string
): PresentationStructure["slides"] {
  const slides: PresentationStructure["slides"] = [];
  
  // Analyze topic to determine slide types
  const topicLower = topic.toLowerCase();
  
  // Determine slide distribution
  const hasData = topicLower.match(/sales|revenue|growth|metrics|performance|analytics/);
  const hasProcess = topicLower.match(/process|workflow|steps|implementation|strategy/);
  const hasComparison = topicLower.match(/vs|versus|compare|comparison|alternative/);
  
  for (let i = 0; i < count; i++) {
    const slideNumber = i + 1;
    
    // Vary slide types for engagement
    if (i === 0) {
      // First content slide - overview
      slides.push({
        type: "content",
        title: `${topic} - Overview`,
        purpose: "Provide high-level context and set expectations",
        keyPoints: ["Context", "Scope", "Objectives"],
        suggestedPattern: "split"
      });
    } else if (hasData && i === Math.floor(count / 2)) {
      // Middle slide - data visualization
      slides.push({
        type: "data",
        title: "Key Metrics & Performance",
        purpose: "Present data-driven insights",
        keyPoints: ["Metric 1", "Metric 2", "Metric 3"],
        suggestedPattern: "data-focused"
      });
    } else if (hasComparison && i === Math.floor(count / 3)) {
      // Comparison slide
      slides.push({
        type: "content",
        title: "Comparison & Analysis",
        purpose: "Compare options or approaches",
        keyPoints: ["Option A", "Option B", "Recommendation"],
        suggestedPattern: "split"
      });
    } else if (i === count - 1) {
      // Last content slide - call to action
      slides.push({
        type: "cta",
        title: "Next Steps",
        purpose: "Drive action and provide clear next steps",
        keyPoints: ["Action 1", "Action 2", "Timeline"],
        suggestedPattern: "minimal"
      });
    } else {
      // Regular content slide
      slides.push({
        type: "content",
        title: `Key Point ${slideNumber}`,
        purpose: "Develop main argument or provide supporting information",
        keyPoints: ["Point 1", "Point 2", "Point 3"],
        suggestedPattern: i % 2 === 0 ? "asymmetric" : "grid"
      });
    }
  }
  
  return slides;
}

/**
 * Generate enhanced prompt for multi-slide presentation
 */
export function generatePresentationPrompt(request: PresentationRequest): string {
  const structure = analyzePresentationRequest(request);
  
  const prompt = `
Create a professional ${structure.slides.length}-slide presentation on "${request.topic}".

AUDIENCE: ${request.audience || "general"}
TONE: ${request.tone || "formal"}
INDUSTRY: ${request.industry || "corporate"}

NARRATIVE FLOW: ${structure.narrativeFlow}

SLIDE STRUCTURE:
${structure.slides.map((slide, idx) => `
${idx + 1}. ${slide.title} (${slide.type})
   Pattern: ${slide.suggestedPattern}
   Purpose: ${slide.purpose}
   Key Points: ${slide.keyPoints.join(", ")}
`).join("\n")}

REQUIREMENTS:
- Maintain consistent design language across all slides
- Use ${structure.transitionStrategy}
- Ensure logical flow from slide to slide
- Include relevant data visualizations where appropriate
- Keep text concise and impactful (max 5 bullets per slide)
- Use professional color palette appropriate for ${request.industry}

Generate a complete presentation with all ${structure.slides.length} slides.
`;
  
  return prompt;
}

/**
 * Validate slide relationships and narrative flow
 */
export function validatePresentationFlow(slides: SlideSpecV1[]): {
  valid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check for title slide
  if (slides.length > 0 && !slides[0].content.title.text.match(/^[A-Z]/)) {
    issues.push("First slide should have a capitalized title");
  }
  
  // Check for consistent theme
  const themes = slides.map(s => s.meta.theme);
  const uniqueThemes = new Set(themes);
  if (uniqueThemes.size > 1) {
    issues.push(`Inconsistent themes detected: ${Array.from(uniqueThemes).join(", ")}`);
    suggestions.push("Use a consistent theme across all slides");
  }
  
  // Check for consistent color palette
  const primaryColors = slides.map(s => s.styleTokens.palette.primary);
  const uniqueColors = new Set(primaryColors);
  if (uniqueColors.size > 2) {
    issues.push("Too many different primary colors used");
    suggestions.push("Limit to 1-2 primary colors for consistency");
  }
  
  // Check slide count
  if (slides.length < 3) {
    suggestions.push("Consider adding more slides for a complete presentation");
  }
  if (slides.length > 20) {
    suggestions.push("Consider condensing content - presentations over 20 slides may lose audience attention");
  }
  
  // Check for data visualization distribution
  const dataSlides = slides.filter(s => s.content.dataViz);
  if (dataSlides.length === 0 && slides.length > 5) {
    suggestions.push("Consider adding data visualizations to support key points");
  }
  
  return {
    valid: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Generate agenda slide content from presentation structure
 */
export function generateAgendaSlide(slides: SlideSpecV1[]): {
  title: string;
  items: string[];
} {
  return {
    title: "Agenda",
    items: slides
      .filter((_, idx) => idx > 0) // Skip title slide
      .map(s => s.content.title.text)
      .slice(0, 6) // Max 6 agenda items
  };
}

