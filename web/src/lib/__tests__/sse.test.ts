import { describe, it, expect, vi } from "vitest";
import { parseSSEStream, parseSSEData, type SSEEvent } from "../sse";

/**
 * Helper to create a ReadableStream from string chunks
 */
function createStreamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

describe("sse", () => {
  describe("parseSSEStream", () => {
    it("should parse simple event with data", async () => {
      const stream = createStreamFromChunks([
        "event: test\n",
        "data: {\"key\":\"value\"}\n",
        "\n",
      ]);

      const events: SSEEvent[] = [];
      await parseSSEStream(stream, (event) => events.push(event));

      expect(events).toHaveLength(1);
      expect(events[0].event).toBe("test");
      expect(events[0].data).toBe('{"key":"value"}');
    });

    it("should handle fragmented chunks", async () => {
      const stream = createStreamFromChunks([
        "eve",
        "nt: frag",
        "mented\n",
        "data: {\"te",
        "st\":true}\n",
        "\n",
      ]);

      const events: SSEEvent[] = [];
      await parseSSEStream(stream, (event) => events.push(event));

      expect(events).toHaveLength(1);
      expect(events[0].event).toBe("fragmented");
      expect(events[0].data).toBe('{"test":true}');
    });

    it("should handle multi-line data", async () => {
      const stream = createStreamFromChunks([
        "event: multiline\n",
        "data: line 1\n",
        "data: line 2\n",
        "data: line 3\n",
        "\n",
      ]);

      const events: SSEEvent[] = [];
      await parseSSEStream(stream, (event) => events.push(event));

      expect(events).toHaveLength(1);
      expect(events[0].event).toBe("multiline");
      expect(events[0].data).toBe("line 1\nline 2\nline 3");
    });

    it("should handle multiple events", async () => {
      const stream = createStreamFromChunks([
        "event: first\n",
        "data: 1\n",
        "\n",
        "event: second\n",
        "data: 2\n",
        "\n",
        "event: third\n",
        "data: 3\n",
        "\n",
      ]);

      const events: SSEEvent[] = [];
      await parseSSEStream(stream, (event) => events.push(event));

      expect(events).toHaveLength(3);
      expect(events[0].event).toBe("first");
      expect(events[1].event).toBe("second");
      expect(events[2].event).toBe("third");
    });

    it("should handle id and retry fields", async () => {
      const stream = createStreamFromChunks([
        "event: test\n",
        "id: 123\n",
        "retry: 5000\n",
        "data: test\n",
        "\n",
      ]);

      const events: SSEEvent[] = [];
      await parseSSEStream(stream, (event) => events.push(event));

      expect(events).toHaveLength(1);
      expect(events[0].id).toBe("123");
      expect(events[0].retry).toBe(5000);
    });

    it("should ignore comments", async () => {
      const stream = createStreamFromChunks([
        ": this is a comment\n",
        "event: test\n",
        ": another comment\n",
        "data: value\n",
        "\n",
      ]);

      const events: SSEEvent[] = [];
      await parseSSEStream(stream, (event) => events.push(event));

      expect(events).toHaveLength(1);
      expect(events[0].event).toBe("test");
    });

    it("should handle carriage returns", async () => {
      const stream = createStreamFromChunks([
        "event: test\r\n",
        "data: value\r\n",
        "\r\n",
      ]);

      const events: SSEEvent[] = [];
      await parseSSEStream(stream, (event) => events.push(event));

      expect(events).toHaveLength(1);
      expect(events[0].event).toBe("test");
      expect(events[0].data).toBe("value");
    });

    it("should skip optional space after colon", async () => {
      const stream = createStreamFromChunks([
        "event: test\n",
        "data: value\n",
        "\n",
        "event:nospace\n",
        "data:nospace\n",
        "\n",
      ]);

      const events: SSEEvent[] = [];
      await parseSSEStream(stream, (event) => events.push(event));

      expect(events).toHaveLength(2);
      expect(events[0].data).toBe("value");
      expect(events[1].data).toBe("nospace");
    });

    it("should handle errors with onError callback", async () => {
      const stream = new ReadableStream({
        pull(controller) {
          controller.error(new Error("Stream error"));
        },
      });

      const onError = vi.fn();
      await parseSSEStream(stream, () => {}, onError);

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(onError.mock.calls[0][0].message).toBe("Stream error");
    });

    it("should flush pending event on stream end", async () => {
      const stream = createStreamFromChunks([
        "event: test\n",
        "data: value\n",
        // No empty line at end
      ]);

      const events: SSEEvent[] = [];
      await parseSSEStream(stream, (event) => events.push(event));

      expect(events).toHaveLength(1);
      expect(events[0].event).toBe("test");
    });

    it("should ignore events without event field", async () => {
      const stream = createStreamFromChunks([
        "data: orphan data\n",
        "\n",
        "event: valid\n",
        "data: valid data\n",
        "\n",
      ]);

      const events: SSEEvent[] = [];
      await parseSSEStream(stream, (event) => events.push(event));

      expect(events).toHaveLength(1);
      expect(events[0].event).toBe("valid");
    });
  });

  describe("parseSSEData", () => {
    it("should parse valid JSON", () => {
      const event: SSEEvent = {
        event: "test",
        data: '{"key":"value"}',
      };

      const parsed = parseSSEData(event);
      expect(parsed).toEqual({ key: "value" });
    });

    it("should return null for invalid JSON", () => {
      const event: SSEEvent = {
        event: "test",
        data: "not json",
      };

      const parsed = parseSSEData(event);
      expect(parsed).toBeNull();
    });

    it("should handle complex nested JSON", () => {
      const event: SSEEvent = {
        event: "test",
        data: '{"nested":{"array":[1,2,3],"bool":true}}',
      };

      const parsed = parseSSEData(event);
      expect(parsed).toEqual({
        nested: {
          array: [1, 2, 3],
          bool: true,
        },
      });
    });
  });
});

