import {readFile} from 'node:fs/promises';

import {expect, test} from '@playwright/test';

import {applyColorOverrides} from '../../styles/scripts/otus-color-overrides.mjs';
import {OTUS_COLOR_MAPPING} from '../src/generated/catalog';

const story =
    '/iframe.html?id=documentation-styles-colors-taiga-to-otus-mapping--table&viewMode=story&globals=theme:light;brand:otus-tech';

const primitive = OTUS_COLOR_MAPPING.primitives.find((item) => item.value === '#131315')!;

test('overrides preserve alpha, resolve TUI aliases and recalculate contrast without mutating the baseline', () => {
    const mapping = applyColorOverrides(OTUS_COLOR_MAPPING, [
        {
            token: '--tui-background-accent-2',
            school: 'otus-tech',
            theme: 'light',
            primitive: primitive.path,
        },
    ]);

    const row = mapping.mappings.find(
        (item) => item.tui === '--tui-background-accent-2',
    )!;

    expect(row.variants.light.schools['otus-tech'].value).toBe('#131315');
    expect(row.variants.light.schools['otus-design'].value).toBe('#BE84FC');
    expect(row.variants.dark.schools['otus-tech'].value).toBe('#2CB9FF');
    expect(mapping.accessibility.failed).toBeGreaterThan(0);
    expect(OTUS_COLOR_MAPPING.accessibility.failed).toBe(0);
    expect(() =>
        applyColorOverrides(OTUS_COLOR_MAPPING, [
            {
                token: '--tui-background-accent-2',
                school: 'otus-tech',
                theme: 'light',
                primitive: 'invented/color',
            },
        ]),
    ).toThrow();
    const translucent = applyColorOverrides(OTUS_COLOR_MAPPING, [
        {
            token: '--tui-service-backdrop',
            school: 'otus-tech',
            theme: 'dark',
            primitive: primitive.path,
        },
    ]);

    const backdrop = translucent.mappings.find(
        (item) => item.tui === '--tui-service-backdrop',
    )!.variants.dark.schools['otus-tech'];

    expect(backdrop.opacity).toBe(0.75);
    expect(backdrop.css).toContain('75%');
    const primary = applyColorOverrides(OTUS_COLOR_MAPPING, [
        {
            token: '--tui-background-accent-1',
            school: 'otus-tech',
            theme: 'light',
            primitive: OTUS_COLOR_MAPPING.primitives.find(
                (item) => item.value === '#BE84FC',
            )!.path,
        },
    ]);

    const alias = primary.mappings.find(
        (item) => item.tui === '--tui-chart-categorical-00',
    )!;

    expect(alias.variants.light.schools['otus-tech'].value).toBe('#BE84FC');
});

test('palette selection persists, reaches component previews, exports and resets', async ({
    page,
}) => {
    await page.goto(story);
    const cell = page.locator('[data-token="--tui-background-accent-2"]');

    await cell.getByRole('button', {name: 'Выбрать цвет'}).click();
    await page.getByLabel('Поиск в палитре OTUS').fill('#131315');
    const option = page.getByRole('radio', {
        name: `${primitive.path} ${primitive.value}`,
        exact: true,
    });

    await expect(option.locator('..').locator('.t-palette-swatch')).toHaveCSS(
        'background-color',
        'rgb(19, 19, 21)',
    );
    await option.check();
    await expect(cell).toContainText('Изменено в черновике');
    await expect(cell).toContainText('#131315');
    const accent = page.locator(
        '.t-live-preview [data-appearance="accent"] .t-motion-backdrop',
    );

    await expect(accent).toHaveCSS('background-color', 'rgb(19, 19, 21)');
    await page.getByLabel('Применять черновик к примерам').uncheck();
    await expect(accent).toHaveCSS('background-color', 'rgb(44, 185, 255)');
    await page.getByLabel('Применять черновик к примерам').check();
    await expect(accent).toHaveCSS('background-color', 'rgb(19, 19, 21)');
    await page.reload();
    await expect(cell).toContainText('Изменено в черновике');
    await expect(accent).toHaveCSS('background-color', 'rgb(19, 19, 21)');
    const downloaded = page.waitForEvent('download');

    await page.getByRole('button', {name: 'Скачать JSON'}).click();
    const path = await (await downloaded).path();
    const exported = JSON.parse(await readFile(path, 'utf8'));

    expect(exported.configuration.overrides).toEqual([
        {
            token: '--tui-background-accent-2',
            school: 'otus-tech',
            theme: 'light',
            primitive: primitive.path,
        },
    ]);
    expect(exported.appliedToRuntime).toBe(false);
    expect(exported.accessibility.failed).toBeGreaterThan(0);
    await page.goto(
        '/iframe.html?id=components-buttons-button--api-preview&viewMode=story&globals=theme:light;brand:otus-tech',
    );
    expect(
        await page
            .locator('tui-root')
            .evaluate((el) =>
                getComputedStyle(el).getPropertyValue('--tui-background-accent-2').trim(),
            ),
    ).toBe('#131315');
    await page.goto(story);
    await page.getByRole('button', {name: 'Сбросить черновик'}).click();
    await expect(accent).toHaveCSS('background-color', 'rgb(44, 185, 255)');
    await expect(cell).not.toContainText('Изменено в черновике');
});

test('corrupt browser drafts do not break the mapping table', async ({page}) => {
    await page.addInitScript(() =>
        localStorage.setItem('otus-color-mapping-draft-v1', '[{"token":"--unknown"}]'),
    );
    await page.goto(story);
    await expect(page.locator('.t-mapping-table tbody tr')).toHaveCount(
        OTUS_COLOR_MAPPING.mappings.length,
    );
    await expect(page.getByRole('button', {name: 'Сбросить черновик'})).toBeDisabled();
});
