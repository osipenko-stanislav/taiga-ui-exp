import {expect, test} from '@playwright/test';

const story =
    '/iframe.html?id=documentation-styles-colors-taiga-to-otus-mapping--table&viewMode=story&globals=theme:light;brand:otus-tech';

test('one compact mapping exposes the complete chain before scrolling', async ({
    page,
}) => {
    await page.setViewportSize({width: 1440, height: 900});
    await page.goto(story);
    await expect(
        page.getByRole('heading', {name: 'Маппинг цветов', exact: true}),
    ).toBeVisible();
    const row = page.locator('tr[data-token="--tui-background-accent-1"]');

    await expect(row).toContainText('--otus-background-accent-1');
    await expect(row).toContainText('--tui-background-accent-1');
    await expect(row).toContainText('graphite-black-925');
    expect((await row.boundingBox())!.y).toBeLessThan(600);
    await page
        .getByRole('searchbox', {name: 'Поиск токена или цвета'})
        .fill('--otus-background-accent-2');
    await expect(page.locator('.t-mapping-table tbody tr[data-token]')).toHaveCount(3);
});

test('editing stays next to its token and keeps the chain in view', async ({page}) => {
    await page.goto(story);
    await page
        .getByRole('searchbox', {name: 'Поиск токена или цвета'})
        .fill('--otus-background-accent-2');
    const row = page.locator('tr[data-token="--tui-background-accent-2"]');

    await row.getByRole('button', {name: 'Выбрать цвет', exact: true}).click();
    const editor = page.getByRole('region', {name: 'Выбор цвета'});

    await expect(editor).toBeVisible();
    expect(
        await row.evaluate((element) =>
            element.nextElementSibling?.classList.contains('t-editor-row'),
        ),
    ).toBe(true);
    await editor.getByLabel('Поиск в палитре OTUS').fill('#131315');
    await editor.getByRole('radio').check();
    await expect(row).toContainText('#131315');
    await expect(row).toContainText('Изменено');
    await editor.getByRole('button', {name: 'Закрыть выбор'}).click();
    await expect(editor).toHaveCount(0);
    await expect(
        row.getByRole('button', {name: 'Выбрать цвет', exact: true}),
    ).toBeFocused();
});

test('school comparison and semantic dependencies stay in the same mapping', async ({
    page,
}) => {
    await page.goto(story);
    const row = page.locator('tr[data-token="--tui-chart-categorical-00"]');

    await row.getByRole('button', {name: 'Перейти к --otus-background-accent-1'}).click();
    await expect(
        page.getByRole('searchbox', {name: 'Поиск токена или цвета'}),
    ).toHaveValue('--otus-background-accent-1');
    const primary = page.locator('tr[data-token="--tui-background-accent-1"]');

    await primary.getByText('Связи и школы', {exact: true}).click();
    await expect(primary.locator('[data-school]')).toHaveCount(4);
});

for (const width of [390, 1024]) {
    test(`mapping and inline palette fit at ${width}px`, async ({page}) => {
        await page.setViewportSize({width, height: 844});
        await page.goto(story);
        await page
            .getByRole('searchbox', {name: 'Поиск токена или цвета'})
            .fill('--otus-background-accent-2');
        await page
            .locator('tr[data-token="--tui-background-accent-2"]')
            .getByRole('button', {name: 'Выбрать цвет', exact: true})
            .click();
        await expect(page.getByRole('region', {name: 'Выбор цвета'})).toBeVisible();
        expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        ).toBe(true);
    });
}

test('the catalog lists one mapping and redirects the former OTUS page without losing modes', async ({
    page,
    request,
}) => {
    const response = await request.get('/index.json');
    const index: {entries: Record<string, {title: string}>} = await response.json();
    const mappings = Object.entries(index.entries).filter(
        ([id]) => id.includes('taiga-to-otus-mapping') || id.includes('otus-tokens--'),
    );

    expect(mappings.map(([id]) => id)).toEqual([
        'documentation-styles-colors-taiga-to-otus-mapping--table',
    ]);
    await page.goto(
        '/?path=/story/documentation-styles-colors-otus-tokens--table&globals=theme:dark;brand:otus-design',
    );
    await expect(page).toHaveURL(
        /path=%2Fstory%2Fdocumentation-styles-colors-taiga-to-otus-mapping--table/,
    );
    const frame = page.frameLocator('#storybook-preview-iframe');

    await expect(
        frame.getByRole('heading', {name: 'Маппинг цветов', exact: true}),
    ).toBeVisible();
    await expect(frame.locator('tui-root')).toHaveAttribute('data-brand', 'otus-design');
    await expect(frame.locator('tui-root')).toHaveAttribute('tuiTheme', 'dark');
});
