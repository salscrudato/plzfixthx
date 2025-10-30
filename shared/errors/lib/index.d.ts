/**
 * Shared Error Handling Module
 * ============================
 * Unified error types, classification, and utilities for frontend and backend.
 * Eliminates duplication between web/src/lib/errorHandler.ts and functions/src/errorHandler.ts
 */
export declare enum ErrorCode {
    BAD_REQUEST = "BAD_REQUEST",
    INVALID_PAYLOAD = "INVALID_PAYLOAD",
    PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
    RATE_LIMITED = "RATE_LIMITED",
    MODERATION_REJECTED = "MODERATION_REJECTED",
    ABUSE_DETECTED = "ABUSE_DETECTED",
    AUTH_ERROR = "AUTH_ERROR",
    AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
    AI_TIMEOUT = "AI_TIMEOUT",
    AI_VALIDATION_ERROR = "AI_VALIDATION_ERROR",
    PPTX_GENERATION_ERROR = "PPTX_GENERATION_ERROR",
    IMAGE_FETCH_ERROR = "IMAGE_FETCH_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    TIMEOUT_ERROR = "TIMEOUT_ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    SERVER_ERROR = "SERVER_ERROR",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
export interface AppError {
    code: ErrorCode;
    message: string;
    userMessage: string;
    statusCode?: number;
    details?: Record<string, unknown>;
    originalError?: Error;
}
export interface ErrorResponse {
    error: {
        code: ErrorCode;
        message: string;
        details?: Record<string, unknown>;
    };
    requestId?: string;
    retryAfter?: number;
}
export declare class AppErrorClass extends Error {
    code: ErrorCode;
    statusCode: number;
    details?: Record<string, unknown> | undefined;
    constructor(code: ErrorCode, message: string, statusCode?: number, details?: Record<string, unknown> | undefined);
}
/**
 * Map error code to HTTP status code
 */
export declare function getStatusCode(code: ErrorCode): number;
/**
 * Get user-friendly error message
 */
export declare function getUserMessage(code: ErrorCode): string;
/**
 * Classify an error and extract relevant information
 */
export declare function classifyError(error: unknown): AppError;
/**
 * Check if error is retryable
 */
export declare function isRetryableError(error: AppError): boolean;
