import { z } from "zod";
/** Aspect ratios supported by the deck */
export type AspectRatio = "16:9" | "4:3";
/** Named layout regions (grid areas) */
export type RegionName = "header" | "body" | "footer" | "aside";
/** Chart kinds supported by the universal builder/preview (others show placeholders) */
export type ChartKind = "bar" | "line" | "pie" | "doughnut" | "area" | "scatter" | "combo" | "waterfall" | "funnel";
/** Value formatting hints for charts */
export type ChartValueFormat = "number" | "percent" | "currency" | "auto";
/** Optional high-level design intent to influence layout/style heuristics */
export interface DesignSpec {
    pattern: "hero" | "split" | "asymmetric" | "grid" | "minimal" | "data-focused";
    whitespace?: {
        strategy: "generous" | "balanced" | "compact";
        /** Additional breathing room hint in inches (0–0.75 typical). */
        breathingRoom?: number;
    };
}
/** Title alignment options */
export type TitleAlign = "left" | "center" | "right";
/** Chart legend position options */
export type ChartLegend = "none" | "right" | "bottom";
/** Image fit options */
export type ImageFit = "cover" | "contain" | "fill";
/** Image role/purpose */
export type ImageRole = "hero" | "logo" | "illustration" | "icon" | "background";
/** Typography scale definition */
export interface TypographyScale {
    fonts: {
        sans: string;
        serif?: string;
        mono?: string;
    };
    sizes: {
        "step_-2": number;
        "step_-1": number;
        step_0: number;
        step_1: number;
        step_2: number;
        step_3: number;
    };
    weights: {
        regular: number;
        medium: number;
        semibold: number;
        bold: number;
    };
    lineHeights: {
        compact: number;
        standard: number;
    };
}
/** Style tokens for theming */
export interface StyleTokens {
    palette: {
        primary: string;
        accent: string;
        neutral: string[];
    };
    typography: TypographyScale;
    spacing: {
        base: number;
        steps: number[];
    };
    radii: {
        sm: number;
        md: number;
        lg: number;
    };
    shadows: {
        sm: string;
        md: string;
        lg: string;
    };
    contrast: {
        minTextContrast: number;
        minUiContrast: number;
    };
}
/**
 * Runtime palette sanitizer: ensures primary/accent are valid hex6,
 * and neutral is a 9-step scale (dark → light).
 */
export declare function safePalette(p: {
    primary?: string;
    accent?: string;
    neutral?: string[];
}): {
    primary: string;
    accent: string;
    neutral: string[];
};
export declare const SlideSpecZ: z.ZodObject<{
    meta: z.ZodObject<{
        version: z.ZodLiteral<"1.0">;
        locale: z.ZodString;
        theme: z.ZodString;
        aspectRatio: z.ZodEnum<{
            "16:9": "16:9";
            "4:3": "4:3";
        }>;
    }, z.core.$strip>;
    design: z.ZodOptional<z.ZodObject<{
        pattern: z.ZodEnum<{
            hero: "hero";
            split: "split";
            asymmetric: "asymmetric";
            grid: "grid";
            minimal: "minimal";
            "data-focused": "data-focused";
        }>;
        whitespace: z.ZodOptional<z.ZodObject<{
            strategy: z.ZodOptional<z.ZodEnum<{
                generous: "generous";
                balanced: "balanced";
                compact: "compact";
            }>>;
            breathingRoom: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    content: z.ZodObject<{
        title: z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, z.core.$strip>;
        subtitle: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, z.core.$strip>>;
        bullets: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            items: z.ZodArray<z.ZodObject<{
                text: z.ZodString;
                level: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
            }, z.core.$strip>>;
        }, z.core.$strip>>>;
        callouts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            text: z.ZodString;
            variant: z.ZodEnum<{
                success: "success";
                note: "note";
                warning: "warning";
                danger: "danger";
            }>;
            elevated: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>>;
        speakerNotes: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, z.core.$strip>>;
        table: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            headers: z.ZodArray<z.ZodString>;
            rows: z.ZodArray<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        dataViz: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodEnum<{
                bar: "bar";
                line: "line";
                pie: "pie";
                doughnut: "doughnut";
                area: "area";
                scatter: "scatter";
                combo: "combo";
                waterfall: "waterfall";
                funnel: "funnel";
            }>;
            title: z.ZodOptional<z.ZodString>;
            labels: z.ZodArray<z.ZodString>;
            series: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                values: z.ZodArray<z.ZodNumber>;
            }, z.core.$strip>>;
            valueFormat: z.ZodOptional<z.ZodEnum<{
                number: "number";
                percent: "percent";
                currency: "currency";
                auto: "auto";
            }>>;
        }, z.core.$strip>>;
        imagePlaceholders: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            role: z.ZodEnum<{
                hero: "hero";
                logo: "logo";
                illustration: "illustration";
                icon: "icon";
                background: "background";
            }>;
            alt: z.ZodString;
        }, z.core.$strip>>>;
        images: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            role: z.ZodEnum<{
                hero: "hero";
                logo: "logo";
                illustration: "illustration";
                icon: "icon";
                background: "background";
            }>;
            source: z.ZodObject<{
                type: z.ZodEnum<{
                    url: "url";
                    unsplash: "unsplash";
                    placeholder: "placeholder";
                }>;
                url: z.ZodOptional<z.ZodString>;
                query: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
            alt: z.ZodString;
            fit: z.ZodOptional<z.ZodEnum<{
                cover: "cover";
                contain: "contain";
                fill: "fill";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    layout: z.ZodObject<{
        grid: z.ZodObject<{
            rows: z.ZodNumber;
            cols: z.ZodNumber;
            gutter: z.ZodNumber;
            margin: z.ZodObject<{
                t: z.ZodNumber;
                r: z.ZodNumber;
                b: z.ZodNumber;
                l: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>;
        regions: z.ZodArray<z.ZodObject<{
            name: z.ZodEnum<{
                header: "header";
                body: "body";
                footer: "footer";
                aside: "aside";
            }>;
            rowStart: z.ZodNumber;
            colStart: z.ZodNumber;
            rowSpan: z.ZodNumber;
            colSpan: z.ZodNumber;
        }, z.core.$strip>>;
        anchors: z.ZodArray<z.ZodObject<{
            refId: z.ZodString;
            region: z.ZodEnum<{
                header: "header";
                body: "body";
                footer: "footer";
                aside: "aside";
            }>;
            order: z.ZodNumber;
            span: z.ZodOptional<z.ZodObject<{
                rows: z.ZodNumber;
                cols: z.ZodNumber;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    styleTokens: z.ZodObject<{
        palette: z.ZodObject<{
            primary: z.ZodString;
            accent: z.ZodString;
            neutral: z.ZodArray<z.ZodString>;
        }, z.core.$strip>;
        typography: z.ZodObject<{
            fonts: z.ZodObject<{
                sans: z.ZodString;
                serif: z.ZodOptional<z.ZodString>;
                mono: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
            sizes: z.ZodObject<{
                "step_-2": z.ZodNumber;
                "step_-1": z.ZodNumber;
                step_0: z.ZodNumber;
                step_1: z.ZodNumber;
                step_2: z.ZodNumber;
                step_3: z.ZodNumber;
            }, z.core.$strip>;
            weights: z.ZodObject<{
                regular: z.ZodNumber;
                medium: z.ZodNumber;
                semibold: z.ZodNumber;
                bold: z.ZodNumber;
            }, z.core.$strip>;
            lineHeights: z.ZodObject<{
                compact: z.ZodNumber;
                standard: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>;
        spacing: z.ZodObject<{
            base: z.ZodNumber;
            steps: z.ZodArray<z.ZodNumber>;
        }, z.core.$strip>;
        radii: z.ZodObject<{
            sm: z.ZodNumber;
            md: z.ZodNumber;
            lg: z.ZodNumber;
        }, z.core.$strip>;
        shadows: z.ZodObject<{
            sm: z.ZodString;
            md: z.ZodString;
            lg: z.ZodString;
        }, z.core.$strip>;
        contrast: z.ZodObject<{
            minTextContrast: z.ZodNumber;
            minUiContrast: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
    components: z.ZodOptional<z.ZodObject<{
        bulletList: z.ZodOptional<z.ZodObject<{
            variant: z.ZodOptional<z.ZodEnum<{
                compact: "compact";
                spacious: "spacious";
            }>>;
        }, z.core.$strip>>;
        callout: z.ZodOptional<z.ZodObject<{
            variant: z.ZodOptional<z.ZodEnum<{
                flat: "flat";
                elevated: "elevated";
            }>>;
        }, z.core.$strip>>;
        chart: z.ZodOptional<z.ZodObject<{
            legend: z.ZodOptional<z.ZodEnum<{
                right: "right";
                none: "none";
                bottom: "bottom";
            }>>;
            gridlines: z.ZodOptional<z.ZodBoolean>;
            dataLabels: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        image: z.ZodOptional<z.ZodObject<{
            fit: z.ZodOptional<z.ZodEnum<{
                cover: "cover";
                contain: "contain";
                fill: "fill";
            }>>;
        }, z.core.$strip>>;
        title: z.ZodOptional<z.ZodObject<{
            align: z.ZodOptional<z.ZodEnum<{
                left: "left";
                center: "center";
                right: "right";
            }>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/** Runtime type derived from the schema (authoritative). */
export type SlideSpec = z.infer<typeof SlideSpecZ>;
/** Convenience alias for import symmetry. */
export type SlideSpecV1 = SlideSpec;
/** CSS pixels per inch (96 dpi standard for web/screen rendering) */
export declare const PX_PER_IN = 96;
/** Recommended 9‑step neutral ramp (dark → light) */
export declare const DEFAULT_NEUTRAL_9: readonly string[];
/** Minimal, readable typography defaults */
export declare const DEFAULT_TYPOGRAPHY: Readonly<TypographyScale>;
/** Quick hex validator; accepts #RRGGBB (no alpha) */
export declare function isHex6(color: string | undefined | null): color is string;
/**
 * Normalize a palette defensively for preview usage.
 * - Ensures primary/accent are hex6 (applies tasteful defaults if not).
 * - Pads/fixes neutral to a 9‑step scale for consistent rendering.
 */
export declare function normalizePalette(p: SlideSpecV1["styleTokens"]["palette"]): {
    primary: string;
    accent: string;
    neutral: string[];
};
/**
 * Convert hex color to RGB tuple
 * @param hex - Hex color string (e.g., "#FF0000")
 * @returns [r, g, b] tuple with values 0-255
 */
export declare function hexToRgb(hex: string): [number, number, number];
/**
 * Convert RGB to hex color
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns Hex color string
 */
export declare function rgbToHex(r: number, g: number, b: number): string;
/**
 * Calculate relative luminance per WCAG 2.2
 * @param hex - Hex color string
 * @returns Luminance value (0-1)
 */
export declare function getLuminance(hex: string): number;
/**
 * Calculate contrast ratio per WCAG 2.2
 * @param hex1 - First hex color
 * @param hex2 - Second hex color
 * @returns Contrast ratio (1-21)
 */
export declare function contrastRatio(hex1: string, hex2: string): number;
/**
 * Validate hex color format
 * @param color - Color string to validate
 * @returns True if valid 6-digit hex
 */
export declare function isValidHex(color: string): boolean;
/**
 * Convert opacity (0-1) to PPTX transparency (0-100)
 * @param opacity - Opacity value (0-1)
 * @returns PPTX transparency value (0-100)
 */
export declare function opacityToTransparency(opacity: number): number;
/**
 * Convert PPTX transparency (0-100) to opacity (0-1)
 * @param transparency - PPTX transparency value (0-100)
 * @returns Opacity value (0-1)
 */
export declare function transparencyToOpacity(transparency: number): number;
/**
 * Add alpha transparency to hex color (for CSS/frontend use)
 * @param hex - Hex color string
 * @param alpha - Alpha value (0-1)
 * @returns Hex color with alpha (8-digit)
 */
export declare function hexWithAlpha(hex: string, alpha: number): string;
/**
 * Pixel to inch conversion (96 DPI standard)
 */
export declare const PX_PER_INCH = 96;
/**
 * Convert pixels to inches
 * @param px - Pixel value
 * @returns Inch value
 */
export declare function pxToIn(px: number): number;
/**
 * Convert inches to pixels
 * @param inches - Inch value
 * @returns Pixel value
 */
export declare function inToPx(inches: number): number;
/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export declare function truncateWithEllipsis(text: string, maxLength: number): string;
/**
 * Calculate optimal font size based on available space
 * @param text - Text to measure
 * @param maxWidth - Maximum width in pixels
 * @param baseFontSize - Base font size
 * @returns Optimal font size
 */
export declare function calculateOptimalFontSize(text: string, maxWidth: number, baseFontSize?: number): number;
/**
 * Map API errors to user-friendly messages
 * @param error - Error object or message
 * @returns User-friendly error message
 */
export declare function mapErrorToMessage(error: unknown): string;
/**
 * Calculate grid cell dimensions
 * @param totalWidth - Total width in inches
 * @param totalHeight - Total height in inches
 * @param cols - Number of columns
 * @param rows - Number of rows
 * @param gutter - Gutter size in inches
 * @param margin - Margin object {t, r, b, l} in inches
 * @returns Cell dimensions {width, height} in inches
 */
export declare function calculateCellDimensions(totalWidth: number, totalHeight: number, cols: number, rows: number, gutter: number, margin: {
    t: number;
    r: number;
    b: number;
    l: number;
}): {
    width: number;
    height: number;
};
/**
 * Calculate region position in grid
 * @param rowStart - Starting row (1-indexed)
 * @param colStart - Starting column (1-indexed)
 * @param rowSpan - Number of rows to span
 * @param colSpan - Number of columns to span
 * @param cellWidth - Width of each cell in inches
 * @param cellHeight - Height of each cell in inches
 * @param gutter - Gutter size in inches
 * @param margin - Margin object in inches
 * @returns Position {x, y, width, height} in inches
 */
export declare function calculateRegionPosition(rowStart: number, colStart: number, rowSpan: number, colSpan: number, cellWidth: number, cellHeight: number, gutter: number, margin: {
    t: number;
    r: number;
    b: number;
    l: number;
}): {
    x: number;
    y: number;
    width: number;
    height: number;
};
//# sourceMappingURL=index.d.ts.map