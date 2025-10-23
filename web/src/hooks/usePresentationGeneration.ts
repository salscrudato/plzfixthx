import { useState, useCallback } from "react";
import { logger } from "@/lib/logger";

interface PresentationRequest {
  topic: string;
  audience?: "executives" | "technical" | "sales" | "general" | "investors";
  tone?: "formal" | "casual" | "persuasive" | "educational" | "inspirational";
  slideCount?: number;
  industry?: "tech" | "finance" | "healthcare" | "marketing" | "corporate";
  includeAgenda?: boolean;
  includeSummary?: boolean;
}

interface PresentationResponse {
  slides: any[];
  structure: {
    title: string;
    slideCount: number;
    narrative: string[];
  };
  metadata: {
    audience: string;
    tone: string;
    industry: string;
  };
}

export function usePresentationGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<PresentationResponse | null>(null);
  const [progress, setProgress] = useState(0);

  const generatePresentation = useCallback(async (request: PresentationRequest) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      logger.info("Generating presentation", { request });

      // Get the API endpoint from environment
      const apiUrl = import.meta.env.VITE_FIREBASE_FUNCTION_URL || 
                     "https://us-central1-pls-fix-thx.cloudfunctions.net";
      
      const endpoint = `${apiUrl}/generatePresentation`;

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      logger.info("Presentation generated successfully", { 
        slideCount: data.slides?.length 
      });

      setPresentation(data);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate presentation";
      logger.error("Presentation generation failed", { error: errorMessage });
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, []);

  const reset = useCallback(() => {
    setPresentation(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    loading,
    error,
    presentation,
    progress,
    generatePresentation,
    reset
  };
}

