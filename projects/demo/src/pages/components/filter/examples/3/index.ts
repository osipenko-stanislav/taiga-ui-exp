import {JsonPipe} from '@angular/common';
import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {changeDetection} from '@demo/emulate/change-detection';
import {encapsulation} from '@demo/emulate/encapsulation';
import {TuiIcon} from '@taiga-ui/core';
import {TuiFilter} from '@taiga-ui/kit';

const getIcon: Record<string, string> = {
    Calendar: '@otus.outline.calendar-lined',
    Favorite: '@otus.outline.star-01-lined',
    Messages: '@otus.outline.message-square-01-lined',
    FAQ: '@otus.outline.help-circle-lined',
    Settings: '@otus.outline.settings-01-lined',
};

@Component({
    imports: [JsonPipe, ReactiveFormsModule, TuiFilter, TuiIcon],
    templateUrl: './index.html',
    styleUrl: './index.less',
    encapsulation,
    changeDetection,
})
export default class Example {
    protected items = ['Calendar', 'Favorite', 'Messages', 'FAQ', 'Settings'];
    protected form = new FormGroup({filters: new FormControl<string[]>([])});

    protected getItemIcon(title: string): string {
        return getIcon[title] ?? '';
    }
}
