import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

import {expect, test} from '@playwright/test';

test('Universita keeps normal spacing when its container inherits Graphik tracking', async ({
    page,
}) => {
    const styles = execFileSync(
        process.execPath,
        [
            require.resolve('less/bin/lessc'),
            resolve('projects/demo/src/pages/markup/typography/index.less'),
            '--include-path=node_modules',
        ],
        {encoding: 'utf8'},
    );

    await page.setContent(`
        <style>
            :root {
                --tui-typography-heading-h4: 600 28px / 32px Graphik;
                --t-typeface-font: 400 20px / 24px Universita;
            }
            ${styles}
        </style>
        <h2>Graphik</h2>
        <div class="t-typeface-samples" style="letter-spacing: -1.25px">
            <p class="t-typeface-heading">Universita heading</p>
            <p class="t-typeface-body">Universita body</p>
        </div>
    `);

    await expect(page.locator('h2')).toHaveCSS('letter-spacing', '-0.42px');
    await expect(page.locator('.t-typeface-heading')).toHaveCSS(
        'letter-spacing',
        'normal',
    );
    await expect(page.locator('.t-typeface-body')).toHaveCSS('letter-spacing', 'normal');
});

test('Universita typefaces load real faces for headings and body text', async ({
    page,
}) => {
    await page.goto(
        '/iframe.html?id=documentation-styles-typography--gallery&viewMode=story',
    );

    for (const {name, family, style} of [
        {name: 'Universita', family: 'Universita', style: 'normal'},
        {name: 'Universita Italic', family: 'Universita', style: 'italic'},
        {name: 'Universita Mono', family: '"Universita Mono"', style: 'normal'},
    ]) {
        const section = page.getByRole('region', {name, exact: true});
        const headings = section.locator('.t-typeface-heading');
        const body = section.locator('.t-typeface-body');

        await expect(headings).toHaveCount(6);
        await expect(body).toHaveCount(4);

        for (const sample of [headings.first(), body.first()]) {
            await expect(sample).toHaveCSS('font-family', new RegExp(family));
            await expect(sample).toHaveCSS('font-style', style);
            await expect(sample).toHaveCSS('font-weight', '400');
            await expect(sample).toHaveCSS('letter-spacing', 'normal');
            const loaded = await sample.evaluate(async (element) => {
                const {fontStyle, fontFamily} = getComputedStyle(element);
                const faces = await document.fonts.load(
                    `${fontStyle} 400 16px ${fontFamily}`,
                    'Образование',
                );

                return (
                    faces.length > 0 && faces.every((face) => face.status === 'loaded')
                );
            });

            expect(loaded).toBe(true);
        }
    }

    await page.setViewportSize({width: 390, height: 844});
    expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBe(0);
});

test('typography has three aligned sections with actual tracking values', async ({
    page,
}) => {
    await page.goto(
        '/iframe.html?id=documentation-styles-typography--gallery&viewMode=story',
    );
    await expect(page.locator('.t-section')).toHaveCount(3);
    await expect(page.getByRole('columnheader', {name: 'Трекинг'})).toHaveCount(3);
    const heading = page.locator('tr[data-font="--tui-typography-heading-h1"]');

    await expect(heading.locator('td').last()).toHaveText('-1.25px');
    const body = page.locator('tr[data-font="--tui-typography-body-m"]');

    await expect(body.locator('td').last()).toHaveText('normal');
    await page.evaluate(async () => document.fonts.ready);
    const columns = await page
        .locator('.t-section table')
        .evaluateAll((tables) =>
            tables.map((table) =>
                Array.from(table.querySelectorAll('thead th')).map(
                    (cell) => cell.getBoundingClientRect().x,
                ),
            ),
        );

    expect(columns[1]).toEqual(columns[0]);
    expect(columns[2]).toEqual(columns[0]);
});

test('Body and UI comparison isolates the real line height difference', async ({
    page,
}) => {
    await page.goto(
        '/iframe.html?id=documentation-styles-typography--gallery&viewMode=story',
    );
    const body = page.locator('.t-comparison-body');
    const ui = page.locator('.t-comparison-ui');

    await expect(body).toHaveCSS('font-size', '16px');
    await expect(ui).toHaveCSS('font-size', '16px');
    await expect(body).toHaveCSS('font-weight', '400');
    await expect(ui).toHaveCSS('font-weight', '400');
    await expect(body).toHaveCSS('line-height', '24px');
    await expect(ui).toHaveCSS('line-height', '20px');
    expect(await body.innerText()).toBe(await ui.innerText());
    expect((await body.boundingBox())!.height).toBe(72);
    expect((await ui.boundingBox())!.height).toBe(60);

    await page.setViewportSize({width: 390, height: 844});
    await expect(body).toHaveCSS('line-height', '24px');
    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
    );

    expect(overflow).toBe(0);
});
