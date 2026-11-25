import {provideHttpClient, withFetch} from '@angular/common/http';
import {inject, provideExperimentalZonelessChangeDetection} from '@angular/core';
import {provideRouter, withDisabledInitialNavigation} from '@angular/router';
import {
    applicationConfig,
    componentWrapperDecorator,
    moduleMetadata,
    type Preview,
} from '@storybook/angular';
import {provideTaiga, TUI_BUTTON_MOTION} from '@taiga-ui/core';
import {TUI_POPOUT_CONFIG} from '@taiga-ui/experimental';
import {tuiLanguageSwitcher} from '@taiga-ui/i18n';
import {provideHighlightOptions} from 'ngx-highlightjs';

import {loadStorybookLanguage} from '../src/example/languages';
import {STORYBOOK_ROUTES} from '../src/example/routes';
import {TuiStorybookButtonMotion} from '../src/root/button-motion.service';
import {TuiStorybookRoot} from '../src/root/root.component';
import {OtusDocsContainer} from '../src/docs/otus-docs-container';
import {OtusDocsPage} from '../src/docs/otus-docs-page';

const preview: Preview = {
    decorators: [
        moduleMetadata({imports: [TuiStorybookRoot]}),
        applicationConfig({
            providers: [
                provideExperimentalZonelessChangeDetection(),
                provideHttpClient(withFetch()),
                provideHighlightOptions({
                    fullLibraryLoader: async () => import('highlight.js'),
                }),
                provideRouter(STORYBOOK_ROUTES, withDisabledInitialNavigation()),
                provideTaiga({mode: 'light'}),
                {
                    provide: TUI_BUTTON_MOTION,
                    useFactory: () => inject(TuiStorybookButtonMotion).mode,
                },
                tuiLanguageSwitcher(loadStorybookLanguage),
                {
                    provide: TUI_POPOUT_CONFIG,
                    useValue: {providers: [provideExperimentalZonelessChangeDetection()]},
                },
            ],
        }),
        componentWrapperDecorator(TuiStorybookRoot, ({globals}) => ({
            theme: globals.theme,
            brand: globals.brand,
            direction: globals.direction,
            breakpoint:
                globals.viewport?.value === 'otus-mobile'
                    ? 'otus-mobile'
                    : 'otus-desktop',
        })),
    ],
    initialGlobals: {
        theme: 'light',
        brand: 'otus-tech',
        direction: 'otus-core',
        viewport: {value: 'otus-desktop', isRotated: false},
    },
    globalTypes: {
        brand: {
            description: 'Школа',
            toolbar: {
                title: 'Школа',
                icon: 'flag',
                items: [
                    {value: 'otus-university', title: 'otus-university'},
                    {value: 'otus-tech', title: 'otus-tech'},
                    {value: 'otus-design', title: 'otus-design'},
                    {value: 'otus-nature', title: 'otus-nature'},
                ],
                dynamicTitle: true,
            },
        },
        direction: {
            description: 'Направление',
            toolbar: {
                title: 'Направление',
                icon: 'compass',
                items: [
                    {value: 'otus-core', title: 'otus-core'},
                    {value: 'otus-brand', title: 'otus-brand'},
                ],
                dynamicTitle: true,
            },
        },
        theme: {
            description: 'Тема Taiga UI, включая выпадающие меню и портальные подсказки',
            toolbar: {
                title: 'Тема',
                icon: 'circlehollow',
                items: [
                    {value: 'light', title: 'Светлая'},
                    {value: 'dark', title: 'Тёмная'},
                ],
                dynamicTitle: true,
            },
        },
    },
    parameters: {
        docs: {
            page: OtusDocsPage,
            container: OtusDocsContainer,
            canvas: {
                layout: 'padded',
                story: {height: 'auto'},
                withToolbar: false,
            },
        },
        viewport: {
            options: {
                'otus-mobile': {
                    name: 'otus-mobile',
                    styles: {width: '390px', height: '844px'},
                    type: 'mobile',
                },
                'otus-desktop': {
                    name: 'otus-desktop',
                    styles: {width: '100%', height: '100%'},
                    type: 'desktop',
                },
            },
        },
        controls: {expanded: true},
        backgrounds: {disable: true},
        layout: 'fullscreen',
        options: {
            storySort: {
                order: [
                    'Начало работы',
                    'Обзор системы',
                    'Основы',
                    'Компоненты',
                    'Паттерны',
                    'Эксперименты',
                ],
                method: 'alphabetical',
            },
        },
    },
};

export default preview;
