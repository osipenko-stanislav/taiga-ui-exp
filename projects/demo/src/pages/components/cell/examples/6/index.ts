import {Component} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {encapsulation} from '@demo/emulate/encapsulation';
import {TuiButton, TuiCell, TuiDropdown, TuiGroup, TuiTitle} from '@taiga-ui/core';
import {TuiDataListWrapper} from '@taiga-ui/kit';

@Component({
    imports: [TuiButton, TuiCell, TuiDataListWrapper, TuiDropdown, TuiGroup, TuiTitle],
    templateUrl: './index.html',
    styleUrl: './index.less',
    encapsulation,
    changeDetection,
})
export default class Example {
    protected readonly items = [
        {
            icon: '@otus.outline.phone-lined',
            toString: () => 'Call now',
        },
        {
            icon: '@otus.outline.star-01-lined',
            toString: () => 'Add to favorites',
        },
        {
            icon: '@otus.outline.trash-01-lined',
            toString: () => 'Remove item',
        },
    ];
}
