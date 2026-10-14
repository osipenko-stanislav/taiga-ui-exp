import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {TuiDocAPIItem} from '@taiga-ui/addon-doc';
import {TuiTitle} from '@taiga-ui/core';

@Component({
    selector: 'tbody[tuiDocIcons]',
    imports: [TuiDocAPIItem, TuiTitle],
    templateUrl: './index.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiDocIcons {
    protected readonly icons = [
        '',
        '@otus.outline.search-md-lined',
        '@otus.outline.heart-lined',
        '@otus.outline.settings-01-lined',
        '@otus.outline.chevron-down-lined',
        '@otus.outline.currency-euro-lined',
        '@otus.outline.currency-dollar-lined',
    ];

    public readonly hiddenOptions = input<Array<string | keyof TuiDocIcons>>([]);
    public iconStart = '';
    public iconEnd = '';
}
