import {Component} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {encapsulation} from '@demo/emulate/encapsulation';
import {TuiTabBar} from '@taiga-ui/addon-mobile';
import {TUI_PLATFORM} from '@taiga-ui/cdk';
import {TUI_LIQUID_GLASS} from '@taiga-ui/core';

@Component({
    selector: 'tui-tab-bar-example-liquid-full',
    imports: [TuiTabBar],
    templateUrl: './index.html',
    styleUrl: './index.less',
    encapsulation,
    changeDetection,
    providers: [
        // Not required if `provideTaiga({apis: {liquidGlass: true}})` is already set up
        {provide: TUI_LIQUID_GLASS, useValue: true},
        {provide: TUI_PLATFORM, useValue: 'ios'},
    ],
    host: {
        '[attr.data-platform]': '"ios"',
        '[class.tui-liquid-glass]': 'true',
    },
})
export default class Example {
    protected activeItemIndex = 2;

    protected readonly items = [
        {
            text: 'Home',
            icon: '@otus.outline.home-01-lined',
        },
        {
            text: 'Search',
            icon: '@otus.outline.search-md-lined',
        },
        {
            text: 'Favorites',
            icon: '@otus.outline.heart-lined',
        },
        {
            text: 'Notifications',
            icon: '@otus.outline.bell-01-lined',
        },
        {
            text: 'Profile',
            icon: '@otus.outline.user-01-lined',
        },
    ];
}
