import {Component} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {encapsulation} from '@demo/emulate/encapsulation';
import {TuiNotification, tuiNotificationOptionsProvider} from '@taiga-ui/core';

@Component({
    imports: [TuiNotification],
    templateUrl: './index.html',
    encapsulation,
    changeDetection,
    providers: [
        tuiNotificationOptionsProvider({
            icon: '@otus.outline.alarm-clock-lined',
            appearance: 'neutral',
            size: 's',
        }),
    ],
})
export default class Example {}
