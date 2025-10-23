import { describe, it, expect } from "vitest";
import {
  createAnimation,
  getRecommendedAnimation,
  getAnimationDuration,
  createStaggerConfig,
  getEasingCurve,
  calculateSequenceTiming,
  getAnimationPreset,
  validateAnimationConfig,
  getAnimationMetadata,
  type AnimationType,
  type AnimationConfig
} from "../enhancedAnimations";

describe("Enhanced Animations", () => {
  describe("createAnimation", () => {
    it("should create animation with default values", () => {
      const animation = createAnimation("fade-in");
      expect(animation.type).toBe("fade-in");
      expect(animation.duration).toBe(500);
      expect(animation.delay).toBe(0);
      expect(animation.easing).toBe("ease-out");
    });

    it("should create animation with custom values", () => {
      const animation = createAnimation("slide-in-left", 800, 200, "ease-in");
      expect(animation.type).toBe("slide-in-left");
      expect(animation.duration).toBe(800);
      expect(animation.delay).toBe(200);
      expect(animation.easing).toBe("ease-in");
    });
  });

  describe("getRecommendedAnimation", () => {
    it("should return fade-in for title", () => {
      const animation = getRecommendedAnimation("title");
      expect(animation.type).toBe("fade-in");
      expect(animation.duration).toBe(600);
    });

    it("should return fade-in for subtitle", () => {
      const animation = getRecommendedAnimation("subtitle");
      expect(animation.type).toBe("fade-in");
      expect(animation.duration).toBe(500);
      expect(animation.delay).toBe(200);
    });

    it("should return slide-in-left for bullet", () => {
      const animation = getRecommendedAnimation("bullet");
      expect(animation.type).toBe("slide-in-left");
      expect(animation.duration).toBe(400);
      expect(animation.delay).toBe(300);
    });

    it("should return zoom-in for chart", () => {
      const animation = getRecommendedAnimation("chart");
      expect(animation.type).toBe("zoom-in");
      expect(animation.duration).toBe(700);
      expect(animation.delay).toBe(400);
    });

    it("should return fade-in for image", () => {
      const animation = getRecommendedAnimation("image");
      expect(animation.type).toBe("fade-in");
      expect(animation.duration).toBe(500);
      expect(animation.delay).toBe(300);
    });
  });

  describe("getAnimationDuration", () => {
    it("should return 300ms for simple animation", () => {
      expect(getAnimationDuration("simple")).toBe(300);
    });

    it("should return 500ms for moderate animation", () => {
      expect(getAnimationDuration("moderate")).toBe(500);
    });

    it("should return 800ms for complex animation", () => {
      expect(getAnimationDuration("complex")).toBe(800);
    });
  });

  describe("createStaggerConfig", () => {
    it("should create stagger config with defaults", () => {
      const config = createStaggerConfig();
      expect(config.enabled).toBe(true);
      expect(config.delay).toBe(100);
      expect(config.direction).toBe("forward");
    });

    it("should create stagger config with custom values", () => {
      const config = createStaggerConfig(false, 200, "backward");
      expect(config.enabled).toBe(false);
      expect(config.delay).toBe(200);
      expect(config.direction).toBe("backward");
    });
  });

  describe("getEasingCurve", () => {
    it("should return ease-in curve", () => {
      const curve = getEasingCurve("ease-in");
      expect(curve).toBe("cubic-bezier(0.42, 0, 1, 1)");
    });

    it("should return ease-out curve", () => {
      const curve = getEasingCurve("ease-out");
      expect(curve).toBe("cubic-bezier(0, 0, 0.58, 1)");
    });

    it("should return ease-in-out curve", () => {
      const curve = getEasingCurve("ease-in-out");
      expect(curve).toBe("cubic-bezier(0.42, 0, 0.58, 1)");
    });

    it("should return linear curve", () => {
      const curve = getEasingCurve("linear");
      expect(curve).toBe("linear");
    });
  });

  describe("calculateSequenceTiming", () => {
    it("should calculate forward timing", () => {
      const timings = calculateSequenceTiming(3, 0, 100, "forward");
      expect(timings).toEqual([0, 100, 200]);
    });

    it("should calculate backward timing", () => {
      const timings = calculateSequenceTiming(3, 0, 100, "backward");
      expect(timings).toEqual([0, 100, 200]);
    });

    it("should calculate with base delay", () => {
      const timings = calculateSequenceTiming(3, 200, 100, "forward");
      expect(timings).toEqual([200, 300, 400]);
    });

    it("should calculate random timing", () => {
      const timings = calculateSequenceTiming(3, 0, 100, "random");
      expect(timings.length).toBe(3);
      timings.forEach(t => {
        expect(t).toBeGreaterThanOrEqual(0);
        expect(t).toBeLessThanOrEqual(300);
      });
    });
  });

  describe("getAnimationPreset", () => {
    it("should return entrance preset", () => {
      const preset = getAnimationPreset("entrance");
      expect(preset.length).toBe(4);
      expect(preset[0].type).toBe("fade-in");
    });

    it("should return emphasis preset", () => {
      const preset = getAnimationPreset("emphasis");
      expect(preset.length).toBe(3);
      expect(preset[0].type).toBe("pulse");
    });

    it("should return exit preset", () => {
      const preset = getAnimationPreset("exit");
      expect(preset.length).toBe(3);
      expect(preset[0].type).toBe("fade-out");
    });

    it("should return transition preset", () => {
      const preset = getAnimationPreset("transition");
      expect(preset.length).toBe(3);
      expect(preset[0].type).toBe("fade-in");
    });
  });

  describe("validateAnimationConfig", () => {
    it("should validate correct config", () => {
      const config: AnimationConfig = {
        type: "fade-in",
        duration: 500,
        delay: 0
      };
      const result = validateAnimationConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should reject negative duration", () => {
      const config: AnimationConfig = {
        type: "fade-in",
        duration: -100,
        delay: 0
      };
      const result = validateAnimationConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject negative delay", () => {
      const config: AnimationConfig = {
        type: "fade-in",
        duration: 500,
        delay: -100
      };
      const result = validateAnimationConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should accept valid repeat count", () => {
      const config: AnimationConfig = {
        type: "fade-in",
        duration: 500,
        delay: 0,
        repeat: 2
      };
      const result = validateAnimationConfig(config);
      expect(result.valid).toBe(true);
    });
  });

  describe("getAnimationMetadata", () => {
    it("should return metadata for fade-in", () => {
      const metadata = getAnimationMetadata("fade-in");
      expect(metadata.name).toBe("Fade In");
      expect(metadata.category).toBe("entrance");
      expect(metadata.duration).toBe(500);
    });

    it("should return metadata for pulse", () => {
      const metadata = getAnimationMetadata("pulse");
      expect(metadata.name).toBe("Pulse");
      expect(metadata.category).toBe("emphasis");
      expect(metadata.duration).toBe(600);
    });

    it("should return metadata for zoom-out", () => {
      const metadata = getAnimationMetadata("zoom-out");
      expect(metadata.name).toBe("Zoom Out");
      expect(metadata.category).toBe("exit");
      expect(metadata.duration).toBe(600);
    });

    it("should have description for all animations", () => {
      const animations: AnimationType[] = [
        "fade-in", "slide-in-left", "zoom-in", "pulse", "bounce-in"
      ];
      animations.forEach(anim => {
        const metadata = getAnimationMetadata(anim);
        expect(metadata.description).toBeTruthy();
        expect(metadata.description.length).toBeGreaterThan(0);
      });
    });
  });
});

