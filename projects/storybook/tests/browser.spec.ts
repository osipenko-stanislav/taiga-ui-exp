import {expect, test} from '@playwright/test';

import {CATALOG} from '../src/generated/catalog';

test('renders native multi-select without unsupported readonly property bindings', async ({
    page,
}) => {
    const errors: string[] = [];

    page.on('console', (message) => {
        if (message.type() === 'error' && message.text().includes('NG0303')) {
            errors.push(message.text());
        }
    });

    await page.goto('/iframe.html?id=form-inputs-inputchip--example-8&viewMode=story');
    await expect(page.locator('select[multiple]')).toBeVisible();
    expect(errors).toEqual([]);
});

test('renders a source component inside the Taiga root', async ({page}) => {
    await page.goto('/iframe.html?id=components-button--playground&viewMode=story');
    await expect(page.locator('tui-root button[tuiButton]')).toHaveText('Continue');
    await expect(page.locator('tui-root')).toHaveCount(1);
    await expect(page.locator('button[tuiButton]')).toHaveCSS('height', '56px');
});

test('renders every story without Angular errors', async ({page, request}) => {
    const response = await request.get('/index.json');
    const index: {entries: Record<string, {id: string; type: string}>} =
        await response.json();

    const errors: string[] = [];
    const catalogIds = new Set<string>(
        CATALOG.flatMap((group) => group.stories.map((story) => story.id)),
    );

    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error' && message.text().includes('ERROR')) {
            errors.push(message.text());
        }
    });

    for (const entry of Object.values(index.entries)) {
        if (entry.type !== 'story' || catalogIds.has(entry.id)) {
            continue;
        }

        await page.goto(`/iframe.html?id=${entry.id}&viewMode=story`);
        await expect(
            page.locator('tui-root main').first().locator(':scope > :first-child'),
        ).toBeAttached();
        await expect(page.locator('.sb-errordisplay')).not.toBeVisible();
    }

    expect(errors).toEqual([]);
});

test('edits and clears the textfield', async ({page}) => {
    await page.goto('/iframe.html?id=components-textfield--filled&viewMode=story');
    const input = page.locator('input[tuiInput]');

    await expect(input).toHaveValue('Angular');
    await input.fill('Storybook');
    await expect(input).toHaveValue('Storybook');
    await page.getByRole('button', {name: 'Clear'}).click();
    await expect(input).toHaveValue('');
});

test('toggles a checkbox and preserves disabled and indeterminate states', async ({
    page,
}) => {
    await page.goto('/iframe.html?id=components-checkbox--playground&viewMode=story');
    const checkbox = page.getByRole('checkbox');

    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
    await page.goto('/iframe.html?id=components-checkbox--indeterminate&viewMode=story');
    await expect(checkbox).toBeChecked({indeterminate: true});
    await page.goto(
        '/iframe.html?id=components-checkbox--disabled-checked&viewMode=story',
    );
    await expect(checkbox).toBeDisabled();
    await expect(checkbox).toBeChecked();
});

for (const theme of ['light', 'dark']) {
    test(`opens and selects a dropdown option in ${theme} theme`, async ({page}) => {
        await page.goto(
            `/iframe.html?id=components-textfield--with-dropdown&viewMode=story&globals=theme:${theme}`,
        );
        const input = page.locator('input[tuiInput]');

        await input.focus();
        await input.press('ArrowDown');
        const dropdown = page.locator('tui-dropdown');

        await expect(dropdown).toBeVisible();

        if (theme === 'dark') {
            await expect(dropdown).toHaveAttribute('tuiTheme', 'dark');
        } else {
            await expect(dropdown).not.toHaveAttribute('tuiTheme', 'dark');
        }

        await expect(page.locator('body')).toHaveCSS(
            'background-color',
            theme === 'dark' ? 'rgb(10, 10, 11)' : 'rgb(255, 255, 255)',
        );
        await dropdown.getByRole('option', {name: 'Angular', exact: true}).click();
        await expect(input).toHaveValue('Angular');
        await expect(dropdown).not.toBeVisible();
    });
}

test('updates a component through controls and switches the theme from the toolbar', async ({
    page,
}) => {
    await page.goto('/?path=/story/components-button--playground');
    const canvas = page.frameLocator('#storybook-preview-iframe');
    const button = canvas.locator('button[tuiButton]');

    await expect(button).toHaveText('Continue');
    await page
        .getByRole('row')
        .filter({has: page.getByText('label', {exact: true})})
        .getByRole('textbox')
        .fill('Save');
    await expect(button).toHaveText('Save');
    await page.getByRole('button', {name: 'Light', exact: true}).click();
    await page.getByText('Dark', {exact: true}).click();
    await expect(canvas.locator('body')).toHaveAttribute('tuiTheme', 'dark');
    await page.getByRole('button', {name: 'Dark', exact: true}).click();
    await page.getByText('Light', {exact: true}).click();
    await expect(canvas.locator('body')).not.toHaveAttribute('tuiTheme', 'dark');
});
