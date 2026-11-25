import {addons} from 'storybook/manager-api';
import {GLOBALS_UPDATED} from 'storybook/internal/core-events';
import {create} from 'storybook/theming';

function setTheme(dark: boolean): void {
    addons.setConfig({
        theme: create({
            base: dark ? 'dark' : 'light',
            brandTitle: 'OTUS',
            brandUrl: './',
            brandImage:
                'data:image/svg+xml,' +
                encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="36" viewBox="0 0 120 36"><text x="0" y="29" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="' +
                        (dark ? '#ffffff' : '#161618') +
                        '">OTUS</text></svg>',
                ),
            colorPrimary: '#0b8cf2',
            colorSecondary: '#0b8cf2',
        }),
        sidebar: {showRoots: true},
    });
}

setTheme(false);
addons
    .getChannel()
    .on(GLOBALS_UPDATED, ({globals}: {globals: Record<string, unknown>}) =>
        setTheme(globals.theme === 'dark'),
    );
