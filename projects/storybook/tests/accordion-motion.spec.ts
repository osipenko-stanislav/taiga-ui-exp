import {expect, test} from '@playwright/test';

for (const mode of ['otus-core', 'otus-brand']) {
    test(`accordion rows keep their joined outline on hover in ${mode}`, async ({
        page,
    }) => {
        await page.goto(
            `/iframe.html?id=components-accordion--api-preview&viewMode=story&globals=direction:${mode}`,
        );
        const rows = page.locator('tui-doc-demo tui-accordion > button[tuiAccordion]');

        await expect(rows.first()).toBeVisible();

        for (const row of await rows.all()) {
            await row.hover();
            await row.evaluate(async (element) => {
                await Promise.all(
                    element
                        .getAnimations({subtree: true})
                        .map(async (animation) => animation.finished),
                );
            });
            const backdrop = row.locator(':scope > .t-motion-backdrop');

            await expect(backdrop).toHaveCSS('top', '0px');
            await expect(backdrop).toHaveCSS('right', '0px');
            await expect(backdrop).toHaveCSS('bottom', '0px');
            await expect(backdrop).toHaveCSS('left', '0px');
            await expect(row).toHaveAttribute('data-button-motion', mode);
            await row.click();
            await expect(row).toHaveAttribute('aria-expanded', 'true');
            await row.click();
            await expect(row).toHaveAttribute('aria-expanded', 'false');
        }
    });
}
