export type ColorTheme = 'dark' | 'light';
export type ColorSchool = 'otus-design' | 'otus-nature' | 'otus-tech' | 'otus-university';

export interface ColorOverride {
    readonly token: string;
    readonly theme: ColorTheme;
    readonly school: ColorSchool;
    readonly primitive: string;
}

export interface ColorPrimitive {
    readonly path: string;
    readonly value: string;
    readonly cssVariable: string;
}

export interface ColorTarget {
    readonly primitive: string;
    readonly value: string;
    readonly cssVariable: string;
    readonly opacity: number;
    readonly alias: string | null;
    readonly css: string;
    readonly reason: string;
}

export interface ColorRow {
    readonly tui: string;
    readonly category: string;
    readonly status: string;
    readonly variants: Record<
        ColorTheme,
        {
            readonly current: string;
            readonly inheritedFromLight: boolean;
            readonly schools: Record<ColorSchool, ColorTarget>;
        }
    >;
}

export interface ContrastCheck {
    readonly appearance: string;
    readonly theme: string;
    readonly school: string;
    readonly state: string;
    readonly backgroundToken: string;
    readonly foregroundToken: string;
    readonly ratio: number;
    readonly passes: boolean;
    readonly contextOverride: boolean;
    readonly effectiveBackground: string;
    readonly effectiveForeground: string;
}

export interface ColorMapping {
    readonly primitives: readonly ColorPrimitive[];
    readonly mappings: readonly ColorRow[];
    readonly schoolAssignments: readonly {
        readonly id: ColorSchool;
        readonly primary: string;
        readonly secondary: string;
    }[];
    readonly contextOverrides: readonly unknown[];
    readonly accessibility: {
        readonly passed: number;
        readonly failed: number;
        readonly checks: readonly ContrastCheck[];
    };
}

export function validateColorOverrides(mapping: ColorMapping, overrides: unknown): readonly ColorOverride[];
export function applyColorOverrides(mapping: ColorMapping, overrides: readonly ColorOverride[]): ColorMapping;
