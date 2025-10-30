/**
 * Shared Utility Functions
 * ========================
 * Common utilities used across frontend and backend.
 * Eliminates duplication between functions/src/aiHelpers.ts and web/src/lib/errorHandler.ts
 */
/**
 * Retry a function with exponential backoff and jitter
 * Unified implementation used by both frontend and backend
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelayMs?: number): Promise<T>;
