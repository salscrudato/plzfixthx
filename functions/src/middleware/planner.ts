/**
 * AI Planner Module
 * =================
 * Extracts high-level intent from user prompts using the planner stage.
 * Part of the two-stage AI pipeline.
 */

import * as logger from "firebase-functions/logger";
import { z } from "zod";
import { callAIWithRetry } from "../aiHelpers";

/* -------------------------------------------------------------------------- */
/*                            Intent Plan Schema                              */
/* -------------------------------------------------------------------------- */

/**
 * Planner output schema - extracts high-level intent from user prompt
 */
export const IntentPlanZ = z.object({
  intent: z.enum(["explanatory", "action", "analytical"]),
  audience: z.string().max(100),
  tone: z.enum(["formal", "conversational", "technical", "executive"]),
  slidePattern: z.enum(["overview", "2x2", "timeline", "bar-chart", "compare-contrast", "process-flow", "hero"]),
  brandHints: z.array(z.string()).max(5).optional(),
  dataHints: z.array(z.string()).max(10).optional(),
  visualPlan: z.enum(["chart", "table", "hero", "illustration", "minimal"]),
});

export type IntentPlan = z.infer<typeof IntentPlanZ>;

/* -------------------------------------------------------------------------- */
/*                            Planner Prompt                                  */
/* -------------------------------------------------------------------------- */

/**
 * Planner system prompt - extracts intent from user prompt
 */
const PLANNER_PROMPT = `You are an expert slide intent analyzer. Extract the following from the user's prompt:
- intent: "explanatory" (explain/describe/overview), "action" (optimize/improve/strategy), or "analytical" (analyze/compare/metrics)
- audience: who is this for? (e.g., "executives", "technical team", "general audience")
- tone: "formal", "conversational", "technical", or "executive"
- slidePattern: "overview", "2x2", "timeline", "bar-chart", "compare-contrast", "process-flow", or "hero"
- brandHints: any company/brand names mentioned (max 5)
- dataHints: any explicit numbers, metrics, or data points mentioned (max 10)
- visualPlan: "chart", "table", "hero", "illustration", or "minimal"

Return ONLY valid JSON matching this schema. No markdown, no explanations.`;

/* -------------------------------------------------------------------------- */
/*                            Planner Stage                                   */
/* -------------------------------------------------------------------------- */

/**
 * Run planner stage to extract intent from prompt
 */
export async function runPlanner(
  sanitizedPrompt: string,
  requestId: string,
  apiKey: string,
  baseUrl: string
): Promise<IntentPlan> {
  const plannerStart = Date.now();
  const plannerModel = "gpt-4o-mini"; // Cheaper, faster model for intent extraction

  const planResult = await callAIWithRetry(
    `${PLANNER_PROMPT}\n\nUser prompt: ${sanitizedPrompt}`,
    apiKey,
    baseUrl,
    plannerModel,
    IntentPlanZ,
    requestId,
    0.1 // Low temperature for consistent intent extraction
  );

  const plan = planResult as IntentPlan;
  const plannerTime = Date.now() - plannerStart;

  logger.info("Planner stage complete", {
    requestId,
    intent: plan.intent,
    audience: plan.audience,
    tone: plan.tone,
    slidePattern: plan.slidePattern,
    visualPlan: plan.visualPlan,
    plannerTimeMs: plannerTime,
  });

  return plan;
}

