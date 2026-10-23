import {readFile} from 'node:fs/promises';
import path from 'node:path';

import {contrastAudit} from './otus-color-contrast.mjs';
import {applyColorOverrides} from './otus-color-overrides.mjs';

export async function colorMapping(root) {
    const palettePath = 'projects/styles/tokens/otus-global-colors.json';
    const themePath = 'projects/styles/mixins/theme/palette.less';
    const palette = JSON.parse(await readFile(path.join(root, palettePath), 'utf8'));
    const source = await readFile(path.join(root, themePath), 'utf8');
    const primitives = [];

    function visit(value, parts = []) {
        if (value.$type === 'color') {
            primitives.push({
                path: parts.join('/'),
                value: value.$value.hex,
                cssVariable: `--otus-color-${parts.join('-').replaceAll(' (base)', '')}`,
            });
        } else {
            for (const [key, child] of Object.entries(value)) {
                if (!key.startsWith('$') && typeof child === 'object' && child) {
                    visit(child, [...parts, key]);
                }
            }
        }
    }

    visit(palette);

    function pick(group, step) {
        const token = primitives.find(
            (item) =>
                item.path.startsWith(`${group}/`) &&
                item.path.split('/').at(-1).replaceAll(' (base)', '').endsWith(`-${step}`),
        );

        if (!token) {
            throw new Error(`Missing OTUS color: ${group}/${step}`);
        }

        return token;
    }

    function contrastText(color) {
        const linear = color.match(/[a-f\d]{2}/gi).map((hex) => {
            const channel = Number.parseInt(hex, 16) / 255;

            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;

        return luminance < 0.179 ? '00' : '950';
    }

    function statusStep(tui, theme, state, color) {
        const baseStep = {light: '600', dark: '400'}[theme];

        if (tui.includes('-pale')) {
            return baseStep;
        }

        if (!tui.startsWith('--tui-text-')) {
            return {green: '700', yellow: '700', blue: '600'}[color] ?? baseStep;
        }

        const darkSteps =
            color === 'green'
                ? {default: '300', hover: '400', pressed: '300'}
                : {default: '400', hover: '300', pressed: '400'};

        return {light: {default: '800', hover: '700', pressed: '800'}, dark: darkSteps}[theme][state];
    }

    const schools = [
        {
            id: 'otus-university',
            primary: 'graphite-black-925',
            secondary: 'expert-blue',
            accent: 'brand/expert-blue',
            accentDefault: '700',
            accentHover: '600',
            accentPressed: '800',
        },
        {
            id: 'otus-tech',
            primary: 'graphite-black-925',
            secondary: 'sure-blue',
            accent: 'brand/sure-blue',
            accentDefault: '400',
            accentHover: '300',
            accentPressed: '500',
        },
        {
            id: 'otus-design',
            primary: 'graphite-black-925',
            secondary: 'care-violet',
            accent: 'brand/care-violet',
            accentDefault: '400',
            accentHover: '300',
            accentPressed: '500',
        },
        {
            id: 'otus-nature',
            primary: 'graphite-black-925',
            secondary: 'education-green',
            accent: 'brand/education-green',
            accentDefault: '400',
            accentHover: '300',
            accentPressed: '500',
        },
    ];
    const current = {};

    for (const theme of ['light', 'dark']) {
        const body = source.match(new RegExp(String.raw`\.tui-theme-${theme}\(\) \{([\s\S]*?)\n\}`))[1];

        current[theme] = Object.fromEntries(
            [...body.matchAll(/(--tui-[\w-]+):([^;]+);/g)]
                .filter((match) => !match[1].includes('shadow'))
                .map((match) => [match[1], match[2].trim()]),
        );
    }

    const names = [...new Set([...Object.keys(current.light), ...Object.keys(current.dark)])].sort();
    const mappings = names.map((tui) => {
        const variants = {};

        for (const theme of ['light', 'dark']) {
            const original = current[theme][tui] ?? current.light[tui];
            const inherited = theme === 'dark' && !(tui in current.dark);

            variants[theme] = {current: original, inheritedFromLight: inherited, schools: {}};

            for (const school of schools) {
                const dark = theme === 'dark';
                const hover = tui.endsWith('-hover');
                const pressed = tui.endsWith('-pressed');
                const state = ['default', 'hover', 'pressed'][Number(hover) + Number(pressed) * 2];
                let group = 'graphite-black';
                let step = dark ? '00' : '950';
                let opacity = 1;
                let reason = 'Нейтральная семантическая роль; общая для школ.';
                let alias = null;
                const alpha = original.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);

                if (/background-neutral|border-|service-backdrop/.test(tui)) {
                    opacity = alpha ? Number(alpha[1]) : 1;
                    reason = 'Нейтральный OTUS + исходная прозрачность TUI.';

                    if (tui.includes('service-backdrop')) {
                        step = '950';
                        reason = 'Затемняющая подложка остаётся тёмной в обеих темах; прозрачность сохранена.';
                    }
                } else if (/accent-[12]|text-action/.test(tui)) {
                    const schoolAccent = tui.includes('accent-2');

                    group = 'graphite-black';
                    step = {
                        light: {default: '925', hover: '850', pressed: '950'},
                        dark: {default: '50', hover: '00', pressed: '100'},
                    }[theme][state];
                    reason =
                        'Общий primary и действия: graphite-black-925 для всех школ. Светлая инверсия в тёмной теме сохраняет нейтральную роль Taiga.';

                    if (schoolAccent) {
                        group = school.accent;
                        step = {
                            default: school.accentDefault,
                            hover: school.accentHover,
                            pressed: school.accentPressed,
                        }[state];
                        reason =
                            'Школьный акцент: hover светлее, pressed темнее базового, как в Taiga. Ступени подобраны для контраста текста ≥ 4.5:1 во всех трёх состояниях.';
                    }

                    if (tui.includes('on-accent')) {
                        const background = pick(group, step);

                        group = 'graphite-black';
                        step = contrastText(background.value);
                        reason =
                            'Контрастный текст к акцентному фону. Нейтральный primary имеет общий цвет текста для всех школ.';
                    }
                } else if (/status-|text-positive|text-negative|service-autofill|service-selection/.test(tui)) {
                    const status = [
                        [/negative/, 'red'],
                        [/positive/, 'green'],
                        [/warning|autofill/, 'yellow'],
                        [/info|selection/, 'blue'],
                    ].find(([pattern]) => pattern.test(tui));

                    step = '500';

                    if (status) {
                        group = `service/${status[1]}`;
                        step = statusStep(tui, theme, state, status[1]);
                    }

                    if (tui.includes('autofill')) {
                        step = dark ? '950' : '100';
                    }

                    opacity = alpha ? Number(alpha[1]) : 1;
                    reason = 'Статус берётся из service; одинаков во всех школах. Прозрачность сохранена.';
                } else if (tui.includes('chart-categorical')) {
                    const index = Number(tui.slice(-2));

                    if (index === 0) {
                        group = 'graphite-black';
                        step = dark ? '50' : '925';
                        alias = '--tui-background-accent-1';
                        reason = 'Сохранена исходная связь первой серии с основным акцентом.';
                    } else {
                        const support = Object.keys(palette.support);

                        group = `support/${support[(index - 1) % support.length]}`;
                        step = index > support.length ? '300' : '600';
                        reason = 'Черновое распределение серий по support; различимость графиков нужно проверить.';
                    }
                } else if (/background-base|background-elevation/.test(tui)) {
                    const surface = [
                        [/base$/, '950'],
                        [/base-alt$|elevation-1$/, '925'],
                        [/elevation-2$/, '900'],
                        [/elevation-3$/, '875'],
                    ].find(([pattern]) => pattern.test(tui));

                    step = tui.endsWith('base-alt') ? '25' : '00';

                    if (dark) {
                        step = surface[1];
                    }
                } else if (tui.includes('accent-opposite')) {
                    step = {
                        light: {default: '950', hover: '750', pressed: '500'},
                        dark: {default: '00', hover: '25', pressed: '50'},
                    }[theme][state];
                } else if (tui.includes('text-')) {
                    const textRole = ['secondary', 'tertiary'].find((role) => tui.includes(role)) ?? 'primary';

                    step = {
                        light: {primary: '900', secondary: '600', tertiary: '450'},
                        dark: {primary: '00', secondary: '200', tertiary: '350'},
                    }[theme][textRole];
                }

                const primitive = pick(group, step);
                let css = `var(${primitive.cssVariable})`;

                if (opacity !== 1) {
                    css = `color-mix(in srgb, var(${primitive.cssVariable}) ${Number((opacity * 100).toFixed(4))}%, transparent)`;
                }

                if (alias) {
                    css = `var(${alias})`;
                }

                variants[theme].schools[school.id] = {
                    primitive: primitive.path,
                    cssVariable: primitive.cssVariable,
                    value: primitive.value,
                    opacity,
                    alias,
                    css,
                    reason,
                };
            }
        }

        return {
            tui,
            otus: tui.replace('--tui-', '--otus-'),
            category: tui.split('-')[3],
            status: 'experimental',
            variants,
        };
    });

    const negativeChecked = pick('service/red', '700');
    const contextOverrides = [
        {
            appearance: 'negative-checked',
            theme: 'dark',
            schools: 'all',
            selector:
                "[tuiAppearance][data-appearance='negative']:is(:checked:not([data-mode]), [data-mode~='checked'])",
            token: '--tui-status-negative',
            primitive: negativeChecked.path,
            cssVariable: negativeChecked.cssVariable,
            value: negativeChecked.value,
            opacity: 1,
            css: `var(${negativeChecked.cssVariable})`,
            reason: 'Taiga uses hardcoded white text in checked negative, but dark primary-invalid uses the same fill with dark on-accent text. Override the existing fill token only in checked negative; no Taiga role or component change.',
        },
    ];

    const mapping = {
        schemaVersion: 1,
        status: 'experimental',
        appliedToRuntime: true,
        scope: 'Project-defined TUI semantic colors, including chart series. Upstream-only and legacy tokens are not included.',
        integration: {
            layer: 'override',
            base: 'Taiga UI',
            architectureChanges: false,
            componentChanges: false,
            tokenNames: 'Existing --tui-* names are preserved.',
            entryPoint: '@taiga-ui/styles/taiga-ui-theme.less',
            scopedEntryPoint: '@taiga-ui/styles/mixins/theme.less (.taiga-ui-theme())',
            defaultSchool: 'otus-university',
            attributes: {school: 'data-brand', theme: 'tuiTheme'},
        },
        sources: {taiga: themePath, otus: palettePath},
        contextReferences: [
            {
                url: 'https://www.figma.com/design/qlF1Gy0U6tStKSHpRR2mfz/?node-id=19-26',
                purpose: 'Context only. Not a source of color values or new primitives.',
            },
        ],
        webPolicy: {
            primary:
                'Shared graphite-black-925 #131315 in light; graphite-black-50 #E9EAEA in dark. Hover is lighter and pressed is darker, as in current Taiga.',
            schoolAccent: '--tui-background-accent-2',
            actions: 'Neutral and shared by all schools.',
            states: 'Hover/pressed are draft web adaptations; communication colors alone do not define UI states.',
        },
        schoolAssignments: schools.map((school) => ({
            ...school,
            status: 'experimental',
            webMappingStatus: 'experimental',
        })),
        modes: {
            schools: schools.map((school) => school.id),
            themes: ['light', 'dark'],
            directions: ['otus-core', 'otus-brand'],
            directionPolicy: 'The draft color mapping is shared by core and brand.',
        },
        principle: [
            'OTUS is an override layer over Taiga. Existing TUI roles, state selectors, component styles and var(--tui-*) references stay intact; only variable values are changed by this override layer.',
            'The shared theme declares primitives using primitives[].cssVariable and primitives[].value. These OTUS color CSS names are declared in the library theme.',
            'For each theme and school, use mappings[].variants[theme].schools[school].css as the TUI variable value.',
            'Then apply contextOverrides inside their theme: on the existing Taiga state selector, override only the listed existing TUI token. The accessibility report includes these scoped overrides.',
            'All primitive names and values come exclusively from Otus global colors. Figma guides provide context only. Primary is shared neutral; school palette differences use the existing accent-2 role.',
            'Apply theme and school selectors at the same scope as the TUI aliases. Do not rely on inherited aliases being recomputed in a descendant.',
            'Current values are source declarations. Dark values marked inheritedFromLight have no project dark override. Validate contrast, alpha compositing and chart distinction before adoption.',
        ],
        example: {
            selector: '[data-brand="otus-university"][tuiTheme="light"]',
            declarations: {
                '--tui-background-accent-1': 'var(--otus-background-accent-1)',
                '--tui-background-accent-2': 'var(--otus-background-accent-2)',
            },
        },
        primitives,
        mappings,
        contextOverrides,
        accessibility: contrastAudit(mappings, schools, contextOverrides),
    };
    const configuration = JSON.parse(
        await readFile(path.join(root, 'projects/styles/tokens/otus-color-overrides.json'), 'utf8'),
    );

    return applyColorOverrides(mapping, configuration.overrides);
}
