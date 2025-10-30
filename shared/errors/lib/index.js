/**
 * Shared Error Handling Module
 * ============================
 * Unified error types, classification, and utilities for frontend and backend.
 * Eliminates duplication between web/src/lib/errorHandler.ts and functions/src/errorHandler.ts
 */
/* -------------------------------------------------------------------------- */
/*                            Error Codes                                     */
/* -------------------------------------------------------------------------- */
export var ErrorCode;
(function (ErrorCode) {
    // Client errors (4xx)
    ErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCode["INVALID_PAYLOAD"] = "INVALID_PAYLOAD";
    ErrorCode["PAYLOAD_TOO_LARGE"] = "PAYLOAD_TOO_LARGE";
    ErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    ErrorCode["MODERATION_REJECTED"] = "MODERATION_REJECTED";
    ErrorCode["ABUSE_DETECTED"] = "ABUSE_DETECTED";
    ErrorCode["AUTH_ERROR"] = "AUTH_ERROR";
    // Server errors (5xx)
    ErrorCode["AI_SERVICE_ERROR"] = "AI_SERVICE_ERROR";
    ErrorCode["AI_TIMEOUT"] = "AI_TIMEOUT";
    ErrorCode["AI_VALIDATION_ERROR"] = "AI_VALIDATION_ERROR";
    ErrorCode["PPTX_GENERATION_ERROR"] = "PPTX_GENERATION_ERROR";
    ErrorCode["IMAGE_FETCH_ERROR"] = "IMAGE_FETCH_ERROR";
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["SERVER_ERROR"] = "SERVER_ERROR";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(ErrorCode || (ErrorCode = {}));
/* -------------------------------------------------------------------------- */
/*                            Error Class                                     */
/* -------------------------------------------------------------------------- */
export class AppErrorClass extends Error {
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = "AppError";
    }
}
/* -------------------------------------------------------------------------- */
/*                            Error Mapping                                   */
/* -------------------------------------------------------------------------- */
/**
 * Map error code to HTTP status code
 */
export function getStatusCode(code) {
    const statusMap = {
        [ErrorCode.BAD_REQUEST]: 400,
        [ErrorCode.INVALID_PAYLOAD]: 400,
        [ErrorCode.PAYLOAD_TOO_LARGE]: 413,
        [ErrorCode.RATE_LIMITED]: 429,
        [ErrorCode.MODERATION_REJECTED]: 400,
        [ErrorCode.ABUSE_DETECTED]: 400,
        [ErrorCode.AUTH_ERROR]: 401,
        [ErrorCode.AI_SERVICE_ERROR]: 502,
        [ErrorCode.AI_TIMEOUT]: 504,
        [ErrorCode.AI_VALIDATION_ERROR]: 400,
        [ErrorCode.PPTX_GENERATION_ERROR]: 500,
        [ErrorCode.IMAGE_FETCH_ERROR]: 500,
        [ErrorCode.NETWORK_ERROR]: 503,
        [ErrorCode.TIMEOUT_ERROR]: 504,
        [ErrorCode.VALIDATION_ERROR]: 400,
        [ErrorCode.SERVER_ERROR]: 500,
        [ErrorCode.INTERNAL_ERROR]: 500,
        [ErrorCode.UNKNOWN_ERROR]: 500,
    };
    return statusMap[code] || 500;
}
/**
 * Get user-friendly error message
 */
export function getUserMessage(code) {
    const messages = {
        [ErrorCode.BAD_REQUEST]: "Invalid request",
        [ErrorCode.INVALID_PAYLOAD]: "Request payload is invalid",
        [ErrorCode.PAYLOAD_TOO_LARGE]: "Request is too large",
        [ErrorCode.RATE_LIMITED]: "Too many requests, please try again later",
        [ErrorCode.MODERATION_REJECTED]: "Content does not meet safety guidelines",
        [ErrorCode.ABUSE_DETECTED]: "Request flagged as abusive",
        [ErrorCode.AUTH_ERROR]: "Authentication failed. Please refresh and try again.",
        [ErrorCode.AI_SERVICE_ERROR]: "AI service temporarily unavailable",
        [ErrorCode.AI_TIMEOUT]: "Request took too long, please try again",
        [ErrorCode.AI_VALIDATION_ERROR]: "Generated content failed validation",
        [ErrorCode.PPTX_GENERATION_ERROR]: "Failed to generate PowerPoint",
        [ErrorCode.IMAGE_FETCH_ERROR]: "Failed to fetch image",
        [ErrorCode.NETWORK_ERROR]: "Network error. Please check your connection.",
        [ErrorCode.TIMEOUT_ERROR]: "Request timed out. Please try again.",
        [ErrorCode.VALIDATION_ERROR]: "Invalid input. Please check your data and try again.",
        [ErrorCode.SERVER_ERROR]: "Server error. Please try again later.",
        [ErrorCode.INTERNAL_ERROR]: "Internal server error",
        [ErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again.",
    };
    return messages[code] || "An error occurred";
}
/* -------------------------------------------------------------------------- */
/*                            Error Classification                            */
/* -------------------------------------------------------------------------- */
/**
 * Classify an error and extract relevant information
 */
export function classifyError(error) {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        // Timeout errors
        if (message.includes("timeout") || message.includes("abort")) {
            return {
                code: ErrorCode.TIMEOUT_ERROR,
                message: error.message,
                userMessage: getUserMessage(ErrorCode.TIMEOUT_ERROR),
                statusCode: 504,
                originalError: error,
            };
        }
        // Network errors
        if (message.includes("network") ||
            message.includes("fetch") ||
            message.includes("econnrefused") ||
            message.includes("enotfound")) {
            return {
                code: ErrorCode.NETWORK_ERROR,
                message: error.message,
                userMessage: getUserMessage(ErrorCode.NETWORK_ERROR),
                statusCode: 503,
                originalError: error,
            };
        }
        // Auth errors
        if (message.includes("401") || message.includes("unauthorized")) {
            return {
                code: ErrorCode.AUTH_ERROR,
                message: error.message,
                userMessage: getUserMessage(ErrorCode.AUTH_ERROR),
                statusCode: 401,
                originalError: error,
            };
        }
        // Rate limit errors
        if (message.includes("429") || message.includes("rate limit")) {
            return {
                code: ErrorCode.RATE_LIMITED,
                message: error.message,
                userMessage: getUserMessage(ErrorCode.RATE_LIMITED),
                statusCode: 429,
                originalError: error,
            };
        }
        // Validation errors
        if (message.includes("validation") || message.includes("invalid")) {
            return {
                code: ErrorCode.VALIDATION_ERROR,
                message: error.message,
                userMessage: getUserMessage(ErrorCode.VALIDATION_ERROR),
                statusCode: 400,
                originalError: error,
            };
        }
        // Server errors
        if (message.includes("500") || message.includes("server")) {
            return {
                code: ErrorCode.SERVER_ERROR,
                message: error.message,
                userMessage: getUserMessage(ErrorCode.SERVER_ERROR),
                statusCode: 500,
                originalError: error,
            };
        }
        // Generic error
        return {
            code: ErrorCode.UNKNOWN_ERROR,
            message: error.message,
            userMessage: getUserMessage(ErrorCode.UNKNOWN_ERROR),
            statusCode: 500,
            originalError: error,
        };
    }
    return {
        code: ErrorCode.UNKNOWN_ERROR,
        message: String(error),
        userMessage: getUserMessage(ErrorCode.UNKNOWN_ERROR),
        statusCode: 500,
    };
}
/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
    return (error.code === ErrorCode.NETWORK_ERROR ||
        error.code === ErrorCode.TIMEOUT_ERROR ||
        error.code === ErrorCode.RATE_LIMITED ||
        error.code === ErrorCode.SERVER_ERROR ||
        error.code === ErrorCode.AI_SERVICE_ERROR ||
        error.code === ErrorCode.AI_TIMEOUT);
}
