import {expect, test} from '@playwright/test';

import {CATALOG} from '../src/generated/catalog';

for (const group of CATALOG) {
    test(`catalog: ${group.title}`, async ({page, request}) => {
        test.setTimeout(90_000);

        const response = await request.get('/index.json');
        const index: {entries: Record<string, {id: string; type: string}>} =
            await response.json();

        const entries = group.stories.map((story) => index.entries[story.id]);
        const errors: string[] = [];

        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (
                message.type() === 'error' &&
                /ERROR|NG\d{4}|NullInjectorError/.test(message.text())
            ) {
                errors.push(message.text());
            }
        });

        expect(entries).toHaveLength(group.examples);
        expect(entries.every((entry) => entry?.type === 'story')).toBe(true);

        for (const entry of entries) {
            if (!entry) {
                throw new Error(`Missing Storybook entry in ${group.title}`);
            }

            await page.goto(`/iframe.html?id=${entry.id}&viewMode=story`);
            await expect(page.locator('tui-example-story > :first-child')).toBeAttached();
            await expect(page.locator('.sb-errordisplay')).not.toBeVisible();
        }

        expect(errors).toEqual([]);
    });
}
