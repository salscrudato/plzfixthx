import { describe, it, expect, beforeEach } from "vitest";
import { getClientId } from "../security";
import { sanitizePrompt } from "../aiHelpers";
import { Request } from "express";

describe("security", () => {
  describe("sanitizePrompt", () => {
    it("should accept valid prompts", () => {
      const result = sanitizePrompt("Create a professional slide about Q1 results");
      expect(result).toBe("Create a professional slide about Q1 results");
    });

    it("should trim whitespace", () => {
      const result = sanitizePrompt("  Hello World  ");
      expect(result).toBe("Hello World");
    });

    it("should reject empty prompts", () => {
      expect(() => sanitizePrompt("")).toThrow("Prompt must be a non-empty string");
      expect(() => sanitizePrompt("   ")).toThrow();
    });

    it("should reject prompts shorter than 3 characters", () => {
      expect(() => sanitizePrompt("ab")).toThrow("Prompt must be at least 3 characters long");
    });

    it("should truncate long prompts to 1200 characters by default", () => {
      const longPrompt = "a".repeat(5000);
      const result = sanitizePrompt(longPrompt);
      expect(result.length).toBeLessThanOrEqual(1200);
    });

    it("should reject non-string input", () => {
      expect(() => sanitizePrompt(null as unknown as string)).toThrow();
      expect(() => sanitizePrompt(undefined as unknown as string)).toThrow();
    });
  });

  // Note: Content moderation tests are in aiHelpers.test.ts (moderateContent function)

  describe("getClientId", () => {
    it("should generate consistent IDs for same client", () => {
      const mockReq = {
        ip: "192.168.1.1",
        socket: { remoteAddress: "192.168.1.1" },
        get: (header: string) => {
          if (header === "user-agent") return "Mozilla/5.0";
          return undefined;
        },
      } as unknown as Request;

      const id1 = getClientId(mockReq);
      const id2 = getClientId(mockReq);

      expect(id1).toBe(id2);
      expect(id1.length).toBe(16); // SHA256 slice to 16 chars
    });

    it("should generate different IDs for different clients", () => {
      const mockReq1 = {
        ip: "192.168.1.1",
        socket: { remoteAddress: "192.168.1.1" },
        get: (header: string) => {
          if (header === "user-agent") return "Mozilla/5.0";
          return undefined;
        },
      } as unknown as Request;

      const mockReq2 = {
        ip: "192.168.1.2",
        socket: { remoteAddress: "192.168.1.2" },
        get: (header: string) => {
          if (header === "user-agent") return "Mozilla/5.0";
          return undefined;
        },
      } as unknown as Request;

      const id1 = getClientId(mockReq1);
      const id2 = getClientId(mockReq2);

      expect(id1).not.toBe(id2);
    });

    it("should handle missing IP gracefully", () => {
      const mockReq = {
        ip: undefined,
        socket: { remoteAddress: undefined },
        get: () => "Mozilla/5.0",
      } as unknown as Request;

      const id = getClientId(mockReq);
      expect(id).toBeDefined();
      expect(id.length).toBe(16);
    });
  });
});

