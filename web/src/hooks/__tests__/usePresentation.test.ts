import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePresentation } from '../usePresentation';
import type { SlideSpecV1 } from '@/types/SlideSpecV1';

const mockSlideSpec: SlideSpecV1 = {
  meta: {
    version: '1.0',
    locale: 'en-US',
    theme: 'Test',
    aspectRatio: '16:9',
  },
  content: {
    title: { id: 'title', text: 'Test Slide' },
  },
  layout: {
    grid: { rows: 8, cols: 12, gutter: 8, margin: { t: 24, r: 24, b: 24, l: 24 } },
    regions: [],
    anchors: [],
  },
  styleTokens: {
    palette: {
      primary: '#6366F1',
      accent: '#EC4899',
      neutral: ['#0F172A', '#1E293B', '#334155', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'],
    },
    typography: {
      fonts: { sans: 'Inter, Arial, sans-serif' },
      sizes: { 'step_-2': 12, 'step_-1': 14, step_0: 16, step_1: 20, step_2: 24, step_3: 32 },
      weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeights: { compact: 1.2, standard: 1.5 },
    },
    spacing: { base: 4, steps: [0, 4, 8, 12, 16, 24, 32] },
    radii: { sm: 2, md: 6, lg: 12 },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,.06)',
      md: '0 4px 8px rgba(0,0,0,.12)',
      lg: '0 12px 24px rgba(0,0,0,.18)',
    },
    contrast: { minTextContrast: 4.5, minUiContrast: 3 },
  },
};

describe('usePresentation', () => {
  it('should initialize with default presentation', () => {
    const { result } = renderHook(() => usePresentation());

    expect(result.current.presentation).toBeDefined();
    expect(result.current.presentation.slides.length).toBe(0);
    expect(result.current.currentSlideIndex).toBe(0);
    expect(result.current.slideCount).toBe(0);
  });

  it('should add a slide', () => {
    const { result } = renderHook(() => usePresentation());

    act(() => {
      result.current.addSlide(mockSlideSpec, 'Test prompt');
    });

    expect(result.current.slideCount).toBe(1);
    expect(result.current.currentSlide?.spec).toEqual(mockSlideSpec);
  });

  it('should remove a slide', () => {
    const { result } = renderHook(() => usePresentation());

    let slideId: string | undefined;
    act(() => {
      slideId = result.current.addSlide(mockSlideSpec, 'Test prompt') || '';
    });

    act(() => {
      if (slideId) {
        result.current.removeSlide(slideId);
      }
    });

    expect(result.current.slideCount).toBe(0);
  });

  it('should navigate to next slide', () => {
    const { result } = renderHook(() => usePresentation());

    act(() => {
      result.current.addSlide(mockSlideSpec, 'Slide 1');
      result.current.addSlide(mockSlideSpec, 'Slide 2');
    });

    expect(result.current.currentSlideIndex).toBe(0);

    act(() => {
      result.current.nextSlide();
    });

    expect(result.current.currentSlideIndex).toBe(1);
  });

  it('should navigate to previous slide', () => {
    const { result } = renderHook(() => usePresentation());

    act(() => {
      result.current.addSlide(mockSlideSpec, 'Slide 1');
      result.current.addSlide(mockSlideSpec, 'Slide 2');
      result.current.goToSlide(1);
    });

    expect(result.current.currentSlideIndex).toBe(1);

    act(() => {
      result.current.previousSlide();
    });

    expect(result.current.currentSlideIndex).toBe(0);
  });

  it('should not navigate beyond bounds', () => {
    const { result } = renderHook(() => usePresentation());

    act(() => {
      result.current.addSlide(mockSlideSpec, 'Slide 1');
    });

    expect(result.current.canGoNext).toBe(false);
    expect(result.current.canGoPrevious).toBe(false);

    act(() => {
      result.current.nextSlide();
    });

    expect(result.current.currentSlideIndex).toBe(0);
  });

  it('should duplicate a slide', () => {
    const { result } = renderHook(() => usePresentation());

    let slideId: string;
    act(() => {
      slideId = result.current.addSlide(mockSlideSpec, 'Original');
    });

    act(() => {
      result.current.duplicateSlide(slideId!);
    });

    expect(result.current.slideCount).toBe(2);
  });

  it('should update a slide', () => {
    const { result } = renderHook(() => usePresentation());

    let slideId: string;
    act(() => {
      slideId = result.current.addSlide(mockSlideSpec, 'Original');
    });

    const updatedSpec = {
      ...mockSlideSpec,
      content: {
        ...mockSlideSpec.content,
        title: { id: 'title', text: 'Updated Title' },
      },
    };

    act(() => {
      result.current.updateSlide(slideId!, updatedSpec);
    });

    expect(result.current.currentSlide?.spec.content.title.text).toBe('Updated Title');
  });

  it('should reorder slides', () => {
    const { result } = renderHook(() => usePresentation());

    act(() => {
      result.current.addSlide(mockSlideSpec, 'Slide 1');
      result.current.addSlide(mockSlideSpec, 'Slide 2');
      result.current.addSlide(mockSlideSpec, 'Slide 3');
    });

    const slide1Id = result.current.presentation.slides[0].id;
    const slide3Id = result.current.presentation.slides[2].id;

    act(() => {
      result.current.reorderSlides(2, 0);
    });

    expect(result.current.presentation.slides[0].id).toBe(slide3Id);
    expect(result.current.presentation.slides[2].id).toBe(slide1Id);
  });
});

