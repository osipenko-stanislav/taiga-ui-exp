import {expect, test} from '@playwright/test';

const preview =
    '/iframe.html?id=navigation-otus-experiment--student&viewMode=story&globals=brand:otus-university;direction:otus-brand';

test.use({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});

for (const preset of ['public', 'applicant', 'student', 'employee', 'tools']) {
    for (const width of [320, 390]) {
        test(`mobile ${preset} fits ${width}px and keeps navigation as placeholders`, async ({
            page,
        }) => {
            const errors: string[] = [];

            page.on('pageerror', (error) => errors.push(error.message));
            await page.setViewportSize({width, height: 700});
            await page.goto(preview.replace('--student', `--${preset}`));
            const bar = page.getByRole('navigation', {name: 'Мобильная навигация'});
            const menu = bar.getByRole('button', {name: 'Меню', exact: true});

            await expect(bar).toBeVisible();
            await expect(page.locator('.t-otus-navigation__header')).toHaveCount(0);
            await expect(menu).toBeDisabled();

            if (preset === 'public') {
                await expect(
                    bar.getByRole('link', {name: 'Личный кабинет'}),
                ).toHaveAttribute('href', 'https://my.centraluniversity.ru/');
            } else {
                await expect(
                    bar.getByRole('button', {name: 'Профиль', exact: true}),
                ).toBeDisabled();
            }

            await menu.dispatchEvent('click');
            await expect(page.locator('tui-dropdown')).toHaveCount(0);
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth),
            ).toBeLessThanOrEqual(width);
            await expect
                .poll(async () => {
                    const bounds = await bar.boundingBox();

                    return bounds!.y + bounds!.height;
                })
                .toBeLessThanOrEqual(700);
            const bounds = await bar.boundingBox();

            expect(bounds!.x).toBeGreaterThanOrEqual(0);
            expect(bounds!.y).toBeGreaterThanOrEqual(0);
            expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
            expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(700);
            expect(errors).toEqual([]);
        });
    }
}

test('mobile placeholders fit short viewports and desktop replaces them at 1024px', async ({
    page,
}) => {
    await page.setViewportSize({width: 320, height: 480});
    await page.goto(preview.replace('--student', '--tools'));
    const bar = page.getByRole('navigation', {name: 'Мобильная навигация'});

    await expect(bar).toBeInViewport();
    await expect(page.getByRole('button', {name: 'Меню', exact: true})).toBeDisabled();
    await page.setViewportSize({width: 1023, height: 800});
    await expect(bar).toBeVisible();
    await page.setViewportSize({width: 1024, height: 800});
    await expect(bar).toHaveCount(0);
    await expect(page.locator('.t-otus-navigation__header')).toBeVisible();
    await expect(
        page.getByRole('complementary', {name: 'Сервисы и инструменты'}),
    ).toBeVisible();
    await expect(page.locator('tui-dropdown')).toHaveCount(0);
});
