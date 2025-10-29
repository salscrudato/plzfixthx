import { useState, useCallback, useRef, useEffect } from "react";
import { normalizeOrFallback } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { parseSSEData } from "@/lib/sse";
import { baseUrl } from "@/lib/api";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";

export interface StreamProgress {
  stage: "start" | "moderation" | "generation" | "enhancement" | "spec" | "complete" | "error";
  status?: string;
  message?: string;
  progress?: number; // 0-100
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  const generateStream = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      setError("Please enter a valid prompt");
      logger.warn("Generate called with empty prompt");
      return null;
    }

    setError(null);
    setLoading(true);
    setProgress({ stage: "start", status: "initializing", progress: 0 });

    const startTime = performance.now();
    logger.userAction("generate_slide_stream", { promptLength: prompt.length });

    const connect = () => {
      try {
        const url = `${baseUrl()}/generateSlideSpecStream`;
        abortControllerRef.current = new AbortController();

        const eventSource = new EventSource(`${url}?prompt=${encodeURIComponent(prompt)}`, {
          withCredentials: true,
        });

        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          logger.info("SSE connection opened");
          retryCountRef.current = 0;
          setProgress({ stage: "start", status: "connected", progress: 10 });
        };

        eventSource.onmessage = (event) => {
          const data = parseSSEData<Record<string, unknown>>(event.data);
          if (!data) {
            logger.warn("Failed to parse SSE data", { event: event.data });
            return;
          }

          switch (event.type) { // Use event.type if custom events
            case "start":
              setProgress({ stage: "start", progress: 10, ...data });
              break;
            case "moderation":
              setProgress({ stage: "moderation", progress: 30, ...data });
              break;
            case "generation":
              setProgress({ stage: "generation", progress: 50, ...data });
              break;
            case "enhancement":
              setProgress({ stage: "enhancement", progress: 70, ...data });
              break;
            case "spec":
              const receivedSpec = normalizeOrFallback(data.spec as SlideSpecV1 | null);
              setSpec(receivedSpec);
              setProgress({ stage: "spec", progress: 90, isFallback: data.isFallback as boolean });
              break;
            case "complete":
              const duration = performance.now() - startTime;
              setProgress({ stage: "complete", progress: 100, durationMs: duration, ...data });
              logger.performance("slide_generation_stream", duration);
              eventSource.close();
              break;
            case "error":
              setError((data.error as string) || "Stream error occurred");
              setProgress({ stage: "error", progress: 0, error: data.error as string });
              eventSource.close();
              break;
            default:
              logger.warn("Unknown SSE event", { type: event.type, data });
          }
        };

        eventSource.onerror = (err) => {
          logger.error("SSE error", err);
          eventSource.close();
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            const delay = 1000 * Math.pow(2, retryCountRef.current); // Exponential backoff
            logger.info(`Reconnecting in ${delay}ms (attempt ${retryCountRef.current})`);
            setTimeout(connect, delay);
          } else {
            setError("Failed to connect after retries");
            setLoading(false);
          }
        };

        return eventSource;
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to generate slide";
        setError(errorMessage);
        logger.error("Failed to generate slide stream", e, { prompt: prompt.slice(0, 50) });
        setSpec(normalizeOrFallback(null));
        setProgress({ stage: "error", progress: 0, error: errorMessage });
        setLoading(false);
        return null;
      }
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
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
    retryCountRef.current = 0;
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