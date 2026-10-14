import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {changeDetection} from '@demo/emulate/change-detection';
import {encapsulation} from '@demo/emulate/encapsulation';
import {TuiCell, TuiNotification, TuiTextfield, TuiTitle} from '@taiga-ui/core';
import {TuiAvatar, TuiChevron, TuiDataListWrapper, TuiSelect} from '@taiga-ui/kit';
import {TuiCardLarge} from '@taiga-ui/layout';

@Component({
    imports: [
        FormsModule,
        TuiAvatar,
        TuiCardLarge,
        TuiCell,
        TuiChevron,
        TuiDataListWrapper,
        TuiNotification,
        TuiSelect,
        TuiTextfield,
        TuiTitle,
    ],
    templateUrl: './index.html',
    styleUrl: './index.less',
    encapsulation,
    changeDetection,
})
export default class Example {
    protected readonly items = [
        {
            icon: '@otus.outline.eye-lined',
            title: 'Show more',
            subtitle: 'Ctrl + Shift + M',
        },
        {
            icon: '@otus.outline.mail-01-lined',
            title: 'Send message',
            subtitle: 'Keep it short',
        },
        {
            icon: '@otus.outline.lock-01-lined',
            title: 'Access',
            subtitle: 'Block your account',
        },
    ];

    protected value = this.items[0]!;
}
