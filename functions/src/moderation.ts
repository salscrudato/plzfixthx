/**
 * Content Moderation Module
 * =========================
 * Handles content safety checks, abuse detection, and prompt validation.
 * Extracted from aiHelpers.ts for better code organization.
 *
 * Moderation Flow:
 * ================
 * 1. aiOrchestrator.validateAIRequest() calls moderateContent()
 * 2. moderateContent() checks for high-risk categories (violence, drugs, hate speech, etc.)
 * 3. If unsafe, throws ModerationError with category details
 * 4. If safe, returns { safe: true }
 * 5. sanitizePrompt() removes jailbreak attempts and code fences
 * 6. Sanitized prompt is passed to AI pipeline (Planner → Generator)
 *
 * Key Functions:
 * - moderateContent(prompt): Checks for unsafe content, returns { safe, reason?, categories? }
 * - sanitizePrompt(prompt): Removes code fences, jailbreak attempts, truncates to max length
 *
 * Integration Points:
 * - Called from: aiOrchestrator.validateAIRequest()
 * - Exported to: aiHelpers.ts (re-exported for backward compatibility)
 */

import * as logger from "firebase-functions/logger";
import { randomUUID } from "crypto";

/* -------------------------------------------------------------------------- */
/*                            Structured Error Types                          */
/* -------------------------------------------------------------------------- */

export class ModerationError extends Error {
  constructor(
    message: string,
    public requestId: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ModerationError";
    this.code = "MODERATION_ERROR";
  }
  code: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Moderation                                 */
/* -------------------------------------------------------------------------- */

export function moderateContent(
  prompt: string
): { safe: boolean; reason?: string; categories?: string[] } {
  const lower = prompt.toLowerCase();

  // Business context keywords allow benign usage (esp. crypto/finance/security topics)
  const benignBusiness = /\b(strategy|market|roadmap|policy|regulation|regulatory|compliance|report|analysis|architecture|infrastructure|risk|controls|governance|kpi|presentation|slide|deck|test|testing|assessment|business|finance|consulting)\b/i;

  // High-risk categories - expanded for more coverage
  const categories: Array<{ name: string; rx: RegExp; severity: number }> = [
    // Explicit wrongdoing / instructions
    { name: "violent wrongdoing", rx: /\b(build|make|how\s*to|instructions?|guide|recipe)\b.*\b(bomb|weapon|explosive|molotov|knife|gun|poison|bioweapon|nuclear)\b/i, severity: 5 },
    { name: "cyber wrongdoing", rx: /\b(hack|zero[-\s]?day|exploit|ransomware|botnet|ddos|bypass|backdoor|phish|malware|virus|trojan)\b.*\b(guide|how|tutorial|steps?|system|code|script)\b/i, severity: 5 },
    // Extremist violence or threats
    { name: "incitement", rx: /\b(kill|murder|assault|shoot|stab|bomb|terrorize|threaten)\b.*\b(how|plan|guide|tips?|target)\b/i, severity: 5 },
    // Sexual content explicit
    { name: "sexual content", rx: /\b(porn|xxx|nsfw|explicit|nude|sexual|erotic|fetish|incest|bestiality)\b/i, severity: 4 },
    // Drugs illegal
    { name: "illegal drugs", rx: /\b(cocaine|heroin|meth|mdma|lsd|fentanyl|opioid|methamphetamine|ecstasy)\b.*\b(make|produce|manufacture|synthesis|buy|sell)\b/i, severity: 4 },
    // Fraud / scams
    { name: "scams", rx: /\b(get\s*rich\s*quick|double\s*your\s*(money|btc)|seed\s*phrase|giveaway|airdrop\s*claim|ponzi|pyramid|fake\s*invoice|fraud|scam\s*script)\b/i, severity: 4 },
    // Hate / harassment
    { name: "hate speech", rx: /\b(racist|white\s*power|kkk|nazi|kill\s*\w+|gas\s*\w+|genocide|ethnic\s*cleansing|slur|discriminate)\b/i, severity: 5 },
    // Additional: Child exploitation
    { name: "child exploitation", rx: /\b(child|minor|kid|teen)\b.*\b(porn|abuse|exploit|traffic|sextort|groom)\b/i, severity: 5 },
    // Additional: Self-harm
    { name: "self-harm", rx: /\b(suicide|self-harm|cut|overdose|how\s*to\s*die)\b/i, severity: 5 },
  ];

  // **Allow** benign business contexts for crypto/security words
  if (/\b(crypto|bitcoin|nft|blockchain|penetration\s*test|security|vulnerability|exploit|hack)\b/i.test(prompt) && benignBusiness.test(prompt)) {
    // do nothing — allowed
  } else {
    // Add softer generic matches (these alone shouldn't block)
    categories.push(
      { name: "generic violence", rx: /\b(violence|weapon|bomb|terror|assault|murder)\b/i, severity: 1 },
      { name: "generic cyber", rx: /\b(hack|exploit|vulnerability|xss|sql\s*injection|malware|virus)\b/i, severity: 2 },
      { name: "generic spam", rx: /\b(spam|scam|phishing|fraud|fake|forge)\b/i, severity: 2 }
    );
  }

  let score = 0;
  const hits: string[] = [];

  for (const c of categories) {
    if (c.rx.test(lower)) {
      score += c.severity;
      hits.push(c.name);
    }
  }

  // Length abuse
  if (prompt.length > 8000) { // Increased max for complex prompts
    return { safe: false, reason: "Prompt too long (max 8000 chars)", categories: ["abuse"] };
  }

  // Repetition abuse
  const words = prompt.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    const freq = new Map<string, number>();
    for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
    const maxFreq = Math.max(...freq.values());
    if (maxFreq > words.length * 0.4) { // Lowered threshold for stricter check
      return { safe: false, reason: "Excessive repetition detected", categories: ["abuse"] };
    }
  }

  // Entropy check for gibberish
  const charFreq = new Map<string, number>();
  for (const char of prompt) {
    charFreq.set(char, (charFreq.get(char) || 0) + 1);
  }
  const entropy = -Array.from(charFreq.values())
    .map(f => f / prompt.length * Math.log2(f / prompt.length))
    .reduce((a, b) => a + b, 0);
  if (entropy < 2.5) { // Low entropy indicates potential spam/gibberish
    return { safe: false, reason: "Low content entropy (possible spam)", categories: ["abuse"] };
  }

  if (score >= 2) {
    logger.warn("Content moderation blocked prompt", { categories: hits, score });
    throw new ModerationError("Content may be unsafe or disallowed", randomUUID(), { categories: hits, score });
  }

  return { safe: true };
}

/* -------------------------------------------------------------------------- */
/*                              Prompt sanitation                              */
/* -------------------------------------------------------------------------- */

export function sanitizePrompt(prompt: string, maxLength = 1200): string { // Increased max length for more complex prompts
  if (!prompt || typeof prompt !== "string") throw new Error("Prompt must be a non-empty string");
  let p = prompt.trim();

  // Remove code fences and obvious wrappers
  p = p.replace(/^```[a-z0-9]*\n?/i, "").replace(/```$/i, "").trim();

  // Remove potential jailbreak attempts
  p = p.replace(/ignore previous instructions|forget rules|act as|roleplay/gi, "");

  if (p.length < 3) throw new Error("Prompt must be at least 3 characters long");

  if (p.length > maxLength) {
    logger.info("Prompt truncated to max length", { original: p.length, max: maxLength });
    return p.slice(0, maxLength);
  }

  return p;
}

