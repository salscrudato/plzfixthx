import { useState, useCallback, useRef } from "react";
import { normalizeOrFallback } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { parseSSEStream, parseSSEData } from "@/lib/sse";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";

export interface StreamProgress {
  stage: "start" | "moderation" | "generation" | "spec" | "complete" | "error";
  status?: string;
  message?: string;
  progress?: number;
  durationMs?: number;
  error?: string;
  isFallback?: boolean;
}

export function useSlideGenerationStream() {
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<SlideSpecV1 | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<StreamProgress | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const generateStream = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      logger.warn("Generate called with empty prompt");
      return null;
    }

    setError(null);
    setLoading(true);
    setProgress({ stage: "start", status: "initializing" });

    const startTime = performance.now();
    logger.userAction("generate_slide_stream", { promptLength: prompt.length });

    try {
      // Get the API base URL
      const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5001/plzfixthx/us-central1";
      const url = `${apiBase}/generateSlideSpecStream`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      let receivedSpec: SlideSpecV1 | null = null;

      // Use robust SSE parser
      await parseSSEStream(
        response.body,
        (event) => {
          const data = parseSSEData<Record<string, unknown>>(event);
          if (!data) {
            logger.warn("Failed to parse SSE data", { event: event.event });
            return;
          }

          switch (event.event) {
            case "start":
              logger.info("Stream started", data);
              setProgress({ stage: "start", status: "started", ...data });
              break;
            case "moderation":
              logger.info("Moderation check", data);
              setProgress({ stage: "moderation", ...data });
              break;
            case "generation":
              logger.info("Generation progress", data);
              setProgress({ stage: "generation", ...data });
              break;
            case "spec":
              logger.info("Spec received", { isFallback: data.isFallback });
              receivedSpec = normalizeOrFallback(data.spec as SlideSpecV1 | null);
              setSpec(receivedSpec);
              setProgress({ stage: "spec", status: "received", isFallback: data.isFallback as boolean });
              break;
            case "complete":
              {
                const duration = performance.now() - startTime;
                logger.info("Stream completed", { ...data, totalDuration: duration });
                setProgress({ stage: "complete", status: data.status as string, durationMs: duration });
                if (data.status === "success" && receivedSpec) {
                  logger.performance("slide_generation_stream", duration);
                }
              }
              break;
            case "error":
              logger.error("Stream error", data);
              setError((data.error as string) || "Stream error occurred");
              setProgress({ stage: "error", error: data.error as string });
              break;
          }
        },
        (error) => {
          logger.error("SSE stream error", error);
          throw error;
        }
      );

      setLoading(false);
      return receivedSpec;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to generate slide";
      setError(errorMessage);
      logger.error("Failed to generate slide stream", e, { prompt: prompt.slice(0, 50) });

      // Still set a fallback spec so user sees something
      const fallback = normalizeOrFallback(null);
      setSpec(fallback);
      setProgress({ stage: "error", error: errorMessage });
      setLoading(false);
      return null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setLoading(false);
    setProgress(null);
  }, []);

  const reset = useCallback(() => {
    cancel();
    setSpec(null);
    setError(null);
    setProgress(null);
  }, [cancel]);

  return {
    loading,
    spec,
    error,
    progress,
    generateStream,
    cancel,
    reset,
  };
}

