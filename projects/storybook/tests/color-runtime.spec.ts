import {expect, test} from '@playwright/test';

import {OTUS_COLOR_MAPPING} from '../src/generated/catalog';

for (const theme of ['light', 'dark'] as const) {
    test(`library aliases follow school and direction modes in ${theme}`, async ({
        page,
    }) => {
        for (const school of OTUS_COLOR_MAPPING.schoolAssignments) {
            for (const direction of ['otus-core', 'otus-brand']) {
                await page.goto(
                    `/iframe.html?id=components-buttons-button--example-2&viewMode=story&globals=theme:${theme};brand:${school.id};direction:${direction}`,
                );
                const button = page
                    .locator('button[tuiButton][data-appearance="accent"]')
                    .first();

                const background = OTUS_COLOR_MAPPING.mappings.find(
                    (row) => row.tui === '--tui-background-accent-2',
                )!.variants[theme].schools[school.id];

                const value = await button.evaluate((element) =>
                    getComputedStyle(element)
                        .getPropertyValue('--tui-background-accent-2')
                        .trim(),
                );

                expect(value).toBe(background.value.toLowerCase());
                const foreground = OTUS_COLOR_MAPPING.mappings.find(
                    (row) => row.tui === '--tui-text-primary-on-accent-2',
                )!.variants[theme].schools[school.id].value;

                await expect(button).toHaveCSS(
                    'color',
                    `rgb(${foreground
                        .slice(1)
                        .match(/../g)!
                        .map((channel) => Number.parseInt(channel, 16))
                        .join(', ')})`,
                );
            }
        }
    });
}

test('changing the existing theme boundary repaints backdrops without recreating buttons', async ({
    page,
}) => {
    await page.goto(
        '/iframe.html?id=components-buttons-button--example-2&viewMode=story&globals=brand:otus-university;theme:light',
    );
    const root = page.locator('tui-root');
    const button = page.locator('button[tuiButton][data-appearance="accent"]').first();
    const original = await button.elementHandle();

    await root.evaluate((element) => element.setAttribute('data-brand', 'otus-design'));
    await expect(button.locator('.t-motion-backdrop')).toHaveCSS(
        'background-color',
        'rgb(190, 132, 252)',
    );
    await root.evaluate((element) => element.setAttribute('tuiTheme', 'dark'));
    const primary = page.locator('button[tuiButton][data-appearance="primary"]').first();

    await expect(primary.locator('.t-motion-backdrop')).toHaveCSS(
        'background-color',
        'rgb(233, 234, 234)',
    );
    expect(
        await button.evaluate((element, previous) => element === previous, original),
    ).toBe(true);
});

test('portalled dialog inherits school aliases from the same root', async ({page}) => {
    await page.goto(
        '/iframe.html?id=components-modals-dialog-routable--example-1&viewMode=story&globals=theme:dark;brand:otus-design',
    );
    await page.getByRole('button', {name: 'Open dialog', exact: true}).click();
    const dialog = page.locator('tui-dialog');

    await expect(dialog).toBeVisible();
    expect(
        await dialog.evaluate((element) =>
            getComputedStyle(element)
                .getPropertyValue('--tui-background-accent-2')
                .trim(),
        ),
    ).toBe('#be84fc');
    await page
        .locator('tui-root')
        .evaluate((element) => element.setAttribute('data-brand', 'otus-tech'));
    expect(
        await dialog.evaluate((element) =>
            getComputedStyle(element)
                .getPropertyValue('--tui-background-accent-2')
                .trim(),
        ),
    ).toBe('#2cb9ff');
});

test('dropdown theme boundaries keep the inherited school mapping', async ({page}) => {
    await page.goto(
        '/iframe.html?id=components-dropdown-dropdown--example-1&viewMode=story&globals=brand:otus-design;theme:dark',
    );
    await page.locator('button[tuiButton]').first().click();
    const dropdown = page.locator('tui-dropdown').first();

    await expect(dropdown).toBeVisible();
    expect(
        await dropdown.evaluate((element) =>
            getComputedStyle(element)
                .getPropertyValue('--tui-background-accent-2')
                .trim(),
        ),
    ).toBe('#be84fc');
    await page
        .locator('tui-root')
        .evaluate((element) => element.setAttribute('data-brand', 'otus-tech'));
    expect(
        await dropdown.evaluate((element) =>
            getComputedStyle(element)
                .getPropertyValue('--tui-background-accent-2')
                .trim(),
        ),
    ).toBe('#2cb9ff');
});
