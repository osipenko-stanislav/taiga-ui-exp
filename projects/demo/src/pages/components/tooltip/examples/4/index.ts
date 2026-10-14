import {Component} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {encapsulation} from '@demo/emulate/encapsulation';
import {tuiHintOptionsProvider, TuiIcon} from '@taiga-ui/core';
import {TuiTooltip} from '@taiga-ui/kit';

@Component({
    imports: [TuiIcon, TuiTooltip],
    templateUrl: './index.html',
    encapsulation,
    changeDetection,
    providers: [tuiHintOptionsProvider({icon: '@otus.outline.camera-01-lined'})],
})
export default class Example {}
