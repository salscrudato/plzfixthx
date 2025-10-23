import { useState, useEffect, useCallback } from "react";
import type { Presentation } from "@/types/Presentation";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "plzfixthx_presentations";
const MAX_HISTORY_ITEMS = 50;

interface HistoryItem {
  id: string;
  presentation: Presentation;
  savedAt: string;
}

export function useSlideHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        setHistory(parsed);
        logger.info("Loaded presentation history", { count: parsed.length });
      }
    } catch (error) {
      logger.error("Failed to load presentation history", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save presentation to history
  const savePresentation = useCallback((presentation: Presentation) => {
    try {
      const historyItem: HistoryItem = {
        id: presentation.id,
        presentation,
        savedAt: new Date().toISOString(),
      };

      setHistory((prev) => {
        // Remove existing entry with same ID if it exists
        const filtered = prev.filter((item) => item.id !== presentation.id);
        
        // Add new entry at the beginning
        const updated = [historyItem, ...filtered];
        
        // Limit to MAX_HISTORY_ITEMS
        const trimmed = updated.slice(0, MAX_HISTORY_ITEMS);
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        
        logger.info("Saved presentation to history", { 
          id: presentation.id, 
          title: presentation.title 
        });
        
        return trimmed;
      });

      return true;
    } catch (error) {
      logger.error("Failed to save presentation to history", error);
      return false;
    }
  }, []);

  // Load presentation from history
  const loadPresentation = useCallback((id: string): Presentation | null => {
    const item = history.find((h) => h.id === id);
    if (item) {
      logger.info("Loaded presentation from history", { id, title: item.presentation.title });
      return item.presentation;
    }
    return null;
  }, [history]);

  // Delete presentation from history
  const deletePresentation = useCallback((id: string) => {
    try {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        logger.info("Deleted presentation from history", { id });
        return updated;
      });
      return true;
    } catch (error) {
      logger.error("Failed to delete presentation from history", error);
      return false;
    }
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    try {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
      logger.info("Cleared presentation history");
      return true;
    } catch (error) {
      logger.error("Failed to clear presentation history", error);
      return false;
    }
  }, []);

  // Get recent presentations
  const getRecentPresentations = useCallback((limit = 10): HistoryItem[] => {
    return history.slice(0, limit);
  }, [history]);

  // Search presentations
  const searchPresentations = useCallback((query: string): HistoryItem[] => {
    const lowerQuery = query.toLowerCase();
    return history.filter((item) => 
      item.presentation.title.toLowerCase().includes(lowerQuery) ||
      item.presentation.slides.some((slide) => 
        slide.spec.content.title.text.toLowerCase().includes(lowerQuery)
      )
    );
  }, [history]);

  return {
    history,
    loading,
    savePresentation,
    loadPresentation,
    deletePresentation,
    clearHistory,
    getRecentPresentations,
    searchPresentations,
  };
}

