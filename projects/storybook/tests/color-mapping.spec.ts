import {readFile} from 'node:fs/promises';

import {expect, test} from '@playwright/test';

import {OTUS_COLOR_MAPPING} from '../src/generated/catalog';

const story =
    '/iframe.html?id=documentation-styles-colors-taiga-to-otus-mapping--table&viewMode=story';

test('draft mapping compares schools and follows Storybook theme and school', async ({
    page,
}) => {
    await page.goto(`${story}&globals=theme:light;brand:otus-tech;direction:otus-brand`);
    await expect(
        page.locator('otus-color-mapping .t-mapping-table tbody tr'),
    ).toHaveCount(OTUS_COLOR_MAPPING.mappings.length);
    await page.getByRole('searchbox').fill('--tui-background-accent-1');
    await expect(
        page.locator('otus-color-mapping .t-mapping-table tbody tr'),
    ).toHaveCount(4);
    const row = page.locator('[data-token="--tui-background-accent-1"]');

    await expect(row.locator('td')).toHaveCount(4);
    await page.getByRole('searchbox').fill('#141414');
    await expect(row).toBeVisible();
    await expect(row.locator('[data-school="otus-tech"]')).toHaveClass('t-selected');
    await expect(row.locator('[data-school="otus-university"]')).toContainText(
        'graphite-black-925',
    );
    await expect(row.locator('[data-school="otus-nature"]')).toContainText(
        'graphite-black-925',
    );
    await page.goto(`${story}&globals=theme:dark;brand:otus-nature`);
    await expect(row.locator('[data-school="otus-nature"]')).toHaveClass('t-selected');
    await expect(row.locator('[data-school="otus-university"]')).toContainText(
        'graphite-black-50',
    );
    await page.getByRole('searchbox').fill('no-such-color');
    await expect(page.locator('otus-color-mapping .t-mapping-table tbody')).toContainText(
        'Ничего не найдено',
    );
});

test('JSON download is complete and preserves primitive references and CSS aliases', async ({
    page,
}) => {
    await page.goto(story);
    await page.getByRole('searchbox').fill('--tui-text-primary');
    const downloaded = page.waitForEvent('download');

    await page.getByRole('button', {name: 'Скачать JSON'}).click();
    const download = await downloaded;

    expect(download.suggestedFilename()).toBe('otus-taiga-color-mapping.json');
    const file = await download.path();

    expect(file).not.toBeNull();
    const exported: typeof OTUS_COLOR_MAPPING = JSON.parse(await readFile(file, 'utf8'));

    expect(exported).toEqual(OTUS_COLOR_MAPPING);
    expect(exported.appliedToRuntime).toBe(true);
    expect(exported.schoolAssignments).toHaveLength(4);
    const backdrop = exported.mappings.find(
        (row) => row.tui === '--tui-service-backdrop',
    );

    expect(backdrop?.variants.dark.schools['otus-tech'].value).toBe('#0A0A0B');
    expect(backdrop?.variants.dark.schools['otus-tech'].opacity).toBe(0.75);

    for (const row of exported.mappings) {
        expect(row.status).toBe('experimental');

        for (const theme of ['light', 'dark'] as const) {
            for (const school of exported.schoolAssignments) {
                const target = row.variants[theme].schools[school.id];
                const primitive = exported.primitives.find(
                    (item) => item.path === target.primitive,
                );

                expect(primitive?.value).toBe(target.value);
                expect(primitive?.cssVariable).toBe(target.cssVariable);
                expect(target.opacity).toBeGreaterThanOrEqual(0);
                expect(target.opacity).toBeLessThanOrEqual(1);
                expect(target.css).toContain(
                    `var(${target.alias ?? target.cssVariable})`,
                );
            }
        }
    }
});

test('mapping table contains its overflow at mobile width', async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto(story);
    await expect(
        page.locator('otus-color-mapping .t-mapping-table tbody tr'),
    ).toHaveCount(OTUS_COLOR_MAPPING.mappings.length);
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
    ).toBe(true);
    await page.getByLabel('Группа', {exact: true}).selectOption('status');
    const rows = await page
        .locator('otus-color-mapping .t-mapping-table tbody tr')
        .allTextContents();

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.includes('--tui-status-'))).toBe(true);
});

test('UI primary stays neutral while school accents use existing OTUS palette colors', () => {
    const primary = OTUS_COLOR_MAPPING.mappings.find(
        (row) => row.tui === '--tui-background-accent-1',
    )!;

    const action = OTUS_COLOR_MAPPING.mappings.find(
        (row) => row.tui === '--tui-text-action',
    )!;

    const accent = OTUS_COLOR_MAPPING.mappings.find(
        (row) => row.tui === '--tui-background-accent-2',
    )!;

    const accents = {
        'otus-university': '#521EE3',
        'otus-tech': '#2CB9FF',
        'otus-design': '#BE84FC',
        'otus-nature': '#2DFB90',
    };

    for (const school of OTUS_COLOR_MAPPING.schoolAssignments) {
        expect(primary.variants.light.schools[school.id].value).toBe('#131315');
        expect(action.variants.light.schools[school.id].value).toBe('#131315');
        expect(primary.variants.dark.schools[school.id].value).toBe('#E9EAEA');
        expect(accent.variants.light.schools[school.id].value).toBe(accents[school.id]);
    }
});

test('mapping primitives come exclusively from the existing Otus global colors palette', async () => {
    const source = await readFile(
        'projects/styles/tokens/otus-global-colors.json',
        'utf8',
    );

    const palette = Array.from(
        source.matchAll(/"hex":\s*"(#[0-9A-Fa-f]+)"/g),
        (match) => match[1],
    );

    expect(OTUS_COLOR_MAPPING.primitives).toHaveLength(palette.length);
    expect(
        OTUS_COLOR_MAPPING.primitives.every((token) => palette.includes(token.value)),
    ).toBe(true);
    expect(
        OTUS_COLOR_MAPPING.primitives.some((token) =>
            token.path.startsWith('brand-guide/'),
        ),
    ).toBe(false);
});

test('all interaction states preserve Taiga lightness direction for every school and theme', () => {
    function rgb(color: string): number[] {
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            const channels =
                hex.length === 3
                    ? Array.from(hex, (digit) => `${digit}${digit}`)
                    : hex.match(/../g)!;

            return [...channels.map((channel) => Number.parseInt(channel, 16)), 1];
        }

        const channels = color.match(/[\d.]+/g)!.map(Number);

        return [...channels.slice(0, 3), channels[3] ?? 1];
    }

    function luminance(color: string, background: string, opacity = 1): number {
        const [red, green, blue, alpha] = rgb(color);
        const base = rgb(background);
        const effectiveAlpha = alpha! * opacity;

        return [red!, green!, blue!].reduce((total, channel, index) => {
            const value =
                (channel * effectiveAlpha + base[index]! * (1 - effectiveAlpha)) / 255;

            const linear =
                value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

            return total + linear * [0.2126, 0.7152, 0.0722][index]!;
        }, 0);
    }

    const mismatches: string[] = [];
    const background = OTUS_COLOR_MAPPING.mappings.find(
        (row) => row.tui === '--tui-background-base',
    )!;

    for (const state of OTUS_COLOR_MAPPING.mappings.filter((row) =>
        /-(?:hover|pressed)$/.test(row.tui),
    )) {
        const normal = OTUS_COLOR_MAPPING.mappings.find(
            (row) =>
                row.tui ===
                (state.tui === '--tui-border-hover'
                    ? '--tui-border-normal'
                    : state.tui.replace(/-(?:hover|pressed)$/, '')),
        )!;

        for (const theme of ['light', 'dark'] as const) {
            const sourceBase = background.variants[theme].current;
            const sourceDelta =
                luminance(state.variants[theme].current, sourceBase) -
                luminance(normal.variants[theme].current, sourceBase);

            for (const school of OTUS_COLOR_MAPPING.schoolAssignments) {
                const normalTarget = normal.variants[theme].schools[school.id];
                const stateTarget = state.variants[theme].schools[school.id];
                const targetBase = background.variants[theme].schools[school.id].value;
                const targetDelta =
                    luminance(stateTarget.value, targetBase, stateTarget.opacity) -
                    luminance(normalTarget.value, targetBase, normalTarget.opacity);

                if (Math.sign(sourceDelta) !== Math.sign(targetDelta)) {
                    mismatches.push(`${theme} / ${school.id} / ${state.tui}`);
                }
            }
        }
    }

    expect(mismatches).toEqual([]);
});

test('library aliases match exported Taiga button colors and AA contrast in each state', async ({
    page,
}) => {
    for (const theme of ['light', 'dark'] as const) {
        await page.goto(`${story}&globals=theme:${theme}`);
        await expect(page.locator('otus-color-mapping')).toBeVisible();

        for (const school of OTUS_COLOR_MAPPING.schoolAssignments) {
            await page
                .locator('tui-root')
                .evaluate(
                    (root, brand) => root.setAttribute('data-brand', brand),
                    school.id,
                );
            const expected = OTUS_COLOR_MAPPING.accessibility.checks.filter(
                (check) =>
                    check.school === school.id &&
                    check.theme === theme &&
                    [
                        'accent',
                        'floating',
                        'negative-checked',
                        'primary',
                        'primary-grayscale',
                        'primary-invalid',
                    ].includes(check.appearance),
            );

            const actual = await page.locator('tui-root').evaluate((root, checks) => {
                const wrapper = document.createElement('div');

                wrapper.setAttribute('data-tui-version', '5.27.0');
                root.append(wrapper);
                const results = checks.map((check) => {
                    const button = document.createElement('button');

                    button.setAttribute('tuiButton', '');
                    button.setAttribute('tuiAppearance', '');
                    button.setAttribute('data-tui-version', '5.27.0');
                    button.setAttribute(
                        'data-appearance',
                        check.appearance.replace(/-(?:invalid|checked)$/, ''),
                    );
                    button.setAttribute(
                        'data-state',
                        {default: '', hover: 'hover', pressed: 'active'}[check.state],
                    );

                    if (check.appearance.endsWith('-checked')) {
                        button.setAttribute('data-mode', 'checked');
                    }

                    if (check.appearance.endsWith('-invalid')) {
                        button.setAttribute('data-mode', 'invalid');
                    }

                    button.style.transition = 'none';
                    button.textContent = 'Контраст';
                    wrapper.append(button);
                    const styles = getComputedStyle(button);
                    const result = {
                        foreground: styles.color.match(/[\d.]+/g)!.map(Number),
                        background: styles.backgroundColor.match(/[\d.]+/g)!.map(Number),
                    };

                    button.remove();

                    return result;
                });

                wrapper.remove();

                return results;
            }, expected);

            for (const [index, result] of actual.entries()) {
                expect(result.foreground).toEqual(
                    expected[index]!.effectiveForeground.match(/[\d.]+/g)!.map(Number),
                );
                expect(result.background).toEqual(
                    expected[index]!.effectiveBackground.match(/[\d.]+/g)!.map(Number),
                );
                expect(expected[index]!.ratio).toBeGreaterThanOrEqual(4.5);
            }
        }
    }
});

test('contrast report includes every theme, school and state without rounding verdicts', () => {
    const audit = OTUS_COLOR_MAPPING.accessibility;

    expect(audit.checks).toHaveLength(360);
    expect(audit.failed).toBe(0);
    expect(
        audit.checks.every((check) => check.passes && check.ratio >= check.minimum),
    ).toBe(true);
    expect(audit.checks.some((check) => check.contextOverride)).toBe(true);
    expect(audit.exclusions).toContain(
        'Disabled controls are excluded. Ratios use unrounded sRGB values; display rounding never changes pass/fail.',
    );
});

test('contrast details show measured ratios and can filter violations', async ({
    page,
}) => {
    await page.goto(story);
    await page
        .getByText('Контраст текста · 360 проходят / 0 не проходят · минимум 4,5:1', {
            exact: true,
        })
        .click();
    const report = page.getByRole('region', {
        name: 'Проверка контраста текста',
        exact: true,
    });

    await expect(report.locator('tbody tr')).toHaveCount(45);
    await expect(report).toContainText('primary / default');
    await page.getByRole('checkbox', {name: 'Только нарушения'}).check();
    await expect(report.locator('tbody')).toContainText(
        'Нарушений в перечисленных сочетаниях нет.',
    );
});
