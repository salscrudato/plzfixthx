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
//# sourceMappingURL=index.d.ts.map