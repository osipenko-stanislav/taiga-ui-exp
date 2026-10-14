import {readFile} from 'node:fs/promises';
import path from 'node:path';

import {expect, test} from '@playwright/test';

test('prepared contour SVG retains the original rendering as a square image', async ({
    page,
    request,
}) => {
    const source = await readFile(
        path.resolve('projects/icons/assets/outline/user-01-lined.svg'),
        'utf8',
    );

    const response = await request.get(
        '/assets/taiga-ui/icons/outline/user-01-lined.svg',
    );

    const prepared = await response.text();

    expect(response.status()).toBe(200);
    const pixels = await page.evaluate(
        async (images) => {
            const results: number[][] = [];

            for (const svg of images) {
                const image = new Image();

                image.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
                await image.decode();
                const canvas = document.createElement('canvas');

                canvas.width = 24;
                canvas.height = 24;
                const context = canvas.getContext('2d')!;

                context.drawImage(image, 0, 0, 24, 24);
                results.push(Array.from(context.getImageData(0, 0, 24, 24).data));
            }

            return results;
        },
        [source, prepared],
    );

    expect(pixels[1]).toEqual(pixels[0]);
});

test('Stroke changes the rendered contour width in the Parameters example', async ({
    page,
}) => {
    await page.goto(
        '/iframe.html?id=components-icon--example-2&viewMode=story&globals=direction:otus-brand',
    );
    const control = page.locator('input[tuiInputSlider]').nth(2);
    const icon = page.locator('tui-icon[style*="--tui-stroke-width"]');
    const coverage: number[] = [];

    for (const stroke of [1, 3]) {
        await control.fill(String(stroke));
        await control.press('Tab');
        await expect(icon).toHaveCSS('--tui-stroke-width', `${stroke}px`);
        const png = await icon.screenshot();

        coverage.push(
            await page.evaluate(async (base64) => {
                const image = new Image();

                image.src = `data:image/png;base64,${base64}`;
                await image.decode();
                const canvas = document.createElement('canvas');

                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d')!;

                context.drawImage(image, 0, 0);
                const pixels = context.getImageData(0, 0, image.width, image.height).data;
                let ink = 0;

                for (let index = 0; index < pixels.length; index += 4) {
                    if (
                        pixels[index]! < 128 &&
                        pixels[index + 1]! < 128 &&
                        pixels[index + 2]! < 128
                    ) {
                        ink++;
                    }
                }

                return ink;
            }, png.toString('base64')),
        );
    }

    expect(coverage[0]).toBeGreaterThan(0);
    expect(coverage[1]).toBeGreaterThan(coverage[0]! * 1.5);
});
