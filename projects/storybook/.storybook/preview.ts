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
            breakpoint: globals.viewport?.value || 'otus-desktop',
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
            description: 'Taiga UI theme, including portalled dropdowns and hints',
            toolbar: {
                title: 'Theme',
                icon: 'circlehollow',
                items: [
                    {value: 'light', title: 'Light'},
                    {value: 'dark', title: 'Dark'},
                ],
                dynamicTitle: true,
            },
        },
    },
    parameters: {
        viewport: {
            options: {
                'otus-mobile': {
                    name: 'otus-mobile',
                    styles: {width: '390px', height: '844px'},
                    type: 'mobile',
                },
                'otus-tablet': {
                    name: 'otus-tablet',
                    styles: {width: '768px', height: '1024px'},
                    type: 'tablet',
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
                    'Overview',
                    'Documentation',
                    [
                        'Styles',
                        [
                            'Colors',
                            'Typography',
                            ['Text styles', 'Control typography', 'Tokens'],
                            'Layout',
                            'Effects',
                            'Icons',
                            'CSS tokens',
                        ],
                        'Customization',
                    ],
                    'Components',
                    'Form',
                    'Layout',
                    'Navigation',
                    'Charts',
                    'Tools',
                ],
                method: 'alphabetical',
            },
        },
    },
};

export default preview;
