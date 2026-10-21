import {expect, test} from '@playwright/test';

const story =
    '/iframe.html?id=documentation-styles-layout-otus-global-dimensions--tokens&viewMode=story';

const values = [
    0, 1, 1.5, 2, 4, 6, 8, 10, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64,
    72, 80, 96, 112, 128, 144, 160, 192, 208, 224, 240, 256, 320, 384, 100000,
];

for (const mode of ['otus-core', 'otus-brand']) {
    test(`dimension primitives match Figma and ship in the ${mode} theme`, async ({
        page,
    }) => {
        await page.goto(`${story}&globals=direction:${mode}`);
        await expect(page.locator('otus-dimensions tbody tr')).toHaveCount(values.length);
        const actual = await page.locator('tui-root').evaluate((root, pixels) => {
            const styles = getComputedStyle(root);

            return pixels.map((value) => {
                const suffix =
                    value === 100000 ? 'infinite' : String(value).replace('.', '-');

                return styles.getPropertyValue(`--otus-dimension-${suffix}`).trim();
            });
        }, values);

        expect(actual).toEqual(values.map((value) => `${value / 16}rem`));
        await expect(
            page.locator('[data-token="--otus-dimension-1-5"] .t-sample'),
        ).toHaveCSS('width', '1.5px');
        await expect(
            page.locator('[data-token="--otus-dimension-14"] .t-sample'),
        ).toHaveCSS('width', '14px');
    });
}

test('dimension catalog supports search and contains wide samples on mobile', async ({
    page,
}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto(story);
    await expect(page.locator('otus-dimensions tbody tr')).toHaveCount(values.length);
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
    ).toBe(true);
    await page.getByRole('searchbox').fill('--otus-dimension-infinite');
    await expect(page.locator('otus-dimensions tbody tr')).toHaveCount(1);
    await expect(page.locator('otus-dimensions tbody')).toContainText('100000');
    await page.getByRole('searchbox').fill('unknown-token');
    await expect(page.locator('otus-dimensions tbody')).toContainText(
        'Ничего не найдено',
    );
});

test('Taiga sizes and radii gallery keeps OTUS primitives in their separate section', async ({
    page,
}) => {
    await page.goto('/iframe.html?id=foundations-dimensions--tokens&viewMode=story');
    await expect(page.locator('[data-token="--tui-radius-m"]')).toBeVisible();
    await expect(page.locator('[data-token^="--otus-dimension-"]')).toHaveCount(0);
});

for (const mode of ['otus-core', 'otus-brand']) {
    test(`Taiga dimension aliases follow OTUS primitives in ${mode}`, async ({page}) => {
        const aliases = {
            '--tui-radius-xs': 4,
            '--tui-radius-s': 8,
            '--tui-radius-m': 10,
            '--tui-radius-l': 12,
            '--tui-radius-xl': 24,
            '--tui-height-xs': 24,
            '--tui-height-s': 32,
            '--tui-height-m': 44,
            '--tui-height-l': 56,
            '--tui-padding-s': 10,
            '--tui-padding-m': 12,
            '--tui-padding-l': 16,
            '--tui-stroke-width': 1.5,
        };

        await page.goto(
            `/iframe.html?id=components-buttons-button--example-1&viewMode=story&globals=direction:${mode}`,
        );
        const button = page.locator('button[tuiButton][data-size="m"]').first();

        await expect(button).toHaveCSS('height', '44px');
        const root = page.locator('tui-root');
        const readAliases = async (): Promise<string[]> =>
            root.evaluate((element, names) => {
                const styles = getComputedStyle(element);

                return names.map((name) => styles.getPropertyValue(name).trim());
            }, Object.keys(aliases));

        expect(await readAliases()).toEqual(
            Object.values(aliases).map((px) => `${px / 16}rem`),
        );
        await page.addStyleTag({
            content: `:root, tui-root {${Object.values(aliases)
                .map(
                    (px) =>
                        `--otus-dimension-${String(px).replace('.', '-')}: ${(px + 16) / 16}rem;`,
                )
                .join('')}}`,
        });
        expect(await readAliases()).toEqual(
            Object.values(aliases).map((px) => `${(px + 16) / 16}rem`),
        );
        await expect(button).toHaveCSS('height', '60px');
    });
}
