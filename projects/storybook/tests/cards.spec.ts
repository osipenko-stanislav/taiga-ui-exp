import {expect, test} from '@playwright/test';

const medium = 'iframe.html?id=layout-cards-medium--example-1&viewMode=story';

for (const theme of ['light', 'dark']) {
    for (const direction of ['otus-core', 'otus-brand']) {
        test(`medium cards retain native padding in ${theme}, ${direction}`, async ({
            page,
        }) => {
            await page.goto(`${medium}&globals=theme:${theme};direction:${direction}`);
            const cards = page.locator('[tuiCardMedium]');

            await expect(cards).toHaveCount(3);

            for (const width of [1440, 390]) {
                await page.setViewportSize({width, height: 900});

                for (const card of await cards.all()) {
                    await expect(card).toHaveCSS('padding', '12px');
                    await expect(card).toHaveCSS('width', '140px');
                    await expect(card).toHaveCSS('height', '140px');
                    await expect(card).toHaveCSS('display', 'flex');
                    await expect(card).toHaveCSS('flex-direction', 'column');
                    const inset = await card.evaluate((element) => {
                        const title = element.querySelector('[tuiTitle]')!;

                        return (
                            title.getBoundingClientRect().left -
                            element.getBoundingClientRect().left
                        );
                    });

                    expect(inset).toBe(12);
                }
            }
        });
    }
}

test('medium card variants preserve their native content insets', async ({page}) => {
    for (const example of [2, 3, 4, 5, 6, 7]) {
        await page.goto(medium.replace('--example-1', `--example-${example}`));
        const cards = page.locator('[tuiCardMedium]');

        await expect(cards.first()).toBeVisible();

        for (const card of await cards.all()) {
            await expect(card).toHaveCSS('padding', example === 6 ? '10px 12px' : '12px');
        }
    }
});

test('large card spacing and nested medium cards keep their native padding', async ({
    page,
}) => {
    await page.goto('iframe.html?id=layout-cards-large--example-12&viewMode=story');
    const cards = page.locator('[tuiCardLarge]');

    await expect(cards).toHaveCount(4);

    for (const [index, padding] of ['24px', '20px', '20px', '16px'].entries()) {
        await expect(cards.nth(index)).toHaveCSS('padding', padding);
    }

    await page.goto('iframe.html?id=layout-cards-large--example-4&viewMode=story');
    await expect(page.locator('[tuiCardLarge]')).toHaveCSS('padding', '24px');
    const nested = page.locator('[tuiCardLarge] [tuiCardMedium]');

    await expect(nested).toHaveCount(3);

    for (const card of await nested.all()) {
        await expect(card).toHaveCSS('padding', '12px');
    }
});

test('selectable cards retain pointer and keyboard selection', async ({page}) => {
    await page.goto(medium.replace('--example-1', '--example-7'));
    const radios = page.getByRole('radio');

    await expect(radios.first()).toBeChecked();
    await page.locator('[tuiCardMedium]').last().click();
    await expect(radios.last()).toBeChecked();
    await radios.first().focus();
    await page.keyboard.press('Space');
    await expect(radios.first()).toBeChecked();
    await expect(radios.last()).not.toBeChecked();
});

test('card artwork resolves under the deployment base', async ({page}) => {
    for (const [story, selector, pseudo] of [
        ['layout-cards-medium--example-5', '.poster, .fly, .stock', '::after'],
        ['layout-cards-medium--example-7', '.visa', null],
        ['layout-cards-large--example-10', '[tuiCardLarge]', null],
    ] as const) {
        await page.goto(`iframe.html?id=${story}&viewMode=story`);
        const artwork = page.locator(selector);

        await expect(artwork.first()).toBeVisible();
        const images = await artwork.evaluateAll(async (elements, pseudoElement) => {
            const sources = elements.flatMap((element) =>
                Array.from(
                    getComputedStyle(element, pseudoElement).backgroundImage.matchAll(
                        /url\("([^"]+)"\)/g,
                    ),
                    (match) => match[1]!,
                ),
            );

            return Promise.all(
                sources.map(async (source) => {
                    const image = new Image();

                    image.src = source;

                    return image.decode().then(
                        () => ({source, loaded: true}),
                        () => ({source, loaded: false}),
                    );
                }),
            );
        }, pseudo);

        expect(images.length).toBeGreaterThan(0);
        expect(images.filter((image) => !image.loaded)).toEqual([]);
    }
});
