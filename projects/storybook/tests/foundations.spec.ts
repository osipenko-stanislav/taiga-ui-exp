import {expect, test} from '@playwright/test';

import {CATALOG, ICON_NAMES, INJECTION_TOKENS} from '../src/generated/catalog';

test('catalog overview links to every generated section and filters by name', async ({
    page,
}) => {
    await page.goto('/iframe.html?id=overview-catalog--all&viewMode=story');
    await expect(page.locator('tui-foundations-story tbody tr')).toHaveCount(
        CATALOG.length,
    );
    const link = page.locator('tui-foundations-story tbody a').first();

    await expect(link).toHaveAttribute('href', `/?path=/story/${CATALOG[0].storyId}`);
    await page.getByRole('searchbox').fill('Accordion');
    await expect(page.locator('tui-foundations-story tbody tr')).toHaveCount(1);
    await expect(page.locator('tui-foundations-story tbody')).toContainText('Accordion');
    await page.getByRole('searchbox').fill('No matching component');
    await expect(page.locator('tui-foundations-story tbody')).toContainText(
        'Ничего не найдено',
    );
    await page.getByRole('searchbox').fill('Accordion');
    await page.locator('tui-foundations-story tbody a').click();
    await expect(
        page.frameLocator('#storybook-preview-iframe').locator('tui-example-story'),
    ).toBeVisible();
});

test('color tokens follow the light and dark themes', async ({page}) => {
    for (const theme of ['light', 'dark']) {
        await page.goto(
            `/iframe.html?id=foundations-tokens--colors&viewMode=story&globals=theme:${theme}`,
        );
        const base = page.locator('[data-token="--tui-background-base"]');
        const value = theme === 'dark' ? '#222' : '#fff';
        const color = theme === 'dark' ? 'rgb(34, 34, 34)' : 'rgb(255, 255, 255)';

        await expect(base.locator('.t-value')).toHaveText(value);
        await expect(base.locator('.t-swatch')).toHaveCSS('background-color', color);
    }
});

test('typography samples use Graphik and the heading weight', async ({page}) => {
    await page.goto('/iframe.html?id=foundations-tokens--typography&viewMode=story');
    const heading = page.locator(
        '[data-token="--tui-typography-heading-h1"] .t-type-sample',
    );

    await expect(heading).toHaveCSS('font-family', 'Graphik, system-ui, sans-serif');
    await expect(heading).toHaveCSS('font-weight', '600');
});

test('injection token catalog includes component option tokens', async ({page}) => {
    await page.goto('/iframe.html?id=foundations-tokens--injection&viewMode=story');
    await expect(page.locator('tui-foundations-story tbody tr')).toHaveCount(
        INJECTION_TOKENS.length,
    );
    await page.getByRole('searchbox').fill('TUI_BUTTON_OPTIONS');
    await expect(page.locator('tui-foundations-story tbody tr')).toHaveCount(1);
    await expect(page.locator('tui-foundations-story tbody')).toContainText('core');
});

test('icons are paginated and searchable', async ({page}) => {
    await page.goto('/iframe.html?id=foundations-tokens--icons&viewMode=story');
    await expect(page.getByRole('status')).toHaveText(
        `Найдено ${ICON_NAMES.length} иконок`,
    );
    await expect(page.locator('figure')).toHaveCount(100);
    await page.getByRole('button', {name: 'Далее'}).click();
    await expect(page.locator('.t-icon-pages > span')).toContainText('2 /');
    await page.getByRole('searchbox').fill('outline.arrow-down-lined');
    await expect(page.locator('figure')).toHaveCount(1);
    await expect(page.locator('figcaption').first()).toContainText(
        '@otus.outline.arrow-down-lined',
    );
});
