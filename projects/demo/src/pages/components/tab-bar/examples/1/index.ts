import {Component, inject} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {encapsulation} from '@demo/emulate/encapsulation';
import {TuiTabBar} from '@taiga-ui/addon-mobile';
import {TuiNotificationService} from '@taiga-ui/core';

interface Item {
    badge?: number;
    icon: string;
    text: string;
}

@Component({
    selector: 'tui-tab-bar-example',
    imports: [TuiTabBar],
    templateUrl: './index.html',
    styleUrl: './index.less',
    encapsulation,
    changeDetection,
})
export default class Example {
    private readonly alerts = inject(TuiNotificationService);

    protected activeItemIndex = 1;

    protected readonly items = [
        {
            text: 'Favorites',
            icon: '@otus.outline.heart-lined',
            badge: 3,
        },
        {
            text: 'Calls',
            icon: '@otus.outline.phone-lined',
            badge: 1234,
        },
        {
            text: 'Profile',
            icon: '@otus.outline.user-01-lined',
        },
        {
            text: 'Settings and configuration',
            icon: '@otus.outline.settings-01-lined',
            badge: 100,
        },
        {
            text: 'More',
            icon: '@otus.outline.dots-horizontal-lined',
        },
    ];

    protected onClick(item: Item): void {
        item.badge = 0;
        this.alerts.open(this.activeItemIndex, {label: item.text}).subscribe();
    }
}
