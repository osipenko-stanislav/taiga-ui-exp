import {expect, test} from '@playwright/test';

import {OTUS_COLOR_MAPPING} from '../src/generated/catalog';

for (const theme of ['light', 'dark'] as const) {
    test(`OTUS semantic tokens match Taiga roles for every school in ${theme}`, async ({
        page,
    }) => {
        for (const school of OTUS_COLOR_MAPPING.schoolAssignments) {
            await page.goto(
                `/iframe.html?id=components-buttons-button--example-2&viewMode=story&globals=theme:${theme};brand:${school.id}`,
            );
            const button = page.locator('button[tuiButton]').first();

            await expect(button).toBeVisible();
            const mismatches = await button.evaluate(
                (element, tokens) => {
                    const styles = getComputedStyle(element);

                    return tokens.filter(
                        (token) =>
                            !styles
                                .getPropertyValue(token.replace('--tui-', '--otus-'))
                                .trim() ||
                            styles.getPropertyValue(token).trim() !==
                                styles
                                    .getPropertyValue(token.replace('--tui-', '--otus-'))
                                    .trim(),
                    );
                },
                OTUS_COLOR_MAPPING.mappings.map((row) => row.tui),
            );

            expect(mismatches).toEqual([]);
        }
    });
}

test('former OTUS-only links open the unified mapping', async ({page}) => {
    await page.goto(
        '/iframe.html?id=documentation-styles-colors-otus-tokens--table&viewMode=story&globals=brand:otus-university',
    );
    await expect(
        page.getByRole('heading', {name: 'Маппинг цветов', exact: true}),
    ).toBeVisible();
    await expect(
        page.locator('tr[data-token="--tui-background-accent-2"] th').first(),
    ).toContainText('--otus-background-accent-2');
});

test('overriding an OTUS role at the theme boundary updates Taiga and dependent roles', async ({
    page,
}) => {
    await page.goto(
        '/iframe.html?id=components-buttons-button--example-2&viewMode=story&globals=brand:otus-university',
    );
    const button = page.locator('button[tuiButton][data-appearance="primary"]').first();

    await expect(button).toBeVisible();
    await page
        .locator('tui-root')
        .evaluate((element) =>
            element.style.setProperty('--otus-background-accent-1', '#123456'),
        );
    await expect(button.locator('.t-motion-backdrop')).toHaveCSS(
        'background-color',
        'rgb(18, 52, 86)',
    );
    expect(
        await button.evaluate((element) =>
            getComputedStyle(element)
                .getPropertyValue('--tui-chart-categorical-00')
                .trim(),
        ),
    ).toBe('#123456');
});
