import {expect, test} from '@playwright/test';

const story =
    '/iframe.html?id=navigation-otus-experiment--student&viewMode=story&globals=brand:otus-university;direction:otus-brand';

for (const width of [1024, 1440]) {
    test(`desktop islands fit and keep the gradient at ${width}px`, async ({page}) => {
        await page.setViewportSize({width, height: 900});
        await page.goto(story);
        const header = page.locator('.t-otus-navigation__header');

        await expect(header).toBeVisible();
        const geometry = await header.evaluate((element) => {
            const center = element
                .querySelector<HTMLElement>('.t-otus-navigation__center')!
                .getBoundingClientRect();

            const utilities = element
                .querySelector<HTMLElement>('.t-otus-navigation__utilities')!
                .getBoundingClientRect();

            const gradient = getComputedStyle(element, '::before');

            return {
                height: element.clientHeight,
                center: (center.left + center.right) / 2,
                centerRight: center.right,
                utilitiesLeft: utilities.left,
                right: utilities.right,
                gradientHeight: Number.parseFloat(gradient.height),
                mask: gradient.maskImage,
                pointerEvents: gradient.pointerEvents,
            };
        });

        expect(geometry.height).toBe(80);
        expect(geometry.centerRight).toBeLessThanOrEqual(geometry.utilitiesLeft);
        expect(geometry.right).toBeLessThanOrEqual(width);
        expect(geometry.gradientHeight).toBe(120);
        expect(geometry.mask).not.toBe('none');
        expect(geometry.pointerEvents).toBe('none');

        if (width === 1440) {
            expect(geometry.center).toBeCloseTo(width / 2, 0);
        }

        const assets = await page.evaluate(async () => {
            const response = await fetch('assets/storybook/otus-navigation/avatar.png');

            return {
                status: response.status,
                bytes: (await response.arrayBuffer()).byteLength,
            };
        });

        const avatar = page.locator('.t-otus-navigation__avatar img');

        await expect
            .poll(async () =>
                avatar.evaluate(
                    (element: HTMLImageElement) =>
                        element.complete && element.naturalWidth > 0,
                ),
            )
            .toBe(true);
        expect(
            await avatar.evaluate((element) => element.getBoundingClientRect().width),
        ).toBe(32);
        expect(assets.status).toBe(200);
        expect(assets.bytes).toBeGreaterThan(0);
        await page.evaluate(() => window.scrollTo(0, 400));
        await expect
            .poll(async () =>
                header.evaluate((element) => element.getBoundingClientRect().top),
            )
            .toBe(0);
    });
}

test('mobile menu and avatar do not open popovers', async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto(story);

    const navigation = page.getByRole('navigation', {name: 'Мобильная навигация'});

    await expect(navigation.getByRole('button', {name: 'Меню'})).toBeDisabled();
    await expect(navigation.getByRole('button', {name: 'Профиль'})).toBeDisabled();
    await expect(page.locator('tui-dropdown')).toHaveCount(0);
});

test('native dropdown switches sections, closes on repeat/outside and navigates from the mega menu', async ({
    page,
}) => {
    await page.goto(story);
    const study = page.getByRole('button', {name: 'Учеба', exact: true});
    const services = page.getByRole('button', {name: 'Сервисы', exact: true});

    await study.click();
    await expect(study).toHaveAttribute('aria-expanded', 'true');
    await expect(
        page.getByRole('heading', {name: 'Обучение', exact: true}),
    ).toBeVisible();
    await services.click();
    await expect(study).toHaveAttribute('aria-expanded', 'false');
    await expect(services).toHaveAttribute('aria-expanded', 'true');
    await expect(
        page.getByRole('heading', {name: 'Для учёбы', exact: true}),
    ).toBeVisible();
    await services.click();
    await expect(services).toHaveAttribute('aria-expanded', 'false');
    await study.click();
    await page.locator('#navigation-content').click({position: {x: 12, y: 120}});
    await expect(study).toHaveAttribute('aria-expanded', 'false');
    await study.click();
    await page
        .locator('tui-dropdown:not(.tui-leave)')
        .getByRole('button', {name: /Мои дисциплины Курсы/})
        .click();
    await expect(study).toHaveAttribute('aria-expanded', 'false');
    await expect(study).toHaveAttribute('aria-current', 'page');
});

test('keyboard enters a native popover and Escape restores trigger focus', async ({
    page,
}) => {
    await page.goto(story);
    const trigger = page.getByRole('button', {name: 'Учеба', exact: true});

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', {name: 'Закрыть меню'})).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
});

test('search shortcut filters destinations and keeps the empty state usable', async ({
    page,
}) => {
    await page.goto(story);
    await expect(page.getByRole('button', {name: 'Поиск', exact: true})).toBeVisible();
    await page.keyboard.press('Control+k');
    const search = page.getByRole('searchbox');

    await expect(search).toBeFocused();
    await search.fill('несуществующий раздел');
    await expect(
        page.getByText('Ничего не нашли. Попробуйте другой запрос.'),
    ).toBeVisible();
    await search.fill('библиотека');
    await page.getByRole('button', {name: /Библиотека Учебники/}).click();
    await expect(page.getByRole('searchbox')).toHaveCount(0);
    await expect(page.getByRole('button', {name: 'Учеба', exact: true})).toHaveAttribute(
        'aria-current',
        'page',
    );
});

for (const theme of ['light', 'dark']) {
    test(`portalled navigation inherits ${theme} theme and OTUS tokens`, async ({
        page,
    }) => {
        await page.goto(`${story};theme:${theme}`);
        await page.getByRole('button', {name: 'Сервисы', exact: true}).click();
        const dropdown = page.locator('tui-dropdown');

        await expect(dropdown).toHaveAttribute('tuiTheme', theme);
        const surface = await dropdown.evaluate((element) => ({
            background: getComputedStyle(element).backgroundColor,
            expected: getComputedStyle(element)
                .getPropertyValue('--tui-background-elevation-1')
                .trim(),
            scroll: element.scrollWidth,
            width: element.clientWidth,
        }));

        expect(surface.background).not.toBe('rgba(0, 0, 0, 0)');
        expect(surface.expected).not.toBe('');
        expect(surface.scroll).toBeLessThanOrEqual(surface.width);
    });
}

test('navigation buttons retain native Taiga geometry and typography', async ({page}) => {
    await page.goto(story);
    const trigger = page.getByRole('button', {name: 'Навигатор', exact: true});

    await expect(trigger).toBeVisible();
    const comparison = await trigger.evaluate((element) => {
        const reference = element.cloneNode(true) as HTMLElement;

        reference.removeAttribute('class');
        element.parentElement!.append(reference);
        const actual = getComputedStyle(element);
        const native = getComputedStyle(reference);
        const result = {
            actual: [
                actual.height,
                actual.borderRadius,
                actual.fontSize,
                actual.lineHeight,
                actual.padding,
                actual.gap,
            ],
            native: [
                native.height,
                native.borderRadius,
                native.fontSize,
                native.lineHeight,
                native.padding,
                native.gap,
            ],
        };

        reference.remove();

        return result;
    });

    expect(comparison.actual).toEqual(comparison.native);
});

const presetNames = ['public', 'applicant', 'student', 'employee', 'tools'];

for (const preset of presetNames) {
    for (const width of [1024, 1440]) {
        test(`${preset} navigation fits the desktop at ${width}px`, async ({page}) => {
            const errors: string[] = [];

            page.on('pageerror', (error) => errors.push(error.message));
            page.on('console', (message) => {
                if (message.type() === 'error' && message.text().startsWith('ERROR')) {
                    errors.push(message.text());
                }
            });
            await page.setViewportSize({width, height: 900});
            await page.goto(story.replace('--student', `--${preset}`));
            const header = page.locator('.t-otus-navigation__header');

            await expect(header).toBeVisible();
            await expect(page.locator('#navigation-content [tuiSkeleton]')).toHaveCount(
                6,
            );
            const geometry = await header.evaluate((element) => {
                const center = element
                    .querySelector('.t-otus-navigation__center')
                    ?.getBoundingClientRect();

                const utilities = element
                    .querySelector('.t-otus-navigation__utilities')!
                    .getBoundingClientRect();

                return {
                    centerRight: center?.right ?? 0,
                    utilitiesLeft: utilities.left,
                    utilitiesRight: utilities.right,
                    width: element.ownerDocument.documentElement.scrollWidth,
                };
            });

            expect(geometry.centerRight).toBeLessThanOrEqual(geometry.utilitiesLeft);
            expect(geometry.utilitiesRight).toBeLessThanOrEqual(width);
            expect(geometry.width).toBeLessThanOrEqual(width);
            expect(errors).toEqual([]);
        });
    }
}

for (const [size, height] of [
    ['s', 32],
    ['m', 44],
    ['l', 56],
] as const) {
    test(`all header buttons use native ${size.toUpperCase()} at ${height}px`, async ({
        page,
    }) => {
        await page.goto(`${story}&args=size:${size}`);
        const buttons = page
            .locator('.t-otus-navigation__header')
            .locator('[tuiButton], [tuiIconButton]');

        await expect(buttons.first()).toBeVisible();

        for (const button of await buttons.all()) {
            await expect(button).toHaveAttribute('data-size', size);
            await expect(button).toHaveCSS('height', `${height}px`);
        }
    });
}

test('public header has a real login link and an unimplemented burger', async ({
    page,
}) => {
    await page.goto(story.replace('--student', '--public'));
    await expect(page.getByRole('link', {name: 'Личный кабинет'})).toHaveAttribute(
        'href',
        'https://my.centraluniversity.ru/',
    );
    const burger = page.getByRole('button', {name: 'Меню сайта'});

    await expect(burger).toHaveAttribute('aria-disabled', 'true');
    await burger.dispatchEvent('click');
    await expect(page.locator('tui-dropdown')).toHaveCount(0);
    await expect(page.getByRole('button', {name: 'Профиль', exact: true})).toHaveCount(0);
});

test('applicant supports direct sections, More, language and local theme', async ({
    page,
}) => {
    await page.goto(story.replace('--student', '--applicant'));
    const grants = page.getByRole('button', {name: 'Грантовый конкурс', exact: true});

    await grants.click();
    await expect(grants).toHaveAttribute('aria-current', 'page');
    await expect(grants).not.toHaveAttribute('aria-haspopup');
    await page.getByRole('button', {name: 'Ещё', exact: true}).click();
    await expect(
        page.getByRole('heading', {name: 'Другие разделы', exact: true}),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', {name: 'Язык', exact: true}).click();
    await page.getByRole('button', {name: 'English EN', exact: true}).click();
    await expect(page.getByRole('button', {name: 'Язык', exact: true})).toContainText(
        'Eng',
    );
    await page.getByRole('button', {name: 'Профиль', exact: true}).click();
    await page.getByRole('button', {name: 'Включить тёмную тему', exact: true}).click();
    await expect(page.locator('otus-navigation-story')).toHaveAttribute(
        'tuiTheme',
        'dark',
    );
    await page.getByRole('button', {name: 'Ещё', exact: true}).click();
    await expect(page.locator('tui-dropdown:not(.tui-leave)')).toHaveAttribute(
        'tuiTheme',
        'dark',
    );
});

test('native sidebar expands groups, selects an item and collapses to an icon rail', async ({
    page,
}) => {
    await page.goto(story.replace('--student', '--tools'));
    const aside = page.getByRole('complementary', {name: 'Сервисы и инструменты'});

    await expect(aside).toBeVisible();
    await aside.getByRole('button', {name: 'Пользователи', exact: true}).click();
    const students = aside.getByRole('button', {name: 'Студенты', exact: true});

    await expect(students).toBeVisible();
    await students.click();
    await expect(students).toHaveAttribute('aria-current', 'page');
    await page.getByRole('button', {name: 'Свернуть навигацию'}).click();
    await expect(aside).toHaveCSS('width', '48px');
    await page.getByRole('button', {name: 'Развернуть навигацию'}).click();
    await expect(aside).toHaveCSS('width', '230px');
    await expect(students).toHaveAttribute('aria-current', 'page');
});

test('on-page configuration switches context, size and layout without retaining an old popup', async ({
    page,
}) => {
    await page.goto(story.replace('--student', '--playground'));
    const api = page.getByRole('region', {name: 'Настройки навигации'});
    const zone = api
        .locator('tr[tuiDocAPIItem]')
        .filter({hasText: '[zone]'})
        .locator('input');

    await zone.click();
    await page.getByRole('option').filter({hasText: "'applicant'"}).click();
    await expect(
        page.getByRole('button', {name: 'Грантовый конкурс', exact: true}),
    ).toBeVisible();
    const size = api
        .locator('tr[tuiDocAPIItem]')
        .filter({hasText: '[size]'})
        .locator('input');

    await size.click();
    await page.getByRole('option').filter({hasText: "'s'"}).click();
    await expect(
        page.getByRole('button', {name: 'Грантовый конкурс', exact: true}),
    ).toHaveCSS('height', '32px');
    const layout = api
        .locator('tr[tuiDocAPIItem]')
        .filter({hasText: '[layout]'})
        .locator('input');

    await layout.click();
    await page.getByRole('option').filter({hasText: "'sidebar'"}).click();
    await expect(
        page.getByRole('complementary', {name: 'Сервисы и инструменты'}),
    ).toBeVisible();
    await expect(page.getByRole('navigation', {name: 'Основная навигация'})).toHaveCount(
        0,
    );
});

for (const theme of ['light', 'dark']) {
    test(`native sidebar inherits ${theme} and keeps nested groups usable`, async ({
        page,
    }) => {
        await page.goto(`${story.replace('--student', '--tools')};theme:${theme}`);
        const aside = page.getByRole('complementary', {name: 'Сервисы и инструменты'});

        await expect(aside).toHaveAttribute('tuiTheme', theme);
        await aside.getByRole('button', {name: 'Документы', exact: true}).click();
        await expect(
            aside.getByRole('button', {name: 'Типы документов', exact: true}),
        ).toBeVisible();
    });
}

test('hiding a utility closes its popup and preserves the selected section', async ({
    page,
}) => {
    await page.goto(story.replace('--student', '--playground'));
    const study = page.getByRole('button', {name: 'Учеба', exact: true});

    await study.click();
    await page.getByRole('button', {name: /Мои дисциплины Курсы/}).click();
    await page.getByRole('button', {name: 'Уведомления', exact: true}).click();
    const notifications = page
        .getByRole('region', {name: 'Настройки навигации'})
        .locator('label')
        .filter({hasText: 'Уведомления'})
        .locator('input');

    await notifications.uncheck();
    await expect(
        page.getByRole('button', {name: 'Уведомления', exact: true}),
    ).toHaveCount(0);
    await expect(page.locator('tui-dropdown')).toHaveCount(0);
    await expect(study).toHaveAttribute('aria-current', 'page');
    await expect(study).toHaveAttribute('data-appearance', 'primary');
});

test('the old student iframe link redirects with its globals intact', async ({page}) => {
    await page.goto(
        '/iframe.html?id=navigation-student-navigation-otus-experimental--desktop&viewMode=story&globals=theme:dark;brand:otus-university;direction:otus-brand',
    );
    await expect(page).toHaveURL(/id=navigation-otus-experiment--student/);
    await expect(page.getByRole('button', {name: 'Учеба', exact: true})).toBeVisible();
    await expect(page.locator('otus-navigation-story')).toHaveAttribute(
        'tuiTheme',
        'dark',
    );
    expect(new URL(page.url()).searchParams.get('globals')).toContain(
        'brand:otus-university',
    );
});

test('the catalog exposes the experiment group and the old manager URL remains usable', async ({
    page,
    request,
}) => {
    await page.setViewportSize({width: 1440, height: 900});
    const response = await request.get('/index.json');
    const index = (await response.json()) as {
        entries: Record<string, {title: string; name: string}>;
    };

    for (const id of ['playground', ...presetNames]) {
        expect(index.entries[`navigation-otus-experiment--${id}`]?.title).toBe(
            'Navigation/Otus experiment',
        );
    }

    expect(
        index.entries['navigation-student-navigation-otus-experimental--desktop'],
    ).toBeUndefined();
    await page.goto(
        '/?path=/story/navigation-student-navigation-otus-experimental--desktop&globals=theme:dark;brand:otus-university;direction:otus-brand',
    );
    await expect(page).toHaveURL(/path=%2Fstory%2Fnavigation-otus-experiment--student/);
    await expect(
        page
            .frameLocator('#storybook-preview-iframe')
            .getByRole('button', {name: 'Учеба', exact: true}),
    ).toBeVisible();
});

test('theme settings live in the avatar menu and update the reopened popup', async ({
    page,
}) => {
    await page.goto(story);
    const header = page.locator('.t-otus-navigation__header');

    await expect(header.getByRole('button', {name: 'Переключить тему'})).toHaveCount(0);
    const profile = page.getByRole('button', {name: 'Профиль', exact: true});

    await profile.click();
    await page.getByRole('button', {name: 'Включить тёмную тему', exact: true}).click();
    await expect(page.locator('otus-navigation-story')).toHaveAttribute(
        'tuiTheme',
        'dark',
    );
    await expect(profile).toHaveAttribute('aria-expanded', 'false');
    await profile.click();
    await expect(page.locator('tui-dropdown:not(.tui-leave)')).toHaveAttribute(
        'tuiTheme',
        'dark',
    );
    await page.getByRole('button', {name: 'Включить светлую тему', exact: true}).click();
    await expect(page.locator('otus-navigation-story')).toHaveAttribute(
        'tuiTheme',
        'light',
    );
});
