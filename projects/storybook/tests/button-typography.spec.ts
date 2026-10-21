import {expect, test} from '@playwright/test';

test('all button sizes use Graphik Medium while body and headings keep their weights', async ({
    page,
}) => {
    await page.goto(
        '/iframe.html?id=components-buttons-button--example-1&viewMode=story',
    );

    for (const size of ['xs', 's', 'm', 'l']) {
        const button = page.locator(`button[tuiButton][data-size="${size}"]`).first();

        await expect(button).toHaveCSS('font-weight', '500');
        await expect(button).toHaveCSS(
            'font-size',
            size === 'xs' || size === 's' ? '14px' : '16px',
        );
        await expect(button).toHaveCSS(
            'line-height',
            size === 'xs' || size === 's' ? '20px' : '24px',
        );
    }

    await page.evaluate(async () => document.fonts.ready);
    expect(
        await page.evaluate(() =>
            Array.from(document.fonts).some(
                (font) =>
                    font.family === 'Graphik' &&
                    font.weight === '500' &&
                    font.status === 'loaded',
            ),
        ),
    ).toBe(true);

    await page.goto('/iframe.html?id=foundations-typography--tokens&viewMode=story');
    await expect(
        page.locator('[data-token="--tui-typography-heading-h1"] .t-type-sample'),
    ).toHaveCSS('font-weight', '600');
    await expect(
        page.locator('[data-token="--tui-typography-body-m"] .t-type-sample'),
    ).toHaveCSS('font-weight', '400');
});

test('Control Typography has live samples and reports their actual styles', async ({
    page,
}) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(
        '/iframe.html?id=documentation-styles-control-typography--gallery&viewMode=story&globals=brand:otus-nature;direction:otus-brand',
    );
    await expect(
        page.getByRole('heading', {name: 'Типографика контролов'}),
    ).toBeVisible();
    const rows = page.locator('tr[data-sample]');

    await expect(rows).toHaveCount(35);

    for (const row of await rows.all()) {
        await expect(row.locator('.t-weight')).toHaveText(/^[1-9]00$/);
        await expect(row.locator('.t-size')).toHaveText(/px$/);
        await expect(row.locator('.t-family')).toContainText('Graphik');
    }

    for (const size of ['xs', 's', 'm', 'l']) {
        const row = page.locator(`[data-sample="button-${size}"]`);

        await expect(row.locator('button')).toHaveCSS('font-weight', '500');
        await expect(row.locator('.t-weight')).toHaveText('500');
    }

    await page.getByRole('textbox', {name: 'Поле с плейсхолдером'}).first().fill('Иван');
    await expect(
        page.getByRole('textbox', {name: 'Поле с плейсхолдером'}).first(),
    ).toHaveValue('Иван');
    expect(errors).toEqual([]);
    await page.goto(
        '/iframe.html?id=documentation-styles-typography--gallery&viewMode=story',
    );
    await expect(page.locator('tui-font, tr[ng-reflect-tui-font]')).toHaveCount(15);
});
