import {Component} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {encapsulation} from '@demo/emulate/encapsulation';
import {TuiSheetDialog, type TuiSheetDialogOptions} from '@taiga-ui/addon-mobile';
import {TuiButton, TuiCell, TuiCellStretch, TuiTitle} from '@taiga-ui/core';
import {TuiAvatar, TuiBadgeNotification} from '@taiga-ui/kit';
import {TuiCardLarge} from '@taiga-ui/layout';

@Component({
    imports: [
        TuiAvatar,
        TuiBadgeNotification,
        TuiButton,
        TuiCardLarge,
        TuiCell,
        TuiCellStretch,
        TuiSheetDialog,
        TuiTitle,
    ],
    templateUrl: './index.html',
    styleUrl: './index.less',
    encapsulation,
    changeDetection,
})
export default class Example {
    protected open = false;

    protected readonly options: Partial<TuiSheetDialogOptions> = {
        label: 'Navigation',
        closable: true,
    };

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
}
