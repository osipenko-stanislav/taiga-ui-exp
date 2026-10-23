import {expect, test} from '@playwright/test';

const story = 'navigation-tabs-otus-experimental--playground';
const preview = `/iframe.html?id=${story}&viewMode=story`;

for (const [width, height] of [
    [768, '40px'],
    [1023, '40px'],
    [1024, '48px'],
] as const) {
    test(`regular tabs use the mobile layout below 1024px at ${width}px`, async ({
        page,
    }) => {
        await page.setViewportSize({width, height: 900});
        await page.goto(preview);
        await expect(page.locator('tui-tabs[tuiOtusTabs]').first()).toHaveCSS(
            'height',
            height,
        );
    });
}

test('OTUS tabs preserve Taiga selection, disabled tabs and keyboard navigation', async ({
    page,
}) => {
    await page.goto(preview);
    const tabs = page.locator('tui-tabs[aria-label="Разделы программы"]');
    const buttons = tabs.locator('button');

    await expect(buttons.nth(0)).toHaveClass(/_active/);
    await buttons.nth(1).click();
    await expect(buttons.nth(1)).toHaveClass(/_active/);
    await expect(buttons.nth(1)).toHaveAttribute('data-appearance', 'accent');
    await expect(buttons.nth(0)).toHaveAttribute('data-appearance', 'outline-grayscale');
    await expect(buttons.nth(2)).toBeDisabled();
    await buttons.nth(1).press('ArrowRight');
    await expect(buttons.nth(3)).toBeFocused();
    await expect(buttons.nth(3)).toHaveCSS('outline-style', 'solid');
    await buttons.nth(3).press('Enter');
    await expect(buttons.nth(3)).toHaveClass(/_active/);
    await expect(
        page.locator('[aria-live="polite"]').filter({hasText: 'Выбран раздел:'}),
    ).toContainText('Преподаватели');
});

for (const direction of ['otus-core', 'otus-brand']) {
    test(`OTUS tabs reuse ${direction} motion without changing their geometry`, async ({
        page,
    }) => {
        await page.goto(`${preview}&globals=direction:${direction}`);
        const tabs = page.locator('tui-tabs[tuiOtusTabs]').first();
        const active = tabs.locator('button').first();
        const inactive = tabs.locator('button').nth(1);

        await expect(tabs).toHaveCSS('height', '48px');
        await expect(tabs).toHaveCSS('column-gap', '4px');
        await expect(active).toHaveCSS('border-radius', '8px');
        await expect(active).toHaveCSS('font-size', '16px');
        await expect(active).toHaveCSS('font-weight', '600');
        await expect(active).toHaveCSS('text-transform', 'uppercase');
        await expect(active).toHaveAccessibleName('Basic tab');
        await expect(active).toHaveAttribute('data-button-motion', direction);
        await expect(active.locator('.t-motion-backdrop')).toHaveCount(1);
        await active.hover();
        await expect(active.locator('.t-motion-backdrop')).toHaveCSS('top', '2px');

        if (direction === 'otus-brand') {
            await expect(active.locator('.t-motion-source')).toHaveCSS('opacity', '0');
            await expect(active.locator('.t-motion-letter')).toHaveCount(9);
            await expect(active.locator('.t-motion-letter').first()).not.toHaveCSS(
                'transform',
                'none',
            );
        } else {
            await expect(active.locator('.t-motion-source')).toHaveCSS('opacity', '1');
            await expect(active.locator('.t-motion-letter')).toHaveCount(0);
        }

        await inactive.hover();
        await expect(inactive.locator('.t-motion-backdrop')).toHaveCSS('top', '2px');
        await expect(inactive.locator('.t-motion-backdrop')).not.toHaveCSS(
            'box-shadow',
            'none',
        );
        const baseline = page.locator('tui-tabs[aria-label="Штатные табы Taiga"]');

        await expect(baseline.locator('.t-motion-backdrop')).toHaveCount(0);
        await expect(baseline.locator('button').first()).toHaveCSS(
            'text-transform',
            'none',
        );
        await expect(baseline).toHaveClass(/_underline/);
    });
}

test('switching direction updates existing tabs and preserves their selection', async ({
    page,
}) => {
    await page.goto(`/?path=/story/${story}&globals=direction:otus-core`);
    const frame = page.frameLocator('#storybook-preview-iframe');
    const tab = frame.locator('tui-tabs[aria-label="Разделы программы"] button').nth(1);

    await tab.click();
    await tab.evaluate((element) => element.setAttribute('data-test-original', 'true'));
    await page.getByRole('button', {name: 'otus-core', exact: true}).click();
    await page.getByRole('button', {name: 'otus-brand', exact: true}).click();
    await expect(tab).toHaveAttribute('data-button-motion', 'otus-brand');
    await expect(tab).toHaveAttribute('data-test-original', 'true');
    await expect(tab).toHaveClass(/_active/);
    await expect(tab.locator('.t-motion-letter').first()).toBeAttached();
});

for (const theme of ['light', 'dark']) {
    test(`active tabs follow existing school aliases in ${theme}`, async ({page}) => {
        for (const brand of [
            'otus-university',
            'otus-tech',
            'otus-design',
            'otus-nature',
        ]) {
            await page.goto(`${preview}&globals=theme:${theme};brand:${brand}`);
            const active = page.locator('tui-tabs[tuiOtusTabs] button').first();

            await expect(active).toHaveAttribute('data-appearance', 'accent');
            const expected = await active.evaluate((element) => {
                const probe = element.ownerDocument.createElement('span');

                probe.style.backgroundColor = 'var(--tui-background-accent-2)';
                element.append(probe);
                const color = getComputedStyle(probe).backgroundColor;

                probe.remove();

                return color;
            });

            await expect
                .poll(async () =>
                    active.evaluate(
                        (element) =>
                            getComputedStyle(element.parentElement!, '::before')
                                .backgroundColor,
                    ),
                )
                .toBe(expected);
        }
    });
}

test('mobile tabline keeps its scrolling and compact Figma dimensions', async ({
    page,
}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto(preview);
    const tabs = page.locator('tui-tabs[aria-label="Разделы программы"]');
    const last = tabs.locator('button').last();

    await expect(tabs).toHaveCSS('height', '40px');
    await expect(last).toHaveCSS('font-size', '12px');
    await expect(last).toHaveCSS('line-height', '18px');
    await last.click();
    await expect(last).toHaveClass(/_active/);
    expect(await tabs.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
});

test('the existing size input selects compact tabs on desktop', async ({page}) => {
    await page.goto(`${preview}&args=size:m`);
    const tabs = page.locator('tui-tabs[tuiOtusTabs]').first();

    await expect(tabs).toHaveAttribute('data-size', 'm');
    await expect(tabs).toHaveCSS('height', '40px');
    await expect(tabs.locator('button').first()).toHaveCSS('font-size', '12px');
});

test('the API size selector updates every tabline without resetting selection', async ({
    page,
}) => {
    await page.goto(preview);
    const tabs = page.locator('tui-tabs[aria-label="Разделы программы"]');
    const selected = tabs.locator('button').nth(1);
    const size = page
        .locator('tr[tuiDocAPIItem]')
        .filter({hasText: '[size]'})
        .locator('input');

    await selected.click();
    await size.click();
    await page.getByRole('option').filter({hasText: "'m'"}).click();
    await expect(page.getByRole('option')).toHaveCount(0);

    for (const tabline of await page.locator('tui-tabs').all()) {
        await expect(tabline).toHaveAttribute('data-size', 'm');
    }

    await expect(tabs).toHaveCSS('height', '40px');
    await expect(selected).toHaveClass(/_active/);
    await size.click();
    await page.getByRole('option').filter({hasText: "'l'"}).click();
    await expect(tabs).toHaveCSS('height', '48px');
    await expect(selected).toHaveClass(/_active/);
});

for (const theme of ['light', 'dark']) {
    for (const direction of ['otus-core', 'otus-brand']) {
        test(`Primary and Accent preserve selection in ${theme} ${direction}`, async ({
            page,
        }) => {
            await page.goto(`${preview}&globals=theme:${theme};direction:${direction}`);
            const tabs = page.locator('tui-tabs[aria-label="Разделы программы"]');
            const selected = tabs.locator('button').nth(1);
            const appearance = page
                .locator('tr[tuiDocAPIItem]')
                .filter({hasText: '[appearance]'})
                .locator('input');

            await selected.click();
            await appearance.click();
            await page.getByRole('option').filter({hasText: "'primary'"}).click();
            await expect(page.getByRole('option')).toHaveCount(0);

            for (const active of await page
                .locator('tui-tabs[tuiOtusTabs] button._active')
                .all()) {
                await expect(active).toHaveAttribute('data-appearance', 'primary');
            }

            const expected = await selected.evaluate((element) => {
                const probe = element.ownerDocument.createElement('span');

                probe.style.backgroundColor = 'var(--tui-background-accent-1)';
                probe.style.color = 'var(--tui-text-primary-on-accent-1)';
                element.append(probe);
                const styles = getComputedStyle(probe);
                const colors = {background: styles.backgroundColor, text: styles.color};

                probe.remove();

                return colors;
            });

            await expect
                .poll(async () =>
                    tabs.evaluate(
                        (element) =>
                            getComputedStyle(element, '::before').backgroundColor,
                    ),
                )
                .toBe(expected.background);
            await expect(selected).toHaveCSS('color', expected.text);
            await expect(selected).toHaveClass(/_active/);
            await expect(selected).toHaveAttribute('data-button-motion', direction);
            await expect(tabs.locator('button').first()).toHaveAttribute(
                'data-appearance',
                'outline-grayscale',
            );

            await appearance.click();
            await page.getByRole('option').filter({hasText: "'accent'"}).click();
            await expect(selected).toHaveAttribute('data-appearance', 'accent');
            await expect(selected).toHaveClass(/_active/);
            await tabs.locator('button').last().click();
            await expect(tabs.locator('button').last()).toHaveAttribute(
                'data-appearance',
                'accent',
            );
            await expect(selected).toHaveAttribute(
                'data-appearance',
                'outline-grayscale',
            );
        });
    }
}

for (const width of [390, 1200]) {
    test(`floating ButtonGroup stays at the bottom and scrolls its tabs at ${width}px`, async ({
        page,
    }) => {
        await page.setViewportSize({width, height: 900});
        await page.goto(`${preview}&globals=theme:dark;direction:otus-brand`);
        const group = page.locator('[tuiButtonGroup]');
        const tabs = group.locator('tui-tabs');
        const first = tabs.locator('button').first();
        const last = tabs.locator('button').last();

        await expect(group).toHaveAttribute('data-appearance', 'floating');
        await expect(group).toHaveCSS('border-radius', '16px');
        await expect(group).toHaveCSS('padding', '8px');
        await expect(first).toHaveAttribute('data-button-motion', 'otus-brand');
        await expect
            .poll(async () => {
                const bounds = await group.boundingBox();

                return bounds!.y + bounds!.height;
            })
            .toBeLessThanOrEqual(900);
        const initial = await group.boundingBox();

        expect(initial!.x).toBeGreaterThanOrEqual(0);
        expect(initial!.x + initial!.width).toBeLessThanOrEqual(width);
        expect(initial!.y + initial!.height).toBeGreaterThan(820);
        expect(initial!.y + initial!.height).toBeLessThanOrEqual(900);

        await first.focus();
        await first.press('ArrowRight');
        await expect(last).toBeFocused();
        await last.press('Enter');
        await expect(last).toHaveClass(/_active/);
        await expect(
            page
                .locator('[aria-live="polite"]')
                .filter({hasText: 'Выбрано направление:'}),
        ).toContainText('Дизайн');

        if (width === 390) {
            expect(await tabs.evaluate((element) => element.scrollLeft)).toBeGreaterThan(
                0,
            );
        }

        await page.evaluate(() =>
            window.scrollTo(0, document.documentElement.scrollHeight),
        );
        const scrolled = await group.boundingBox();

        expect(scrolled!.y + scrolled!.height).toBeGreaterThan(804);
        expect(scrolled!.y + scrolled!.height).toBeLessThanOrEqual(900);
        expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);
    });
}

for (const label of ['Разделы программы', 'Направления обучения', 'Штатные табы Taiga']) {
    test(`the shared background animates forward and backward in ${label}`, async ({
        page,
    }) => {
        await page.goto(preview);
        const tabs = page.locator(`tui-tabs[aria-label="${label}"]`);
        const buttons = tabs.locator('button');

        await expect(buttons.first()).toHaveClass(/_active/);
        await tabs.evaluate((element) => {
            element
                .getAnimations({subtree: true})
                .forEach((animation) => animation.finish());
            element.style.setProperty('--tui-duration', '10s');
            element.style.setProperty('--tui-curve-productive-standard', 'linear');
        });

        for (const target of [buttons.last(), buttons.first()]) {
            const before = await tabs.evaluate((element) =>
                Number.parseFloat(getComputedStyle(element, '::before').left),
            );

            await target.click();
            await expect(target).toHaveClass(/_active/);
            await expect
                .poll(async () =>
                    tabs.evaluate(
                        (element) =>
                            element
                                .getAnimations({subtree: true})
                                .filter(
                                    (animation) =>
                                        animation instanceof CSSTransition &&
                                        (animation.effect as KeyframeEffect)
                                            .pseudoElement === '::before' &&
                                        [
                                            'inline-size',
                                            'inset-inline-start',
                                            'left',
                                            'width',
                                        ].includes(animation.transitionProperty),
                                ).length,
                    ),
                )
                .toBeGreaterThan(0);
            const movement = await tabs.evaluate((element) => {
                const animations = element
                    .getAnimations({subtree: true})
                    .filter(
                        (animation) =>
                            animation instanceof CSSTransition &&
                            (animation.effect as KeyframeEffect).pseudoElement ===
                                '::before' &&
                            [
                                'inline-size',
                                'inset-inline-start',
                                'left',
                                'width',
                            ].includes(animation.transitionProperty),
                    );

                for (const animation of animations) {
                    animation.pause();
                    animation.currentTime = 5000;
                }

                const middle = Number.parseFloat(
                    getComputedStyle(element, '::before').left,
                );

                for (const animation of animations) {
                    animation.finish();
                }

                return {
                    count: animations.length,
                    middle,
                    end: Number.parseFloat(getComputedStyle(element, '::before').left),
                };
            });

            expect(movement.count).toBeGreaterThan(0);
            expect(movement.middle).toBeGreaterThan(Math.min(before, movement.end));
            expect(movement.middle).toBeLessThan(Math.max(before, movement.end));
            expect(movement.end).toBeCloseTo(
                await target.evaluate((element) => element.offsetLeft),
                0,
            );
        }
    });
}

test('reduced motion keeps labels readable without animated movement', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto(`${preview}&globals=direction:otus-brand`);
    const active = page.locator('tui-tabs[tuiOtusTabs] button').first();

    await active.hover();
    await expect(active).toHaveAccessibleName('Basic tab');
    await expect(active.locator('.t-motion-backdrop')).toHaveCSS(
        'transition-duration',
        '0s',
    );
    await expect(active.locator('.t-motion-letter').first()).toHaveCSS(
        'transform',
        'none',
    );
    expect(
        await active.evaluate(
            (element) =>
                getComputedStyle(element.parentElement!, '::before').transitionDuration,
        ),
    ).toBe('0s');
});
