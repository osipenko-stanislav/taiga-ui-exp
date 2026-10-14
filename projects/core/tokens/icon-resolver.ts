import {inject, InjectionToken, type Provider} from '@angular/core';
import {type TuiStringHandler} from '@taiga-ui/cdk/types';
import {tuiResolveOtusIcon} from '@taiga-ui/icons';

import {TUI_ASSETS_PATH} from './assets-path';
import {TUI_ICON_REGISTRY} from './icons';

export const TUI_ICON_RESOLVER = new InjectionToken<TuiStringHandler<string>>(
    ngDevMode ? 'TUI_ICON_RESOLVER' : '',
    {
        factory: () => {
            const path = inject(TUI_ASSETS_PATH);

            return (icon) => tuiResolveOtusIcon(icon, path);
        },
    },
);

export function tuiGetIconMode(icon?: string | null): string | undefined {
    return icon?.match(/@([^.]*)\./)?.[1] || icon || undefined;
}

export function tuiInjectIconResolver(): TuiStringHandler<string> {
    const icons = inject(TUI_ICON_REGISTRY);
    const resolver = inject(TUI_ICON_RESOLVER);

    return (icon) => {
        if (!icon || icon.includes('/')) {
            return icon.replace(/@[a-z]+\./i, '');
        }

        return icon.startsWith('@font.')
            ? icon.replace('@font.', '')
            : (icons[icon] ?? resolver(icon));
    };
}

export function tuiIconResolverProvider(useValue: TuiStringHandler<string>): Provider {
    return {provide: TUI_ICON_RESOLVER, useValue};
}
