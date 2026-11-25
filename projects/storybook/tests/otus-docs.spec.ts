import {expect, test} from '@playwright/test';

test('Docs combines the live primary story, controls and meaningful variation groups', async ({
    page,
    context,
}) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/?path=/docs/components-button--docs');
    const docs = page.frameLocator('#storybook-preview-iframe');
    await expect(docs.locator('.t-otus-docs-page h1')).toHaveText('Button');
    await expect(docs.locator('.t-otus-docs-page h1')).toHaveCount(1);
    const primary = docs.locator('#overview .docs-story');
    await expect(primary.locator('button[tuiButton]')).toHaveText('Continue');
    expect((await primary.boundingBox())!.height).toBeLessThan(250);
    await docs.locator('#api textarea').first().fill('Проверить');
    await expect(primary.locator('button[tuiButton]')).toHaveText('Проверить');
    await expect(docs.locator('#variants article')).toHaveCount(2);
    await expect(docs.locator('#states article')).toHaveCount(5);
    await expect(docs.locator('#variants #overview')).toHaveCount(0);
    await docs.getByRole('button', {name: 'Копировать ссылку на страницу'}).click();
    await expect(docs.locator('.t-otus-docs-page__copy-status')).toHaveText(
        'Ссылка скопирована',
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
        '?path=%2Fdocs%2Fcomponents-button--docs',
    );
    const states = docs.getByRole('link', {name: 'Состояния', exact: true});
    await expect(states).toHaveAttribute('href', '#states');
    await states.click();
    await expect(states).toHaveAttribute('aria-current', 'location');
    expect(errors.filter((error) => error !== 'The user aborted a request.')).toEqual([]);
});

test('mobile dark Docs retains navigation without page overflow', async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto(
        '/iframe.html?viewMode=docs&id=components-button--docs&globals=theme:dark',
    );
    await expect(page.locator('.t-otus-docs-page')).toHaveAttribute('tuiTheme', 'dark');
    await expect(page.getByRole('navigation', {name: 'На этой странице'})).toBeVisible();
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
    ).toBe(true);
});
