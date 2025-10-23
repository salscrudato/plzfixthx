import { useState, useCallback } from "react";
import { apiGenerate } from "@/lib/api";
import { normalizeOrFallback } from "@/lib/validation";
import { logger } from "@/lib/logger";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";

export function useSlideGeneration() {
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<SlideSpecV1 | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      logger.warn("Generate called with empty prompt");
      return null;
    }

    setError(null);
    setLoading(true);

    const startTime = performance.now();
    logger.userAction("generate_slide", { promptLength: prompt.length });

    try {
      const data = await apiGenerate(prompt);
      const normalized = normalizeOrFallback(data?.spec ?? data);
      setSpec(normalized);

      const duration = performance.now() - startTime;
      logger.performance("slide_generation", duration);
      logger.info("Slide generated successfully", { duration });

      return normalized;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to generate slide";
      setError(errorMessage);
      logger.error("Failed to generate slide", e, { prompt: prompt.slice(0, 50) });

      // Still set a fallback spec so user sees something
      const fallback = normalizeOrFallback(null);
      setSpec(fallback);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSpec(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    spec,
    error,
    generate,
    reset
  };
}

