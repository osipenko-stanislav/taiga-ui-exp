import {expect, test} from '@playwright/test';

test('catalog filters all four OTUS sets and serves their SVGs', async ({
    page,
    request,
}) => {
    await page.goto('/iframe.html?id=foundations-tokens--icons&viewMode=story');

    for (const [set, count] of [
        ['outline', 1211],
        ['flat', 1207],
        ['level', 3],
        ['syntax', 16],
    ] as const) {
        await page.getByRole('combobox', {name: 'Набор иконок'}).selectOption(set);
        await expect(page.getByRole('status')).toHaveText(`Найдено ${count} иконок`);
        const name = await page.locator('figcaption').first().innerText();
        const response = await request.get(
            `/assets/taiga-ui/icons/${name.replace('@otus.', '').replaceAll('.', '/')}.svg`,
        );

        expect(response.status()).toBe(200);
        expect(await response.text()).toContain('<svg');
    }
});

test('examples and built-in controls load only the OTUS icon sets', async ({page}) => {
    const missing: string[] = [];
    const errors: string[] = [];
    const urls = new Set<string>();

    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
        if (response.url().includes('/assets/taiga-ui/icons/')) {
            urls.add(response.url());

            if (response.status() !== 200) {
                missing.push(response.url());
            }
        }
    });

    for (const id of [
        'components-button--with-icons',
        'components-buttons-button--example-3',
        'components-icon--api-preview',
        'components-icon--example-4',
        'components-icon--example-8',
        'components-textfield--filled',
        'components-modals-dialog--example-1',
    ]) {
        await page.goto(
            `/iframe.html?id=${id}&viewMode=story&globals=direction:otus-brand`,
        );
        await expect(page.locator('tui-root main > :first-child')).toBeAttached();
        await expect(page.locator('.sb-errordisplay')).not.toBeVisible();

        if (id.includes('dialog')) {
            await page.getByRole('button', {name: 'Default button', exact: true}).click();
            await expect(page.locator('tui-dialog')).toBeVisible();
        }
    }

    expect(errors).toEqual([]);
    expect(missing).toEqual([]);
    expect(urls.size).toBeGreaterThan(5);

    for (const url of urls) {
        expect(new URL(url).pathname).toMatch(
            /\/assets\/taiga-ui\/icons\/(flat|outline|level|syntax)\//,
        );
    }
});
