import * as React from 'react';
import {Canvas, Controls, DocsContext, useOf} from '@storybook/addon-docs/blocks';
import {GLOBALS_UPDATED} from 'storybook/internal/core-events';

import {OTUS_PAGE_METADATA} from './page-metadata';

const h = React.createElement;
const statePattern =
    /--(?:disabled|loading|hover|active|focus|invalid|valid|checked|indeterminate|readonly)/;
const labels: Readonly<Record<string, string>> = {
    Secondary: 'Второстепенная',
    Disabled: 'Недоступна',
    Loading: 'Загрузка',
    'With Icons': 'С иконками',
    Hover: 'Наведение',
    Active: 'Нажатие',
    Focus: 'Фокус с клавиатуры',
};

export function OtusDocsPage(): React.ReactElement {
    const context = React.useContext(DocsContext);
    const {preparedMeta} = useOf('meta', ['meta']);
    const stories = context.componentStories();
    const primary = stories[0];
    const metadata = {
        ...preparedMeta.parameters.otus,
        ...OTUS_PAGE_METADATA[preparedMeta.id],
    };
    const titleParts = preparedMeta.title
        .split('/')
        .filter((part) => !['Controls', 'Настройки'].includes(part));
    const title = metadata.title ?? titleParts.at(-1) ?? 'Компонент';
    const hasControls = Boolean(
        primary &&
        !primary.parameters.controls?.disable &&
        Object.values(primary.argTypes).some((arg) => arg.control),
    );
    const groups = [
        {
            id: 'variants',
            title: 'Варианты и композиции',
            stories: stories.slice(1).filter((story) => !statePattern.test(story.id)),
        },
        {
            id: 'states',
            title: 'Состояния',
            stories: stories.slice(1).filter((story) => statePattern.test(story.id)),
        },
    ].filter((group) => group.stories.length);
    const sections = [
        {id: 'overview', title: 'Интерактивный пример'},
        ...(hasControls ? [{id: 'api', title: 'API и настройки'}] : []),
        ...groups.map(({id, title: label}) => ({id, title: label})),
    ];
    const root = React.useRef<HTMLDivElement>(null);
    const [active, setActive] = React.useState('overview');
    const [copyStatus, setCopyStatus] = React.useState('');
    const [mode, setMode] = React.useState<Record<string, unknown>>(() =>
        primary ? context.getStoryContext(primary).globals : {},
    );
    const figmaUrl =
        metadata.figmaUrl ??
        (preparedMeta.parameters.design?.type === 'figma'
            ? preparedMeta.parameters.design.url
            : null);

    React.useEffect(() => {
        const onGlobals = ({globals}: {globals: Record<string, unknown>}): void =>
            setMode(globals);
        context.channel.on(GLOBALS_UPDATED, onGlobals);
        return () => {
            context.channel.off(GLOBALS_UPDATED, onGlobals);
        };
    }, [context]);

    React.useEffect(() => {
        const update = (): void => {
            const nodes =
                root.current?.querySelectorAll<HTMLElement>('[data-doc-section]');
            const current = nodes
                ? Array.from(nodes)
                      .filter((node) => node.getBoundingClientRect().top < 180)
                      .at(-1)
                : undefined;
            setActive(current?.id ?? 'overview');
        };
        window.addEventListener('scroll', update, {passive: true});
        update();
        return () => window.removeEventListener('scroll', update);
    }, [preparedMeta.id]);

    const copyLink = async (): Promise<void> => {
        try {
            const url = new URL(window.location.href);
            url.pathname = url.pathname.replace(/iframe[.]html$/, '');
            url.search = '';
            url.searchParams.set('path', '/docs/' + preparedMeta.id + '--docs');
            await navigator.clipboard.writeText(url.href);
            setCopyStatus('Ссылка скопирована');
        } catch {
            setCopyStatus('Не удалось скопировать. Скопируйте адрес из браузера.');
        }
    };

    const renderCanvas = (
        story: NonNullable<typeof primary>,
        main = false,
    ): React.ReactElement =>
        h(Canvas, {
            of: story.moduleExport,
            layout: 'fullscreen',
            withToolbar: false,
            sourceState: 'hidden',
            story: {inline: true, __primary: main, __forceInitialArgs: !main},
        });

    return h(
        'div',
        {
            className: 't-otus-docs-page sb-unstyled',
            ref: root,
            tuiTheme: mode.theme === 'dark' ? 'dark' : 'light',
            'data-brand': typeof mode.brand === 'string' ? mode.brand : 'otus-tech',
        },
        h(
            'div',
            {className: 't-page-shell'},
            h(
                'main',
                {className: 't-page-shell__main'},
                h(
                    'header',
                    {className: 't-page-shell__header'},
                    h(
                        'div',
                        null,
                        h(
                            'div',
                            {className: 't-otus-docs-page__title'},
                            h('h1', null, title),
                        ),
                        metadata.description
                            ? h(
                                  'p',
                                  {className: 't-page-shell__description'},
                                  metadata.description,
                              )
                            : null,
                    ),
                    h(
                        'div',
                        {className: 't-page-shell__actions'},
                        h(
                            'button',
                            {
                                className: 't-page-shell__action',
                                onClick: copyLink,
                                type: 'button',
                                'aria-label': 'Копировать ссылку на страницу',
                                title: 'Копировать ссылку',
                            },
                            h(
                                'svg',
                                {
                                    width: 18,
                                    height: 18,
                                    viewBox: '0 0 24 24',
                                    fill: 'none',
                                    stroke: 'currentColor',
                                    strokeWidth: 1.6,
                                    'aria-hidden': true,
                                },
                                h('rect', {x: 8, y: 8, width: 12, height: 12, rx: 2}),
                                h('path', {d: 'M16 8V4H4v12h4'}),
                            ),
                        ),
                        figmaUrl
                            ? h(
                                  'a',
                                  {
                                      className: 't-page-shell__action',
                                      href: figmaUrl,
                                      target: '_blank',
                                      rel: 'noreferrer',
                                      'aria-label': 'Открыть макет в Figma',
                                  },
                                  'Figma',
                              )
                            : h(
                                  'span',
                                  {title: 'Макет ещё не привязан'},
                                  h(
                                      'button',
                                      {
                                          className: 't-page-shell__action',
                                          disabled: true,
                                          type: 'button',
                                          'aria-label': 'Figma: макет ещё не привязан',
                                      },
                                      'Figma',
                                  ),
                              ),
                        h(
                            'span',
                            {role: 'status', className: 't-otus-docs-page__copy-status'},
                            copyStatus,
                        ),
                    ),
                ),
                h(
                    'div',
                    {className: 't-page-shell__content'},
                    primary
                        ? h(
                              'section',
                              {id: 'overview', 'data-doc-section': true},
                              h('h2', null, 'Интерактивный пример'),
                              h(
                                  'p',
                                  {className: 't-otus-docs-page__hint'},
                                  'Настройте свойства и проверьте поведение компонента.',
                              ),
                              h(
                                  'div',
                                  {className: 't-otus-docs-page__playground'},
                                  h(
                                      'div',
                                      {className: 't-otus-docs-page__preview'},
                                      renderCanvas(primary, true),
                                  ),
                                  hasControls
                                      ? h(
                                            'div',
                                            {
                                                id: 'api',
                                                'data-doc-section': true,
                                                className: 't-otus-docs-page__controls',
                                            },
                                            h('h3', null, 'API и настройки'),
                                            h(Controls, null),
                                        )
                                      : null,
                              ),
                          )
                        : null,
                    ...groups.map((group) =>
                        h(
                            'section',
                            {id: group.id, key: group.id, 'data-doc-section': true},
                            h('h2', null, group.title),
                            h(
                                'div',
                                {className: 't-otus-docs-page__matrix'},
                                ...group.stories.map((story) =>
                                    h(
                                        'article',
                                        {key: story.id},
                                        h('h3', null, labels[story.name] ?? story.name),
                                        renderCanvas(story),
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
            ),
            h(
                'aside',
                {className: 't-page-shell__aside', 'aria-label': 'Навигация по странице'},
                h(
                    'nav',
                    {'aria-label': 'На этой странице'},
                    h('p', {className: 't-page-shell__aside-title'}, 'На этой странице'),
                    ...sections.map((section) =>
                        h(
                            'a',
                            {
                                href: '#' + section.id,
                                onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
                                    event.preventDefault();
                                    const target = document.getElementById(section.id);
                                    target?.scrollIntoView({block: 'start'});
                                    target?.setAttribute('tabindex', '-1');
                                    target?.focus({preventScroll: true});
                                    setActive(section.id);
                                },
                                key: section.id,
                                'aria-current':
                                    active === section.id ? 'location' : undefined,
                            },
                            section.title,
                        ),
                    ),
                ),
                metadata.related?.length
                    ? h(
                          'nav',
                          {'aria-label': 'Смотрите также'},
                          h(
                              'p',
                              {className: 't-page-shell__aside-title'},
                              'Смотрите также',
                          ),
                          ...metadata.related.map((item: {title: string; href: string}) =>
                              h(
                                  'a',
                                  {href: item.href, key: item.href, target: '_top'},
                                  item.title,
                              ),
                          ),
                      )
                    : null,
            ),
        ),
    );
}
