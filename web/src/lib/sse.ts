/**
 * Robust Server-Sent Events (SSE) parser
 * Handles fragmented chunks, multi-line data, and proper event/data pairing
 */

export interface SSEEvent {
  event: string;
  data: string;
  id?: string;
  retry?: number;
}

export type SSEEventHandler = (event: SSEEvent) => void;

/**
 * Parse SSE stream from a ReadableStream
 * 
 * Spec: https://html.spec.whatwg.org/multipage/server-sent-events.html
 * 
 * Format:
 * event: eventName
 * data: {"key": "value"}
 * id: 123
 * 
 * event: anotherEvent
 * data: line 1
 * data: line 2
 * 
 * Empty line triggers dispatch
 */
export async function parseSSEStream(
  stream: ReadableStream<Uint8Array>,
  onEvent: SSEEventHandler,
  onError?: (error: Error) => void
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  
  let buffer = "";
  let currentEvent: Partial<SSEEvent> = {};
  let dataLines: string[] = [];
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // Flush any pending event
        if (currentEvent.event && dataLines.length > 0) {
          dispatchEvent(currentEvent, dataLines, onEvent);
        }
        break;
      }
      
      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines
      const lines = buffer.split("\n");
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || "";
      
      for (const line of lines) {
        // Remove carriage return if present
        const cleanLine = line.replace(/\r$/, "");
        
        // Empty line = dispatch event
        if (cleanLine === "") {
          if (currentEvent.event && dataLines.length > 0) {
            dispatchEvent(currentEvent, dataLines, onEvent);
          }
          // Reset for next event
          currentEvent = {};
          dataLines = [];
          continue;
        }
        
        // Ignore comments
        if (cleanLine.startsWith(":")) {
          continue;
        }
        
        // Parse field
        const colonIndex = cleanLine.indexOf(":");
        if (colonIndex === -1) {
          // Field with no value
          continue;
        }
        
        const field = cleanLine.slice(0, colonIndex);
        // Skip optional space after colon
        let value = cleanLine.slice(colonIndex + 1);
        if (value.startsWith(" ")) {
          value = value.slice(1);
        }
        
        switch (field) {
          case "event":
            currentEvent.event = value;
            break;
          case "data":
            dataLines.push(value);
            break;
          case "id":
            currentEvent.id = value;
            break;
          case "retry":
            {
              const retryMs = parseInt(value, 10);
              if (!isNaN(retryMs)) {
                currentEvent.retry = retryMs;
              }
            }
            break;
          default:
            // Ignore unknown fields
            break;
        }
      }
    }
  } catch (error) {
    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    } else {
      throw error;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Dispatch a complete SSE event
 */
function dispatchEvent(
  currentEvent: Partial<SSEEvent>,
  dataLines: string[],
  onEvent: SSEEventHandler
): void {
  if (!currentEvent.event) {
    return;
  }
  
  // Join multi-line data with newlines
  const data = dataLines.join("\n");
  
  const event: SSEEvent = {
    event: currentEvent.event,
    data,
    id: currentEvent.id,
    retry: currentEvent.retry,
  };
  
  onEvent(event);
}

/**
 * Parse JSON data from SSE event, with error handling
 * Accepts either an SSEEvent object or a raw data string
 */
export function parseSSEData<T = unknown>(eventOrData: SSEEvent | string): T | null {
  try {
    const dataString = typeof eventOrData === 'string' ? eventOrData : eventOrData.data;

    // Handle empty strings
    if (!dataString || dataString.trim() === '') {
      return null;
    }

    return JSON.parse(dataString) as T;
  } catch (error) {
    console.error('Failed to parse SSE data:', {
      error: error instanceof Error ? error.message : String(error),
      data: typeof eventOrData === 'string' ? eventOrData.slice(0, 100) : eventOrData.data?.slice(0, 100),
    });
    return null;
  }
}

