/**
 * Shared Utility Functions
 * ========================
 * Common utilities used across frontend and backend.
 * Eliminates duplication between functions/src/aiHelpers.ts and web/src/lib/errorHandler.ts
 */

/* -------------------------------------------------------------------------- */
/*                            Retry with Backoff                              */
/* -------------------------------------------------------------------------- */

/**
 * Retry a function with exponential backoff and jitter
 * Unified implementation used by both frontend and backend
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        // Exponential backoff with jitter
        const jitter = Math.floor(Math.random() * 300);
        const delay = Math.min(16000, baseDelayMs * Math.pow(2, attempt)) + jitter;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

