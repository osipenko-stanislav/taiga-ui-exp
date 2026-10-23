import {expect, test} from '@playwright/test';

test('OTUS presets resize the iframe independently of Brand mode', async ({page}) => {
    await page.setViewportSize({width: 1800, height: 1100});
    await page.goto(
        '/?path=/story/components-buttons-button--api-preview&globals=direction:otus-brand',
    );
    const preview = page.frameLocator('#storybook-preview-iframe');
    const root = preview.locator('tui-root');

    await expect(root).toHaveAttribute('data-breakpoint', 'otus-desktop');

    for (const [preset, width, height] of [['otus-mobile', 390, 844]] as const) {
        await page.getByTitle('Change the size of the preview', {exact: true}).click();
        await expect(page.getByText('otus-tablet', {exact: true})).toHaveCount(0);
        await page.getByText(preset, {exact: true}).click();
        await expect(root).toHaveAttribute('data-breakpoint', preset);
        await expect(root).toHaveAttribute('data-direction', 'otus-brand');
        await expect
            .poll(async () => preview.locator('body').evaluate(() => innerWidth))
            .toBe(width);
        await expect
            .poll(async () => preview.locator('body').evaluate(() => innerHeight))
            .toBe(height);
    }

    await page.getByTitle('Change the size of the preview', {exact: true}).click();
    await page.getByText('otus-desktop', {exact: true}).click();

    for (const [width, height] of [
        [1800, 1100],
        [1400, 900],
    ] as const) {
        await page.setViewportSize({width, height});
        await expect
            .poll(async () => {
                const canvasWidth = await page
                    .locator('#storybook-preview-wrapper')
                    .evaluate((element) => element.closest('main')!.clientWidth);

                const previewWidth = await preview
                    .locator('body')
                    .evaluate(() => innerWidth);

                return Math.abs(previewWidth - canvasWidth);
            })
            .toBeLessThanOrEqual(1);
        await expect(root).toHaveAttribute('data-breakpoint', 'otus-desktop');
        await expect(root).toHaveAttribute('data-direction', 'otus-brand');
        await expect
            .poll(async () => {
                const canvasHeight = await page
                    .locator('#storybook-preview-wrapper')
                    .evaluate((element) => element.clientHeight);

                const previewHeight = await preview
                    .locator('body')
                    .evaluate(() => innerHeight);

                return Math.abs(previewHeight - canvasHeight);
            })
            .toBeLessThanOrEqual(1);
    }

    await page.reload();
    await expect(root).toHaveAttribute('data-breakpoint', 'otus-desktop');
    await expect(root).toHaveAttribute('data-direction', 'otus-brand');
});
