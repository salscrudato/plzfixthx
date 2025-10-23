import { describe, it, expect, beforeEach, vi } from "vitest";
import { addIcon, type IconType } from "../iconLibrary";

describe("Icon Library", () => {
  let mockSlide: any;

  beforeEach(() => {
    mockSlide = {
      addShape: vi.fn(),
      addText: vi.fn()
    };
  });

  describe("addIcon", () => {
    it("should add a checkmark icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "checkmark", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a cross icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "cross", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add an arrow-right icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "arrow-right", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add an arrow-left icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "arrow-left", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add an arrow-up icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "arrow-up", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add an arrow-down icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "arrow-down", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a star icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "star", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a heart icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "heart", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a lightbulb icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "lightbulb", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a target icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "target", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a chart icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "chart", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a settings icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "settings", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a user icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "user", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a users icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "users", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a lock icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "lock", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add an unlock icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "unlock", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a download icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "download", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add an upload icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "upload", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a search icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "search", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a bell icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "bell", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a mail icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "mail", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a phone icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "phone", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a calendar icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "calendar", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a clock icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "clock", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a folder icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "folder", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a file icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "file", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a trash icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "trash", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add an edit icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "edit", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a copy icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "copy", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a share icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "share", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a play icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "play", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a pause icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "pause", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a stop icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "stop", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a volume icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "volume", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a wifi icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "wifi", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should add a battery icon", () => {
      addIcon(mockSlide, 1, 1, 0.5, "battery", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should use default color if not provided", () => {
      addIcon(mockSlide, 1, 1, 0.5, "checkmark");
      expect(mockSlide.addShape).toHaveBeenCalled();
    });

    it("should handle different sizes", () => {
      addIcon(mockSlide, 1, 1, 0.25, "star", "#000000");
      addIcon(mockSlide, 1, 1, 0.5, "star", "#000000");
      addIcon(mockSlide, 1, 1, 1, "star", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalledTimes(3);
    });

    it("should handle different positions", () => {
      addIcon(mockSlide, 0, 0, 0.5, "star", "#000000");
      addIcon(mockSlide, 5, 5, 0.5, "star", "#000000");
      addIcon(mockSlide, 10, 7.5, 0.5, "star", "#000000");
      expect(mockSlide.addShape).toHaveBeenCalledTimes(3);
    });

    it("should handle different colors", () => {
      addIcon(mockSlide, 1, 1, 0.5, "star", "#FF0000");
      addIcon(mockSlide, 1, 1, 0.5, "star", "#00FF00");
      addIcon(mockSlide, 1, 1, 0.5, "star", "#0000FF");
      expect(mockSlide.addShape).toHaveBeenCalledTimes(3);
    });
  });
});

