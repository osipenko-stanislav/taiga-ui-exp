import {expect, test} from '@playwright/test';

test('template dialog buttons keep Brand mode after closing and reopening', async ({
    page,
}) => {
    await page.goto(
        '/iframe.html?id=components-modals-dialog--api-preview&viewMode=story&globals=direction:otus-brand',
    );
    const show = page.getByRole('button', {name: 'Show', exact: true});

    for (let attempt = 0; attempt < 2; attempt++) {
        await show.click();
        const dialog = page.locator('tui-dialog');

        await expect(dialog).toBeVisible();

        for (const name of ['Cancel', 'Submit']) {
            const action = dialog.getByRole('button', {name, exact: true});

            await expect(action.locator('.t-motion-backdrop')).toHaveCount(1);
            await expect(action.locator('.t-motion-letter')).toHaveCount(6);
        }

        await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
        await expect(dialog).toHaveCount(0);
    }
});

for (const direction of ['otus-core', 'otus-brand']) {
    test(`dialog action buttons inherit ${direction} mode`, async ({page}) => {
        await page.goto(
            `/iframe.html?id=components-modals-dialog--example-1&viewMode=story&globals=direction:${direction}`,
        );
        await page.getByRole('button', {name: 'Default button', exact: true}).click();
        const action = page.locator('tui-dialog footer button[tuiButton]');

        await expect(action).toBeVisible();
        await expect(action.locator('.t-motion-backdrop')).toHaveCount(1);
        await expect(action.locator('.t-motion-letter')).toHaveCount(
            direction === 'otus-brand' ? 2 : 0,
        );
        await action.hover();
        await expect(action.locator('.t-motion-backdrop')).toHaveCSS('top', '2px');
    });
}

test('switches the buttons of an already open dialog without recreating it', async ({
    page,
}) => {
    await page.goto(
        '/?path=/story/components-modals-dialog--example-1&globals=direction:otus-core',
    );
    const frame = page.frameLocator('#storybook-preview-iframe');

    await frame.getByRole('button', {name: 'Default button', exact: true}).click();
    const action = frame.locator('tui-dialog footer button[tuiButton]');

    await expect(action).toBeVisible();
    await action.evaluate((element) =>
        element.setAttribute('data-test-marker', 'persistent'),
    );
    await page.getByTitle('Направление', {exact: true}).click();
    await page.getByText('otus-brand', {exact: true}).click();
    await expect(action.locator('.t-motion-letter')).toHaveCount(2);
    await expect(action).toHaveAttribute('data-test-marker', 'persistent');
    await page.getByTitle('Направление', {exact: true}).click();
    await page.getByText('otus-core', {exact: true}).click();
    await expect(action.locator('.t-motion-letter')).toHaveCount(0);
    await expect(action).toHaveAttribute('data-test-marker', 'persistent');
    await expect(action).toHaveAccessibleName('OK');
});
