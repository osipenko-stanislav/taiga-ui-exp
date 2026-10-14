import {Component} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {encapsulation} from '@demo/emulate/encapsulation';
import {TuiIcon, tuiIconsProvider} from '@taiga-ui/core';
import mastercard from '@taiga-ui/icons/src/outline/credit-card-01-lined.svg';
import heart from '@taiga-ui/icons/src/outline/heart-lined.svg';

@Component({
    imports: [TuiIcon],
    templateUrl: './index.html',
    styleUrl: './index.less',
    encapsulation,
    changeDetection,
    providers: [
        tuiIconsProvider({
            '@otus.outline.heart-lined': heart,
            '@otus.outline.credit-card-01-lined': mastercard,
        }),
    ],
})
export default class Example {}
