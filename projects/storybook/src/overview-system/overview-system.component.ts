import {ChangeDetectionStrategy, Component} from '@angular/core';

import {TuiPageShell} from '../page-shell/page-shell.component';

@Component({
    selector: 'otus-overview-system',
    imports: [TuiPageShell],
    templateUrl: './overview-system.component.html',
    styleUrl: './overview-system.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiOverviewSystemStory {}
