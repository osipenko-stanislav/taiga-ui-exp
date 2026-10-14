import {Component} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {encapsulation} from '@demo/emulate/encapsulation';
import {TuiTabBar} from '@taiga-ui/addon-mobile';

@Component({
    imports: [TuiTabBar],
    templateUrl: './index.html',
    styleUrl: './index.less',
    encapsulation,
    changeDetection,
})
export default class Example {
    protected readonly items = [
        {
            text: 'Home',
            icon: '@otus.outline.home-01-lined',
        },
        {
            text: 'Photos',
            icon: '@otus.outline.image-01-lined',
        },
        {
            text: 'Navigation',
            icon: '@otus.outline.marker-pin-01-lined',
        },
    ];
}
