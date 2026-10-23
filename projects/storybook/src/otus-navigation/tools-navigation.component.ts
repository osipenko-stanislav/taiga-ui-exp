import {ChangeDetectionStrategy, Component, input, model, signal} from '@angular/core';
import {TuiChevron} from '@taiga-ui/kit';
import {TuiNavigation} from '@taiga-ui/layout';

import {TOOL_GROUPS} from './navigation.data';

@Component({
    selector: 'otus-tools-navigation',
    imports: [TuiChevron, TuiNavigation],
    templateUrl: './tools-navigation.component.html',
    styleUrl: './tools-navigation.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiOtusToolsNavigation {
    protected readonly selected = signal('');

    public readonly groups = input(TOOL_GROUPS);
    public readonly expanded = model(true);
    public readonly theme = input<'dark' | 'light'>('light');
}
