import {expect, test} from '@playwright/test';

const HEADINGS = [
    {level: 1, size: '50px', tracking: '-1.25px'},
    {level: 2, size: '44px', tracking: '-1.1px'},
    {level: 3, size: '36px', tracking: '-0.72px'},
    {level: 4, size: '28px', tracking: '-0.42px'},
    {level: 5, size: '24px', tracking: '-0.24px'},
    {level: 6, size: '20px', tracking: '-0.1px'},
] as const;

test('heading gallery uses tighter Graphik tracking without changing the font scale', async ({
    page,
}) => {
    await page.goto(
        '/iframe.html?id=documentation-styles-typography--gallery&viewMode=story',
    );

    for (const heading of HEADINGS) {
        const sample = page.locator(
            `td[data-font="--tui-typography-heading-h${heading.level}"]`,
        );

        await expect(sample).toHaveCSS('letter-spacing', heading.tracking);
        await expect(sample).toHaveCSS('font-size', heading.size);
        await expect(sample).toHaveCSS('font-weight', '600');
    }

    await expect(page.locator('td[data-font="--tui-typography-body-m"]')).toHaveCSS(
        'letter-spacing',
        'normal',
    );
    await page.goto('/iframe.html?id=foundations-typography--tokens&viewMode=story');
    await expect(
        page.locator('.t-type-sample[data-font="--tui-typography-heading-h1"]'),
    ).toHaveCSS('letter-spacing', '-1.25px');
});

test('component headings use the same tracking and their subtitles keep normal spacing', async ({
    page,
}) => {
    await page.goto('/iframe.html?id=layout-header--example-1&viewMode=story');

    for (const heading of HEADINGS) {
        const header = page.locator(`[tuiHeader][data-size="h${heading.level}"]`);

        await expect(header).toHaveCSS('letter-spacing', heading.tracking);
        await expect(header.locator('h2')).toHaveCSS('letter-spacing', heading.tracking);
        await expect(header.locator('h2')).toHaveCSS('font-weight', '600');
        await expect(header.locator('[tuiSubtitle]')).toHaveCSS(
            'letter-spacing',
            'normal',
        );
        await expect(header.locator('[tuiAccessories] button')).toHaveCSS(
            'letter-spacing',
            'normal',
        );
    }

    await page.goto('/iframe.html?id=components-button--playground&viewMode=story');
    await expect(page.getByRole('button', {name: 'Continue', exact: true})).toHaveCSS(
        'letter-spacing',
        'normal',
    );
});
