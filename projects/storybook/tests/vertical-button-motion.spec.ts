import {expect, test} from '@playwright/test';

for (const mode of ['otus-core', 'otus-brand']) {
    test(`vertical button backdrops cover the whole button in ${mode}`, async ({
        page,
    }) => {
        await page.goto(
            `/iframe.html?id=components-buttons-button--example-6&viewMode=story&globals=direction:${mode}`,
        );
        const buttons = page.locator('button[tuiButtonVertical]');

        await expect(buttons).toHaveCount(3);
        await page.evaluate(async () => document.fonts.ready);

        for (const button of await buttons.all()) {
            const bounds = await button.evaluate((element) => ({
                button: element.getBoundingClientRect().toJSON(),
                backdrop: element
                    .querySelector('.t-motion-backdrop')!
                    .getBoundingClientRect()
                    .toJSON(),
            }));

            expect(bounds.backdrop.height).toBeCloseTo(bounds.button.height, 1);
            expect(bounds.backdrop.width).toBeCloseTo(bounds.button.width, 1);
            await button.hover();
            await expect(button.locator('.t-motion-backdrop')).toHaveCSS('top', '2px');
            const hovered = await button.evaluate((element) => ({
                button: element.getBoundingClientRect().height,
                backdrop: element
                    .querySelector('.t-motion-backdrop')!
                    .getBoundingClientRect().height,
            }));

            expect(hovered.backdrop).toBeCloseTo(hovered.button - 4, 1);
            await page.mouse.move(0, 0);
        }
    });
}

test('vertical avatar loads without an external image host', async ({page}) => {
    await page.route('https://avatars.githubusercontent.com/**', async (route) =>
        route.abort(),
    );
    await page.goto(
        '/iframe.html?id=components-buttons-button--example-6&viewMode=story&globals=direction:otus-brand',
    );
    const image = page.locator('button[tuiButtonVertical] img');

    await expect
        .poll(async () =>
            image.evaluate((element: HTMLImageElement) => element.naturalWidth),
        )
        .toBeGreaterThan(0);
});
