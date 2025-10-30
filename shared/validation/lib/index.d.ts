/**
 * Shared Validation Schemas
 * =========================
 * Request/response validation schemas used by both frontend and backend.
 * Enables frontend pre-validation before sending requests.
 */
import { z } from "zod";
/**
 * Schema for slide generation requests
 */
export declare const GenerateSlideSpecRequestSchema: z.ZodObject<{
    prompt: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    requestId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GenerateSlideSpecRequest = z.infer<typeof GenerateSlideSpecRequestSchema>;
/**
 * Schema for PPTX export requests
 */
export declare const ExportPPTXRequestSchema: z.ZodObject<{
    spec: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    filename: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ExportPPTXRequest = z.infer<typeof ExportPPTXRequestSchema>;
/**
 * Schema for PNG export requests
 */
export declare const ExportPNGRequestSchema: z.ZodObject<{
    spec: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    filename: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ExportPNGRequest = z.infer<typeof ExportPNGRequestSchema>;
/**
 * Schema for PDF export requests
 */
export declare const ExportPDFRequestSchema: z.ZodObject<{
    spec: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    filename: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ExportPDFRequest = z.infer<typeof ExportPDFRequestSchema>;
/**
 * Validate and parse request body
 */
export declare function validateRequest<T>(data: unknown, schema: z.ZodSchema<T>, context: string): T;
/**
 * Validate hex color
 */
export declare function isValidHexColor(color: string): boolean;
/**
 * Validate email
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validate URL
 */
export declare function isValidUrl(url: string): boolean;
export declare const ValidationMessages: {
    readonly PROMPT_EMPTY: "Prompt cannot be empty";
    readonly PROMPT_TOO_LONG: "Prompt exceeds maximum length (5000 characters)";
    readonly INVALID_SPEC: "Invalid slide specification";
    readonly INVALID_COLOR: "Invalid color format";
    readonly INVALID_EMAIL: "Invalid email address";
    readonly INVALID_URL: "Invalid URL";
    readonly INVALID_FILENAME: "Invalid filename";
    readonly MISSING_REQUIRED_FIELD: (field: string) => string;
    readonly INVALID_FIELD_TYPE: (field: string, expected: string) => string;
};
