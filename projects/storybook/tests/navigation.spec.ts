import {expect, test} from '@playwright/test';

import {CATALOG} from '../src/generated/catalog';

test('sidebar follows the website sections and omits the old catalog hierarchy', async ({
    request,
}) => {
    const response = await request.get('/index.json');
    const index: {entries: Record<string, {type: string; title: string}>} =
        await response.json();

    const sections = new Set(
        Object.values(index.entries).map((entry) => entry.title.split('/')[0] ?? ''),
    );

    expect([...sections].sort((first, second) => first.localeCompare(second))).toEqual([
        'Charts',
        'Components',
        'Documentation',
        'Form',
        'Layout',
        'Navigation',
        'Overview',
        'Tools',
    ]);
    expect(
        CATALOG.some(
            (page) => page.title === 'Documentation/Styles/Typography/Text styles',
        ),
    ).toBe(true);
    expect(
        CATALOG.some((page) => page.title === 'Documentation/Customization/Appearances'),
    ).toBe(true);
    expect(
        CATALOG.some((page) => page.stories.some((story) => story.kind === 'api')),
    ).toBe(true);
});

test('style pages are grouped by subject and existing gallery links stay valid', async ({
    request,
}) => {
    const response = await request.get('/index.json');
    const index: {entries: Record<string, {title: string}>} = await response.json();
    const pages = {
        'documentation-styles-otus-global-colors--palette': 'Colors/Otus global colors',
        'documentation-styles-colors--text': 'Colors/Semantic colors',
        'foundations-colors--tokens': 'Colors/Tokens',
        'documentation-styles-typography--gallery': 'Typography/Text styles',
        'documentation-styles-control-typography--gallery':
            'Typography/Control typography',
        'foundations-typography--tokens': 'Typography/Tokens',
        'documentation-styles-breakpoints--example-1': 'Layout/Breakpoints',
        'foundations-dimensions--tokens': 'Layout/Sizes and radii',
        'documentation-styles-shadows--gallery': 'Effects/Shadows',
        'foundations-shadows--tokens': 'Effects/Shadow tokens',
        'foundations-motion--tokens': 'Effects/Motion',
        'foundations-icons--gallery': 'Icons',
        'foundations-tokens--other': 'CSS tokens',
    };

    for (const [id, title] of Object.entries(pages)) {
        expect(index.entries[id]?.title).toBe(`Documentation/Styles/${title}`);
    }

    expect(index.entries['foundations-injection--tokens']?.title).toBe(
        'Documentation/Customization/Injection tokens',
    );
});

test('API preview controls update the original button', async ({page}) => {
    await page.goto(
        '/iframe.html?id=components-buttons-button--api-preview&viewMode=story',
    );
    const button = page
        .locator('tui-doc-demo button[tuiButton]')
        .filter({hasText: 'Button'});

    await expect(button).not.toHaveClass(/_loading/);
    await page.locator('input[id="[loading]"]').check();
    await expect(button).toHaveClass(/_loading/);
    await page.locator('input[id="[loading]"]').uncheck();
    await expect(button).not.toHaveClass(/_loading/);
});

test('customization portal preview adds and removes content in its host', async ({
    page,
}) => {
    await page.goto(
        '/iframe.html?id=documentation-customization-portals--example-1&viewMode=story',
    );
    await page.getByRole('button', {name: 'Add', exact: true}).click();
    await expect(page.locator('custom-host')).toContainText('Hello Taiga UI');
    await page.getByRole('button', {name: 'Remove', exact: true}).click();
    await expect(page.locator('custom-host')).not.toContainText('Hello Taiga UI');
});

for (const [number, content] of [
    [1, 'Lazy loaded dialog content'],
    [2, 'Eager loaded dialog content'],
    [3, 'Dialog content via named outlet'],
] as const) {
    test(`routable dialog example ${number} opens its dialog`, async ({page}) => {
        const errors: string[] = [];

        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(
            `/iframe.html?id=components-modals-dialog-routable--example-${number}&viewMode=story`,
        );
        await page.getByRole('button', {name: 'Open dialog', exact: true}).click();
        await expect(page.locator('tui-dialog')).toContainText(content);
        expect(errors).toEqual([]);
    });
}
