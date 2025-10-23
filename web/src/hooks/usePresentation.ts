import { useState, useCallback } from "react";
import type { Presentation } from "@/types/Presentation";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";
import { createPresentation, createSlide } from "@/types/Presentation";
import { logger } from "@/lib/logger";

export function usePresentation(initialAspectRatio: "16:9" | "4:3" = "16:9") {
  const [presentation, setPresentation] = useState<Presentation>(() => 
    createPresentation("My Presentation", initialAspectRatio)
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const addSlide = useCallback((spec: SlideSpecV1, prompt?: string): string => {
    const slide = createSlide(spec, prompt);
    setPresentation(prev => ({
      ...prev,
      slides: [...prev.slides, slide],
      updatedAt: Date.now(),
    }));
    setCurrentSlideIndex(presentation.slides.length); // Navigate to new slide
    logger.info("Slide added to presentation", { slideId: slide.id, totalSlides: presentation.slides.length + 1 });
    return slide.id;
  }, [presentation.slides.length]);

  const removeSlide = useCallback((slideId: string) => {
    setPresentation(prev => {
      const newSlides = prev.slides.filter(s => s.id !== slideId);
      return {
        ...prev,
        slides: newSlides,
        updatedAt: Date.now(),
      };
    });
    
    // Adjust current index if needed
    setCurrentSlideIndex(prev => {
      const newLength = presentation.slides.length - 1;
      if (prev >= newLength) {
        return Math.max(0, newLength - 1);
      }
      return prev;
    });
    
    logger.info("Slide removed from presentation", { slideId });
  }, [presentation.slides.length]);

  const updateSlide = useCallback((slideId: string, spec: SlideSpecV1) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(slide =>
        slide.id === slideId
          ? { ...slide, spec, updatedAt: Date.now() }
          : slide
      ),
      updatedAt: Date.now(),
    }));
    logger.info("Slide updated", { slideId });
  }, []);

  const duplicateSlide = useCallback((slideId: string) => {
    const slideIndex = presentation.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;

    const originalSlide = presentation.slides[slideIndex];
    const newSlide = createSlide(originalSlide.spec, originalSlide.prompt);

    setPresentation(prev => {
      const newSlides = [...prev.slides];
      newSlides.splice(slideIndex + 1, 0, newSlide);
      return {
        ...prev,
        slides: newSlides,
        updatedAt: Date.now(),
      };
    });

    setCurrentSlideIndex(slideIndex + 1);
    logger.info("Slide duplicated", { originalId: slideId, newId: newSlide.id });
  }, [presentation.slides]);

  const reorderSlides = useCallback((fromIndex: number, toIndex: number) => {
    setPresentation(prev => {
      const newSlides = [...prev.slides];
      const [removed] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, removed);
      return {
        ...prev,
        slides: newSlides,
        updatedAt: Date.now(),
      };
    });
    
    // Update current index if the current slide was moved
    if (currentSlideIndex === fromIndex) {
      setCurrentSlideIndex(toIndex);
    } else if (currentSlideIndex > fromIndex && currentSlideIndex <= toIndex) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    } else if (currentSlideIndex < fromIndex && currentSlideIndex >= toIndex) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
    
    logger.info("Slides reordered", { fromIndex, toIndex });
  }, [currentSlideIndex]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < presentation.slides.length) {
      setCurrentSlideIndex(index);
    }
  }, [presentation.slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex(prev => 
      prev < presentation.slides.length - 1 ? prev + 1 : prev
    );
  }, [presentation.slides.length]);

  const previousSlide = useCallback(() => {
    setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : prev);
  }, []);

  const updateTitle = useCallback((title: string) => {
    setPresentation(prev => ({
      ...prev,
      title,
      updatedAt: Date.now(),
    }));
  }, []);

  const clearPresentation = useCallback(() => {
    setPresentation(createPresentation("My Presentation", presentation.aspectRatio));
    setCurrentSlideIndex(0);
    logger.info("Presentation cleared");
  }, [presentation.aspectRatio]);

  const currentSlide = presentation.slides[currentSlideIndex] || null;

  return {
    presentation,
    currentSlide,
    currentSlideIndex,
    addSlide,
    removeSlide,
    updateSlide,
    duplicateSlide,
    reorderSlides,
    goToSlide,
    nextSlide,
    previousSlide,
    updateTitle,
    clearPresentation,
    hasSlides: presentation.slides.length > 0,
    slideCount: presentation.slides.length,
    canGoNext: currentSlideIndex < presentation.slides.length - 1,
    canGoPrevious: currentSlideIndex > 0,
  };
}

