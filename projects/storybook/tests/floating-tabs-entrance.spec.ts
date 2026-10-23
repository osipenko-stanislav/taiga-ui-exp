import {expect, test} from '@playwright/test';

const preview =
    '/iframe.html?id=navigation-tabs-otus-experimental--playground&viewMode=story';

for (const width of [390, 1200]) {
    test(`replay reveals the floating panel in phases and preserves tabs at ${width}px`, async ({
        page,
    }) => {
        await page.setViewportSize({width, height: 900});
        await page.goto(
            `${preview}&globals=theme:dark;brand:otus-design;direction:otus-brand`,
        );
        const group = page.locator('.t-floating-group');
        const tabs = group.locator('tui-tabs');
        const replay = page.getByRole('button', {name: 'Повторить появление'});

        await expect(group).toBeVisible();
        await tabs.locator('button').last().click();
        const original = await tabs.locator('button').last().elementHandle();

        await replay.click();
        await expect(group).toHaveAttribute('aria-busy', 'true');
        await expect(tabs).toHaveAttribute('inert', '');
        const phases = await group.evaluate((element) => {
            const animations = element
                .getAnimations({subtree: true})
                .filter(
                    (animation) =>
                        animation instanceof CSSAnimation &&
                        animation.animationName.includes('otusFloating'),
                );

            for (const animation of animations) {
                animation.pause();
            }

            const shape = animations.find(
                (animation) =>
                    animation instanceof CSSAnimation &&
                    animation.animationName.endsWith('otusFloatingShape'),
            )!;

            const duration = Number(shape.effect!.getComputedTiming().endTime);
            const sample = (
                fraction: number,
            ): {clip: string; content: number; labelAlpha: number} => {
                for (const animation of animations) {
                    animation.currentTime = duration * fraction;
                }

                return {
                    labelAlpha: Number(
                        getComputedStyle(element.querySelector('button')!).color.match(
                            /[\d.]+/g,
                        )?.[3] ?? 1,
                    ),
                    clip: getComputedStyle(element).clipPath,
                    content: Number(
                        getComputedStyle(element.querySelector('tui-tabs')!).opacity,
                    ),
                };
            };

            return {
                curve: shape.effect!.getKeyframes()[0]!.easing,
                start: sample(0),
                circle: sample(0.625),
                expanded: sample(0.98),
            };
        });

        expect(phases.curve).toBe('cubic-bezier(0.34, 1.36, 0.64, 1)');
        expect(phases.start.clip).not.toBe(phases.circle.clip);
        expect(phases.circle.clip).not.toBe(phases.expanded.clip);
        expect(phases.circle.content).toBe(1);
        expect(phases.circle.labelAlpha).toBe(0);
        expect(phases.expanded.labelAlpha).toBeGreaterThan(0.9);
        expect(phases.expanded.content).toBeGreaterThan(0.9);
        await replay.click();
        const restarted = await group.evaluate((element) =>
            element
                .getAnimations()
                .filter(
                    (animation) =>
                        animation instanceof CSSAnimation &&
                        animation.animationName.includes('otusFloating'),
                )
                .every((animation) => Number(animation.currentTime) < 100),
        );

        expect(restarted).toBe(true);
        await group.evaluate((element) =>
            element
                .getAnimations({subtree: true})
                .filter(
                    (animation) =>
                        animation instanceof CSSAnimation &&
                        animation.animationName.includes('otusFloating'),
                )
                .forEach((animation) => animation.finish()),
        );
        await expect(group).toHaveAttribute('aria-busy', 'false');
        await expect(tabs).not.toHaveAttribute('inert');
        await expect(tabs.locator('button').last()).toHaveClass(/_active/);
        expect(
            await tabs
                .locator('button')
                .last()
                .evaluate((element, previous) => element === previous, original),
        ).toBe(true);
        expect(
            await group.evaluate((element) => getComputedStyle(element).clipPath),
        ).toBe('none');
        const bounds = await group.boundingBox();

        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
        await expect(replay).toBeFocused();
    });
}

test('reduced motion keeps the floating tabs visible and usable without entrance animations', async ({
    page,
}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto(preview);
    const group = page.locator('.t-floating-group');

    await page.getByRole('button', {name: 'Повторить появление'}).click();
    await expect(group).toHaveAttribute('aria-busy', 'false');
    expect(
        await group.evaluate((element) =>
            element
                .getAnimations({subtree: true})
                .some(
                    (animation) =>
                        animation instanceof CSSAnimation &&
                        animation.animationName.includes('otusFloating'),
                ),
        ),
    ).toBe(false);
    await group.locator('button').last().click();
    await expect(group.locator('button').last()).toHaveClass(/_active/);
});

test('the entrance completes naturally and can play again', async ({page}) => {
    await page.goto(preview);
    const group = page.locator('.t-floating-group');
    const replay = page.getByRole('button', {name: 'Повторить появление'});

    for (let repetition = 0; repetition < 2; repetition++) {
        await replay.click();
        await expect(group).toHaveAttribute('aria-busy', 'true');
        await expect(group).toHaveAttribute('aria-busy', 'false');
        await expect(group.locator('tui-tabs')).toHaveCSS('opacity', '1');
    }
});

test('the light-theme entrance keeps its native surface and shadow for two real Storybook replays', async ({
    page,
}) => {
    await page.goto(
        '/?path=/story/navigation-tabs-otus-experimental--playground&globals=brand:otus-university;direction:otus-brand',
    );
    const frame = page.frameLocator('#storybook-preview-iframe');
    const group = frame.locator('.t-floating-group');
    const replay = frame.getByRole('button', {name: 'Повторить появление'});
    const canvas = await frame
        .locator('body')
        .evaluate((element) => getComputedStyle(element).backgroundColor);

    for (let repetition = 0; repetition < 2; repetition++) {
        await replay.click();
        await expect(group).toHaveAttribute('aria-busy', 'true');
        await expect
            .poll(
                async () =>
                    group.evaluate((element, background) => {
                        const styles = getComputedStyle(element);
                        const shape = element
                            .getAnimations()
                            .find(
                                (animation) =>
                                    animation instanceof CSSAnimation &&
                                    animation.animationName.endsWith('otusFloatingShape'),
                            );

                        const progress =
                            Number(shape?.currentTime) /
                            Number(shape?.effect?.getComputedTiming().endTime);

                        return (
                            progress > 0.15 &&
                            progress < 0.6 &&
                            Number(styles.opacity) > 0.9 &&
                            styles.backgroundColor === background &&
                            getComputedStyle(element.parentElement!).filter !== 'none'
                        );
                    }, canvas),
                {timeout: 1400, intervals: [50]},
            )
            .toBe(true);
        await expect(group).toHaveAttribute('aria-busy', 'false');
        await expect(group).toHaveCSS('background-color', canvas);
    }
});

test('a queued end event cannot stop a restarted entrance', async ({page}) => {
    await page.goto(preview);
    const group = page.locator('.t-floating-group');
    const replay = page.getByRole('button', {name: 'Повторить появление'});

    await replay.click();
    await replay.click();
    await group.evaluate((element) => {
        const shape = element
            .getAnimations()
            .find(
                (animation) =>
                    animation instanceof CSSAnimation &&
                    animation.animationName.endsWith('otusFloatingShape'),
            );

        if (!(shape instanceof CSSAnimation)) {
            throw new Error('Entrance animation did not start');
        }

        element.dispatchEvent(
            new AnimationEvent('animationend', {
                animationName: shape.animationName,
                bubbles: true,
            }),
        );
    });
    await expect(group).toHaveAttribute('aria-busy', 'true');
    await expect(group).toHaveAttribute('aria-busy', 'false');
});

for (const height of [660, 1000]) {
    test(`the seed starts below the ${height}px viewport and arrives before unfolding`, async ({
        page,
    }) => {
        await page.setViewportSize({width: 1200, height});
        await page.goto(preview);
        await page.getByRole('button', {name: 'Повторить появление'}).click();
        await expect(page.locator('.t-floating-group')).toHaveAttribute(
            'aria-busy',
            'true',
        );
        const phases = await page.locator('.t-floating-group').evaluate((element) => {
            const animations = element
                .getAnimations({subtree: true})
                .filter(
                    (animation) =>
                        animation instanceof CSSAnimation &&
                        animation.animationName.includes('otusFloating'),
                );

            const shape = animations.find(
                (animation) =>
                    animation instanceof CSSAnimation &&
                    animation.animationName.endsWith('otusFloatingShape'),
            )!;

            const duration = Number(shape.effect!.getComputedTiming().endTime);
            const sample = (fraction: number): {top: number; clip: string} => {
                animations.forEach((animation) => {
                    animation.pause();
                    animation.currentTime = duration * fraction;
                });

                return {
                    top: element.getBoundingClientRect().top,
                    clip: getComputedStyle(element).clipPath,
                };
            };

            return {
                height: innerHeight,
                start: sample(0),
                moving: sample(0.2),
                arrived: sample(0.4),
                circle: sample(0.6),
                end: sample(0.98),
            };
        });

        expect(phases.start.top).toBeGreaterThanOrEqual(phases.height);
        expect(phases.moving.clip).toBe(phases.start.clip);
        expect(phases.moving.top).toBeLessThan(phases.start.top);
        expect(phases.arrived.clip).toBe(phases.start.clip);
        expect(phases.arrived.top).toBeCloseTo(phases.end.top, 1);
        expect(phases.circle.top).toBeCloseTo(phases.end.top, 1);
        expect(phases.circle.clip).not.toBe(phases.start.clip);
    });
}

test('the ball mask never exceeds its container at the end of growth', async ({page}) => {
    await page.goto(preview);
    await page.getByRole('button', {name: 'Повторить появление'}).click();
    const group = page.locator('.t-floating-group');

    await expect(group).toHaveAttribute('aria-busy', 'true');
    const insets = await group.evaluate((element) => {
        const animations = element
            .getAnimations({subtree: true})
            .filter(
                (animation) =>
                    animation instanceof CSSAnimation &&
                    animation.animationName.includes('otusFloating'),
            );

        const shape = animations.find(
            (animation) =>
                animation instanceof CSSAnimation &&
                animation.animationName.endsWith('otusFloatingShape'),
        )!;

        const duration = Number(shape.effect!.getComputedTiming().endTime);
        const holder = document.createElement('div');
        const probe = document.createElement('div');

        holder.style.cssText = `position:fixed;height:${element.clientHeight}px;width:1px;pointer-events:none`;
        probe.style.position = 'absolute';
        holder.append(probe);
        document.body.append(holder);
        const result = [0.42, 0.46, 0.5, 0.54, 0.58, 0.6].map((fraction) => {
            animations.forEach((animation) => {
                animation.pause();
                animation.currentTime = duration * fraction;
            });
            const top = /^inset\((calc\([^)]*\)|-?[\d.]+(?:px|%)?)/.exec(
                getComputedStyle(element).clipPath,
            )![1]!;

            probe.style.top = top;

            return Number.parseFloat(getComputedStyle(probe).top);
        });

        holder.remove();

        return result;
    });

    expect(insets.every((inset) => inset >= -0.1)).toBe(true);
});
