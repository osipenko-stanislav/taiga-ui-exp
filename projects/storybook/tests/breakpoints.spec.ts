import {expect, test} from '@playwright/test';

test('OTUS presets resize the iframe independently of Brand mode', async ({page}) => {
    await page.setViewportSize({width: 1800, height: 1100});
    await page.goto(
        '/?path=/story/components-buttons-button--api-preview&globals=direction:otus-brand',
    );
    const preview = page.frameLocator('#storybook-preview-iframe');
    const root = preview.locator('tui-root');

    await expect(root).toHaveAttribute('data-breakpoint', 'otus-desktop');

    for (const [preset, width, height] of [
        ['otus-mobile', 390, 844],
        ['otus-tablet', 768, 1024],
        ['otus-desktop', 1280, 720],
    ] as const) {
        await page.getByTitle('Change the size of the preview', {exact: true}).click();
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

    await page.reload();
    await expect(root).toHaveAttribute('data-breakpoint', 'otus-desktop');
    await expect(root).toHaveAttribute('data-direction', 'otus-brand');
});
