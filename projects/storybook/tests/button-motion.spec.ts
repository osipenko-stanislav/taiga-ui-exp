import {expect, test} from '@playwright/test';

test('Brand letter positions preserve native Core kerning and ligatures', async ({
    page,
}) => {
    await page.goto(
        '/?path=/story/components-button--playground&globals=direction:otus-brand',
    );
    await page.locator('#control-label').fill('AVATAR To office Привет');
    const button = page
        .frameLocator('#storybook-preview-iframe')
        .locator('button[tuiButton]');

    await expect(button).toHaveAccessibleName('AVATAR To office Привет');
    const differences = await button.evaluate(async (element) => {
        await element.ownerDocument.fonts.ready;
        const source = element.querySelector('.t-motion-source')!;
        const text = source.firstChild!;
        const range = element.ownerDocument.createRange();
        let offset = text.textContent!.indexOf(text.textContent!.trim());

        return Array.from(element.querySelectorAll('.t-motion-letter'), (letter) => {
            const segment = letter.getAttribute('data-letter')!;

            range.setStart(text, offset);
            range.setEnd(text, offset + segment.length);
            offset += segment.length;
            const expected = range.getBoundingClientRect();
            const actual = letter.getBoundingClientRect();

            return {
                letter: segment,
                left: actual.left - expected.left,
                width: actual.width - expected.width,
            };
        });
    });

    expect(differences).toHaveLength(23);

    for (const difference of differences) {
        expect(Math.abs(difference.left), `${difference.letter} position`).toBeLessThan(
            0.1,
        );
        expect(Math.abs(difference.width), `${difference.letter} width`).toBeLessThan(
            0.1,
        );
    }
});

test('OTUS motion tokens configure backdrop and letter transitions', async ({page}) => {
    await page.goto(
        '/iframe.html?id=components-buttons-button--api-preview&viewMode=story&globals=direction:otus-brand',
    );
    const button = page.locator('tui-doc-demo button[tuiButton]').first();

    await expect(button).toBeVisible();
    await button.evaluate((element) => {
        element.style.setProperty('--otus-text-roll', '1200ms linear');
        element.style.setProperty('--otus-button-bg', '500ms ease-in-out');
    });
    await expect(button.locator('.t-motion-backdrop')).toHaveCSS(
        'transition-duration',
        '0.5s',
    );
    await expect(button.locator('.t-motion-backdrop')).toHaveCSS(
        'transition-timing-function',
        'ease-in-out',
    );
    await expect(button.locator('.t-motion-letter').first()).toHaveCSS(
        'transition-duration',
        '1.2s',
    );
    await expect(button.locator('.t-motion-letter').first()).toHaveCSS(
        'transition-timing-function',
        'linear',
    );
});

test('OTUS motion tokens appear beside Taiga tokens in the Animation styles', async ({
    page,
}) => {
    await page.goto('/iframe.html?id=foundations-motion--tokens&viewMode=story');
    await expect(page.locator('[data-token="--otus-text-roll"]')).toContainText(
        '800ms cubic-bezier(0.625, 0.05, 0, 1)',
    );
    await expect(page.locator('[data-token="--otus-button-bg"]')).toContainText(
        '300ms cubic-bezier(0.2, 0, 0.4, 0.9)',
    );
});

test('switches API Preview modes without recreating the button', async ({page}) => {
    await page.goto(
        '/?path=/story/components-buttons-button--api-preview&globals=direction:otus-core',
    );
    const button = page
        .frameLocator('#storybook-preview-iframe')
        .locator('tui-doc-demo button[tuiButton]')
        .first();

    await expect(button).toBeVisible();
    await button.evaluate((element) =>
        element.setAttribute('data-test-marker', 'persistent'),
    );
    await page.getByTitle('Направление', {exact: true}).click();
    await page.getByText('otus-brand', {exact: true}).click();
    await expect(button.locator('.t-motion-letter')).toHaveCount(6);
    await expect(button).toHaveAttribute('data-test-marker', 'persistent');
    await page.getByTitle('Направление', {exact: true}).click();
    await page.getByText('otus-core', {exact: true}).click();
    await expect(button.locator('.t-motion-letter')).toHaveCount(0);
    await expect(button).toHaveAttribute('data-test-marker', 'persistent');
    await expect(button).toHaveAccessibleName('Button');
});

test('all nine button examples use shared motion without runtime errors', async ({
    page,
}) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => errors.push(error.message));

    for (let example = 1; example <= 9; example++) {
        await page.goto(
            `/iframe.html?id=components-buttons-button--example-${example}&viewMode=story&globals=direction:otus-brand`,
        );
        const button = page.locator('tui-example-story [tuiButton]').first();

        await expect(button).toBeVisible();
        await expect(button.locator(':scope > .t-motion-backdrop')).toHaveCount(1);
        await expect(button.locator('.t-motion-letter').first()).toBeAttached();
    }

    expect(errors).toEqual([]);
});

for (const direction of ['otus-core', 'otus-brand']) {
    test(`API Preview shares button motion in ${direction} mode`, async ({page}) => {
        await page.goto(
            `/iframe.html?id=components-buttons-button--api-preview&viewMode=story&globals=direction:${direction}`,
        );
        const button = page.locator('tui-doc-demo button[tuiButton]').first();

        await expect(button).toBeVisible();
        await expect(button.locator('.t-motion-backdrop')).toHaveCount(1);
        await expect(button).toHaveAccessibleName('Button');
        await button.hover();
        await expect(button.locator('.t-motion-backdrop')).toHaveCSS('top', '2px');
        await expect(button.locator('.t-motion-letter')).toHaveCount(
            direction === 'otus-brand' ? 6 : 0,
        );
    });
}

test('backdrop motion follows Taiga duration and easing tokens', async ({page}) => {
    await page.goto('/iframe.html?id=components-button--playground&viewMode=story');
    const button = page.getByRole('button', {name: 'Continue', exact: true});
    const backdrop = button.locator('.t-motion-backdrop');

    await expect(button).toBeVisible();
    await button.evaluate((element) => {
        const theme = element.ownerDocument.documentElement;

        theme.style.setProperty('--tui-duration', '720ms');
        theme.style.setProperty(
            '--tui-curve-productive-standard',
            'cubic-bezier(0.25, 0.1, 0.25, 1)',
        );
    });
    await expect(backdrop).toHaveCSS(
        'transition-property',
        'inset, background-color, box-shadow',
    );
    await expect(backdrop).toHaveCSS('transition-duration', '0.72s');
    await expect(backdrop).toHaveCSS(
        'transition-timing-function',
        'cubic-bezier(0.25, 0.1, 0.25, 1)',
    );
});

test('switching modes preserves the label text and button width', async ({page}) => {
    const widths: number[] = [];

    for (const direction of ['otus-core', 'otus-brand']) {
        await page.goto(
            `/iframe.html?id=components-button--with-icons&viewMode=story&globals=direction:${direction}`,
        );
        const button = page.getByRole('button', {name: 'Continue', exact: true});

        await expect(button.locator('.t-motion-label')).toHaveText('Continue');
        widths.push((await button.boundingBox())!.width);
    }

    expect(widths[1]).toBeCloseTo(widths[0]!, 0);
});

test('keeps the native Taiga appearance and metrics in every interaction state', async ({
    page,
}) => {
    for (const story of ['playground', 'hover', 'active', 'disabled', 'loading']) {
        await page.goto(
            `/iframe.html?id=components-button--${story}&viewMode=story&globals=direction:otus-brand`,
        );
        const button = page.getByRole('button', {name: 'Continue', exact: true});

        await expect(button).toBeVisible();
        const reference = await button.evaluate((element) => {
            const native = element.cloneNode(false) as HTMLElement;

            native.classList.remove('t-motion-button', 't-motion-hover');
            native.textContent = 'Continue';
            element.parentElement!.append(native);
            const styles = getComputedStyle(native);
            const result = {
                background: styles.backgroundColor,
                radius: styles.borderRadius,
                padding: styles.padding,
                font: styles.font,
            };

            native.remove();

            return result;
        });

        const backdrop = button.locator('.t-motion-backdrop');

        await expect(backdrop).toHaveCSS('background-color', reference.background);
        await expect(backdrop).toHaveCSS('border-radius', reference.radius);
        await expect(backdrop).toHaveCSS('opacity', '1');
        await expect(button).toHaveCSS('padding', reference.padding);
        await expect(button).toHaveCSS('font', reference.font);
    }
});

for (const brand of ['otus-university', 'otus-tech', 'otus-design', 'otus-nature']) {
    for (const direction of ['otus-core', 'otus-brand']) {
        test(`${brand} / ${direction}: shrinks only the backdrop and rolls only Brand labels`, async ({
            page,
        }) => {
            await page.goto(
                `/iframe.html?id=components-button--playground&viewMode=story&globals=brand:${brand};direction:${direction}`,
            );
            await expect(page.locator('tui-root')).toHaveAttribute('data-brand', brand);
            const button = page.getByRole('button', {name: 'Continue', exact: true});
            const backdrop = button.locator('.t-motion-backdrop');
            const label = button.locator('.t-motion-label');

            await expect(button).toBeVisible();
            await expect(backdrop).toHaveCSS('top', '0px');
            await expect(button).toHaveCSS('height', '56px');
            await page.evaluate(async () => document.fonts.ready);
            const buttonBox = await button.boundingBox();
            const labelBox = await label.boundingBox();

            await button.hover();
            await expect(backdrop).toHaveCSS('top', '2px');
            await expect(backdrop).toHaveCSS('left', '2px');
            expect(await button.boundingBox()).toEqual(buttonBox);
            expect(await label.boundingBox()).toEqual(labelBox);
            await expect(button.locator('.t-motion-letter')).toHaveCount(
                direction === 'otus-brand' ? 8 : 0,
            );

            if (direction === 'otus-brand') {
                await expect(button.locator('.t-motion-letter').first()).not.toHaveCSS(
                    'transform',
                    'none',
                );
            }

            await page.mouse.move(500, 300);
            await expect(backdrop).toHaveCSS('top', '0px');
            await expect(button).toHaveAccessibleName('Continue');
        });
    }
}

for (const story of ['disabled', 'loading']) {
    test(`${story} does not animate`, async ({page}) => {
        await page.goto(
            `/iframe.html?id=components-button--${story}&viewMode=story&globals=direction:otus-brand`,
        );
        const button = page.locator('button[tuiButton]');

        await expect(button).toBeVisible();
        await button.hover({force: true});
        await expect(button.locator('.t-motion-backdrop')).toHaveCSS('top', '0px');
        await expect(button.locator('.t-motion-letter').first()).toHaveCSS(
            'transform',
            'none',
        );
    });
}

test('reduced motion keeps Brand text static', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto(
        '/iframe.html?id=components-button--playground&viewMode=story&globals=direction:otus-brand',
    );
    const button = page.getByRole('button', {name: 'Continue', exact: true});

    await button.hover();
    await expect(button.locator('.t-motion-backdrop')).toHaveCSS('top', '2px');
    await expect(button.locator('.t-motion-backdrop')).toHaveCSS(
        'transition-duration',
        '0s',
    );
    await expect(button.locator('.t-motion-letter').first()).toHaveCSS(
        'transform',
        'none',
    );
});

test('keyboard focus rolls the label without changing the normal Taiga color', async ({
    page,
}) => {
    await page.goto(
        '/iframe.html?id=components-button--playground&viewMode=story&globals=direction:otus-brand',
    );
    const button = page.getByRole('button', {name: 'Continue', exact: true});
    const backdrop = button.locator('.t-motion-backdrop');

    await expect(button).toBeVisible();
    const color = await backdrop.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
    );

    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(backdrop).toHaveCSS('top', '2px');
    await expect(backdrop).toHaveCSS('background-color', color);
});

for (const mode of ['otus-core', 'otus-brand']) {
    test(`floating shadows remain visible before and during hover in ${mode}`, async ({
        page,
    }) => {
        await page.goto(
            `/iframe.html?id=components-buttons-button--example-2&viewMode=story&globals=direction:${mode}`,
        );
        const button = page.locator('button[data-appearance="floating"]').first();
        const backdrop = button.locator('.t-motion-backdrop');

        await expect(backdrop).toHaveCSS(
            'box-shadow',
            'rgba(0, 0, 0, 0.1) 0px 4px 20px 0px',
        );
        await expect(button).toHaveCSS('overflow', 'visible');
        await button.hover();
        await expect(backdrop).toHaveCSS(
            'box-shadow',
            'rgba(0, 0, 0, 0.14) 0px 16px 40px 0px',
        );
        await expect(button).toHaveCSS('overflow', 'visible');
        await expect(button.locator('.t-motion-label').first()).toHaveCSS(
            'overflow',
            'hidden',
        );
    });
}
