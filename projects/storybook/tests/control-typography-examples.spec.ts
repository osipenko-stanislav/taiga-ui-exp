import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
    await page.goto(
        '/iframe.html?id=documentation-styles-control-typography--gallery&viewMode=story&globals=direction:otus-brand',
    );
    await expect(
        page.getByRole('heading', {name: 'Типографика контролов'}),
    ).toBeVisible();
});

test('only supported button sizes and explained field states are shown', async ({
    page,
}) => {
    await expect(page.locator('[data-sample="button-xl"]')).toHaveCount(0);
    await expect(page.locator('[data-sample="input-m"] th')).toContainText(
        'Поле заполнено',
    );
    await expect(page.locator('[data-sample="placeholder-m"] th')).toContainText(
        'Пустое поле',
    );
    await expect(page.locator('tui-textfield[data-size="s"] label')).toHaveCount(0);
});

test('segmented examples fit their content and remain selectable', async ({page}) => {
    await page.evaluate(async () => document.fonts.ready);

    for (const size of ['s', 'm', 'l']) {
        const segmented = page.locator(`[data-sample="segmented-${size}"] tui-segmented`);
        const unusedWidth = await segmented.evaluate(
            (element) =>
                element.getBoundingClientRect().width -
                Array.from(element.querySelectorAll('button')).reduce(
                    (width, button) => width + button.getBoundingClientRect().width,
                    0,
                ),
        );

        expect(unusedWidth).toBeLessThan(1);
        await segmented.getByRole('button', {name: 'Избранные', exact: true}).click();
        await expect(
            segmented.getByRole('button', {name: 'Избранные', exact: true}),
        ).toHaveClass(/tui-segmented_active/);
    }
});

test('label description belongs to a labelled checkbox', async ({page}) => {
    const sample = page.locator('[data-sample="description"]');

    await expect(sample.locator('input[tuiCheckbox]')).toHaveCount(1);
    await expect(sample.locator('[tuiSubtitle]')).toHaveText(
        'Новости и важные объявления',
    );
    await expect(sample.locator('th')).toContainText('Описание под подписью');
});

test('source tokens and component overrides are documented separately', async ({
    page,
}) => {
    await expect(
        page.getByRole('columnheader', {name: 'Токен / переопределение'}),
    ).toBeVisible();
    await expect(page.locator('[data-sample="button-m"] .t-token')).toHaveText(
        '--tui-typography-body-m',
    );
    await expect(page.locator('[data-sample="button-m"] .t-override')).toHaveText(
        'font-weight: 500',
    );
    await expect(page.locator('[data-sample="input-m"] .t-token')).toHaveText(
        '--tui-typography-ui-s',
    );
    await expect(page.locator('[data-sample="segmented-l"] .t-token')).toHaveText(
        '--tui-typography-body-l',
    );
    await expect(page.locator('[data-sample="description"] .t-token')).toHaveText(
        '--tui-typography-ui-s',
    );
    await expect(page.locator('[data-sample="link"] .t-override')).toContainText(
        'inherit',
    );
    const label = page.locator('[data-sample="field-label-l"]');

    await expect(label.locator('.t-token')).toHaveText('--tui-typography-ui-m');
    await label.locator('input').focus();
    await expect(label.locator('.t-token')).toHaveText('--tui-typography-ui-s');
    await label.locator('input').blur();
    await expect(label.locator('.t-token')).toHaveText('--tui-typography-ui-m');
});
