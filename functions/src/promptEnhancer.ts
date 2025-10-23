/**
 * Prompt Enhancer
 * Analyzes and enhances user prompts with design guidance
 */

export interface EnhancedPrompt {
  original: string;
  enhanced: string;
  suggestedPattern: string;
  suggestedPalette: string;
  suggestedTypography: string;
  designGuidance: string[];
  contentType: string;
}

/**
 * Analyze prompt to determine content type
 */
export function analyzeContentType(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("data") || lower.includes("chart") || lower.includes("metric") || lower.includes("analytics")) {
    return "data-visualization";
  }
  if (lower.includes("compare") || lower.includes("vs") || lower.includes("before") || lower.includes("after")) {
    return "comparison";
  }
  if (lower.includes("process") || lower.includes("step") || lower.includes("flow")) {
    return "process";
  }
  if (lower.includes("feature") || lower.includes("product") || lower.includes("launch")) {
    return "product";
  }
  if (lower.includes("quote") || lower.includes("message") || lower.includes("key point")) {
    return "emphasis";
  }
  if (lower.includes("education") || lower.includes("learn") || lower.includes("teach")) {
    return "educational";
  }
  if (lower.includes("business") || lower.includes("corporate") || lower.includes("professional")) {
    return "corporate";
  }
  if (lower.includes("creative") || lower.includes("design") || lower.includes("art")) {
    return "creative";
  }

  return "general";
}

/**
 * Suggest design pattern based on content type
 */
export function suggestPattern(contentType: string): string {
  const patterns: Record<string, string> = {
    "data-visualization": "data-focused",
    comparison: "split",
    process: "grid",
    product: "hero",
    emphasis: "minimal",
    educational: "split",
    corporate: "split",
    creative: "asymmetric",
    general: "split"
  };

  return patterns[contentType] || "split";
}

/**
 * Suggest color palette based on content type
 */
export function suggestPalette(contentType: string): string {
  const palettes: Record<string, string> = {
    "data-visualization": "finance",
    comparison: "corporate",
    process: "tech",
    product: "creative",
    emphasis: "minimal",
    educational: "education",
    corporate: "corporate",
    creative: "creative",
    general: "corporate"
  };

  return palettes[contentType] || "corporate";
}

/**
 * Suggest typography based on content type
 */
export function suggestTypography(contentType: string): string {
  const typographies: Record<string, string> = {
    "data-visualization": "modern",
    comparison: "corporate",
    process: "modern",
    product: "bold",
    emphasis: "elegant",
    educational: "friendly",
    corporate: "corporate",
    creative: "creative",
    general: "modern"
  };

  return typographies[contentType] || "modern";
}

/**
 * Generate design guidance based on content type
 */
export function generateDesignGuidance(contentType: string): string[] {
  const guidance: Record<string, string[]> = {
    "data-visualization": [
      "Use data-focused pattern with chart as primary focus",
      "Ensure high contrast for readability",
      "Include supporting text in sidebar",
      "Use complementary colors for data series",
      "Add data labels for clarity"
    ],
    comparison: [
      "Use split pattern for 50/50 comparison",
      "Maintain visual balance between sides",
      "Use contrasting colors to highlight differences",
      "Include clear labels for each side",
      "Consider using icons for quick recognition"
    ],
    process: [
      "Use grid pattern for step-by-step flow",
      "Number or label each step clearly",
      "Use consistent styling across steps",
      "Consider adding arrows between steps",
      "Maintain logical left-to-right or top-to-bottom flow"
    ],
    product: [
      "Use hero pattern for strong visual impact",
      "Feature product image or key visual prominently",
      "Use bold typography for headlines",
      "Include key benefits in supporting text",
      "Use accent color for call-to-action"
    ],
    emphasis: [
      "Use minimal pattern with generous white space",
      "Center content for maximum impact",
      "Use large, bold typography",
      "Limit to essential message only",
      "Consider using accent color for emphasis"
    ],
    educational: [
      "Use split pattern for content organization",
      "Include visual aids or diagrams",
      "Use friendly, approachable typography",
      "Break content into digestible chunks",
      "Use consistent color coding for concepts"
    ],
    corporate: [
      "Use professional color palette",
      "Maintain consistent branding",
      "Use corporate typography",
      "Include company logo if appropriate",
      "Ensure WCAG AA accessibility compliance"
    ],
    creative: [
      "Use asymmetric pattern for dynamic layout",
      "Experiment with bold colors",
      "Use creative typography pairings",
      "Consider unconventional layouts",
      "Balance creativity with readability"
    ],
    general: [
      "Choose appropriate design pattern for content",
      "Ensure sufficient white space",
      "Maintain visual hierarchy",
      "Use consistent typography",
      "Verify color contrast ratios"
    ]
  };

  return guidance[contentType] || guidance.general;
}

/**
 * Enhance prompt with design guidance
 */
export function enhancePrompt(userPrompt: string): EnhancedPrompt {
  const contentType = analyzeContentType(userPrompt);
  const pattern = suggestPattern(contentType);
  const palette = suggestPalette(contentType);
  const typography = suggestTypography(contentType);
  const guidance = generateDesignGuidance(contentType);

  const enhanced = `${userPrompt}

DESIGN GUIDANCE:
- Pattern: ${pattern}
- Color Palette: ${palette}
- Typography: ${typography}
- Key Principles:
${guidance.map(g => `  • ${g}`).join("\n")}`;

  return {
    original: userPrompt,
    enhanced,
    suggestedPattern: pattern,
    suggestedPalette: palette,
    suggestedTypography: typography,
    designGuidance: guidance,
    contentType
  };
}

/**
 * Validate prompt for design quality
 */
export function validatePromptQuality(prompt: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (prompt.length < 10) {
    issues.push("Prompt is too short - provide more context");
  }

  if (prompt.length > 1000) {
    suggestions.push("Prompt is quite long - consider breaking into multiple slides");
  }

  if (!prompt.includes(" ")) {
    issues.push("Prompt appears to be a single word - provide more detail");
  }

  const hasNumbers = /\d/.test(prompt);
  if (!hasNumbers && prompt.toLowerCase().includes("data")) {
    suggestions.push("Data-related prompt should include specific numbers or metrics");
  }

  const hasAction = /\b(show|display|create|make|build|design)\b/i.test(prompt);
  if (!hasAction) {
    suggestions.push("Consider using action verbs like 'show', 'display', or 'create'");
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Extract key topics from prompt
 */
export function extractKeyTopics(prompt: string): string[] {
  const words = prompt.split(/\s+/);
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been"
  ]);

  return words
    .filter(word => word.length > 3 && !stopWords.has(word.toLowerCase()))
    .slice(0, 5);
}

/**
 * Generate slide title suggestions
 */
export function generateTitleSuggestions(prompt: string): string[] {
  const topics = extractKeyTopics(prompt);
  const contentType = analyzeContentType(prompt);

  const suggestions: string[] = [];

  // Suggestion 1: Direct topic
  if (topics.length > 0) {
    suggestions.push(topics[0].charAt(0).toUpperCase() + topics[0].slice(1));
  }

  // Suggestion 2: Combined topics
  if (topics.length > 1) {
    suggestions.push(
      topics.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" & ")
    );
  }

  // Suggestion 3: Content type based
  const typeBasedTitles: Record<string, string> = {
    "data-visualization": "Key Metrics & Insights",
    comparison: "Comparison Analysis",
    process: "Process Overview",
    product: "Product Highlights",
    emphasis: "Key Message",
    educational: "Learning Objectives",
    corporate: "Business Update",
    creative: "Creative Showcase"
  };

  if (typeBasedTitles[contentType]) {
    suggestions.push(typeBasedTitles[contentType]);
  }

  return suggestions;
}

