import {expect, test} from '@playwright/test';

for (const story of ['navigation-tabs--example-1', 'navigation-tabs--example-2']) {
    for (const direction of ['ltr', 'rtl']) {
        test(`native underline aligns and transitions in ${story} (${direction})`, async ({
            page,
        }) => {
            await page.setViewportSize({width: 1200, height: 900});
            await page.goto(`/iframe.html?id=${story}&viewMode=story`);
            const tabs = page.locator('tui-tabs').first();

            await expect(tabs).toBeVisible();
            await tabs.evaluate((element, dir) => {
                element.parentElement!.dir = dir;
                element.style.setProperty('--tui-duration', '10s');
                element.style.setProperty('--tui-curve-productive-standard', 'linear');
            }, direction);
            const first = tabs.getByRole('button', {name: 'Maps', exact: true});
            const last = tabs.getByRole('button', {name: 'Settings', exact: true});

            for (const target of [last, first]) {
                await target.focus();
                await target.press('Enter');
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
                                                .pseudoElement === '::before',
                                    ).length,
                        ),
                    )
                    .toBeGreaterThan(0);
                const positions = await tabs.evaluate((element) => {
                    const animations = element
                        .getAnimations({subtree: true})
                        .filter(
                            (animation) =>
                                animation instanceof CSSTransition &&
                                (animation.effect as KeyframeEffect).pseudoElement ===
                                    '::before',
                        );

                    animations.forEach((animation) => {
                        animation.pause();
                        animation.currentTime = 0;
                    });
                    const start = Number.parseFloat(
                        getComputedStyle(element, '::before').left,
                    );

                    animations.forEach((animation) => {
                        animation.currentTime = 5000;
                    });
                    const middle = Number.parseFloat(
                        getComputedStyle(element, '::before').left,
                    );

                    animations.forEach((animation) => animation.finish());

                    return {
                        start,
                        middle,
                        end: Number.parseFloat(
                            getComputedStyle(element, '::before').left,
                        ),
                        width: Number.parseFloat(
                            getComputedStyle(element, '::before').width,
                        ),
                    };
                });

                expect(positions.middle).toBeGreaterThan(
                    Math.min(positions.start, positions.end),
                );
                expect(positions.middle).toBeLessThan(
                    Math.max(positions.start, positions.end),
                );
                const expected = await target.evaluate((element) => ({
                    left: element.offsetLeft,
                    width: element.offsetWidth,
                }));

                expect(positions.end).toBeCloseTo(expected.left, 0);
                expect(positions.width).toBeCloseTo(expected.width, 0);
            }
        });
    }
}

test('TabsWithMore preserves the selected line while opening More and exposes a selected hidden tab', async ({
    page,
}) => {
    await page.setViewportSize({width: 480, height: 900});
    await page.goto('/iframe.html?id=navigation-tabs--example-2&viewMode=story');
    const wrapper = page.locator('tui-tabs-with-more');
    const tabs = wrapper.locator('tui-tabs');
    const more = wrapper.locator('button.t-more');

    await expect(more).toBeVisible();
    const selectedWidth = await tabs
        .locator('button._active')
        .first()
        .evaluate((element) => element.offsetWidth);

    await more.click();
    await expect(more).toHaveClass(/_active/);
    await expect
        .poll(async () =>
            tabs.evaluate((element) =>
                Number.parseFloat(getComputedStyle(element, '::before').width),
            ),
        )
        .toBeCloseTo(selectedWidth, 0);
    await page
        .locator('tui-dropdown')
        .getByRole('button', {name: 'Trash', exact: true})
        .click();
    const selected = tabs.getByRole('button', {name: 'Trash', exact: true});

    await expect(selected).toHaveClass(/_active/);
    await expect
        .poll(async () =>
            tabs.evaluate((element) =>
                Number.parseFloat(getComputedStyle(element, '::before').width),
            ),
        )
        .toBeCloseTo(await selected.evaluate((element) => element.offsetWidth), 0);
});

for (const direction of ['ltr', 'rtl']) {
    for (const side of ['start', 'end']) {
        test(`vertical indicator moves both ways (${direction}, ${side})`, async ({
            page,
        }) => {
            await page.goto('/iframe.html?id=navigation-tabs--example-6&viewMode=story');
            const tabs = page.locator('tui-tabs[vertical]').first();

            await expect(tabs).toBeVisible();
            await tabs.evaluate(
                (element, options) => {
                    element.parentElement!.dir = options.direction;
                    element.setAttribute('data-vertical', options.side);
                    element.style.setProperty('--tui-duration', '10s');
                    element.style.setProperty(
                        '--tui-curve-productive-standard',
                        'linear',
                    );
                },
                {direction, side},
            );
            const buttons = tabs.locator('[tuiTab]');

            for (const target of [buttons.nth(2), buttons.first()]) {
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
                                                .pseudoElement === '::before',
                                    ).length,
                        ),
                    )
                    .toBeGreaterThan(0);
                const positions = await tabs.evaluate((element) => {
                    const animations = element
                        .getAnimations({subtree: true})
                        .filter(
                            (animation) =>
                                animation instanceof CSSTransition &&
                                (animation.effect as KeyframeEffect).pseudoElement ===
                                    '::before',
                        );

                    animations.forEach((animation) => {
                        animation.pause();
                        animation.currentTime = 0;
                    });
                    const start = Number.parseFloat(
                        getComputedStyle(element, '::before').top,
                    );

                    animations.forEach((animation) => {
                        animation.currentTime = 5000;
                    });
                    const middle = Number.parseFloat(
                        getComputedStyle(element, '::before').top,
                    );

                    animations.forEach((animation) => animation.finish());
                    const style = getComputedStyle(element, '::before');

                    return {
                        start,
                        middle,
                        end: Number.parseFloat(style.top),
                        height: Number.parseFloat(style.height),
                        left: Number.parseFloat(style.left),
                    };
                });

                const expected = await target.evaluate((element) => ({
                    top: element.offsetTop,
                    height: element.offsetHeight,
                }));

                expect(positions.middle).toBeGreaterThan(
                    Math.min(positions.start, positions.end),
                );
                expect(positions.middle).toBeLessThan(
                    Math.max(positions.start, positions.end),
                );
                expect(positions.end).toBeCloseTo(expected.top, 0);
                expect(positions.height).toBeCloseTo(expected.height, 0);
                const onLeft = (side === 'start') === (direction === 'rtl');

                expect(positions.left).toBeCloseTo(
                    onLeft
                        ? 0
                        : await tabs.evaluate((element) => element.clientWidth - 2),
                    0,
                );
            }
        });
    }
}

test('vertical indicator follows keyboard selection and multiline resizing', async ({
    page,
}) => {
    await page.goto('/iframe.html?id=navigation-tabs--example-6&viewMode=story');
    const tabs = page.locator('tui-tabs[vertical]').first();
    const buttons = tabs.locator('[tuiTab]');

    await expect(tabs).toBeVisible();
    await tabs.evaluate((element) => element.style.setProperty('--tui-duration', '0s'));
    await buttons.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(buttons.nth(1)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(buttons.nth(1)).toHaveClass(/_active/);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(buttons.nth(2)).toHaveClass(/_active/);
    const initialHeight = await buttons
        .nth(2)
        .evaluate((element) => element.offsetHeight);

    await tabs.evaluate((element) => {
        element.style.width = '100px';
        element.style.minWidth = '100px';
    });
    await expect
        .poll(async () => buttons.nth(2).evaluate((element) => element.offsetHeight))
        .toBeGreaterThan(initialHeight);
    await expect
        .poll(async () =>
            tabs.evaluate((element) => {
                const active = element.querySelector<HTMLElement>('._active')!;
                const indicator = getComputedStyle(element, '::before');

                return (
                    Math.abs(Number.parseFloat(indicator.top) - active.offsetTop) +
                    Math.abs(Number.parseFloat(indicator.height) - active.offsetHeight)
                );
            }),
        )
        .toBeLessThan(1);
});
