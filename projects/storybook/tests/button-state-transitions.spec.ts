import {expect, test} from '@playwright/test';

for (const direction of ['otus-core', 'otus-brand']) {
    for (const variant of [
        {appearance: 'secondary', mode: 'invalid', property: 'color'},
        {appearance: 'primary-destructive', mode: '', property: 'filter'},
    ]) {
        test(`${variant.appearance} interpolates ${variant.property} on hover and leave in ${direction}`, async ({
            page,
        }) => {
            await page.goto(
                `/iframe.html?id=components-buttons-button--api-preview&viewMode=story&globals=direction:${direction}`,
            );
            const button = page.locator('tui-doc-demo button[tuiButton]').first();

            await expect(button).toBeVisible();
            await button.evaluate((element, {appearance, mode}) => {
                element.setAttribute('data-appearance', appearance);
                element.setAttribute('data-mode', mode);
                element.style.transitionDuration = '10s';

                for (const animation of element.getAnimations()) {
                    animation.finish();
                }
            }, variant);

            for (const hovered of [true, false]) {
                const before = await button.evaluate(
                    (element, property) =>
                        getComputedStyle(element).getPropertyValue(property),
                    variant.property,
                );

                if (hovered) {
                    await button.hover();
                } else {
                    await page.mouse.move(0, 0);
                }

                const samples = await button.evaluate((element, property) => {
                    const transition = element
                        .getAnimations()
                        .find(
                            (animation) =>
                                animation instanceof CSSTransition &&
                                animation.transitionProperty === property,
                        );

                    if (!transition) {
                        return null;
                    }

                    transition.pause();
                    transition.currentTime = 5000;
                    const middle = getComputedStyle(element).getPropertyValue(property);

                    transition.finish();

                    return {
                        middle,
                        end: getComputedStyle(element).getPropertyValue(property),
                    };
                }, variant.property);

                expect(samples, `${variant.property}: hover=${hovered}`).not.toBeNull();
                expect(samples!.middle).not.toBe(before);
                expect(samples!.middle).not.toBe(samples!.end);
            }
        });
    }
}
