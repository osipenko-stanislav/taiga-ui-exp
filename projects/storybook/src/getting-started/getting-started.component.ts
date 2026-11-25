import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TuiButton} from '@taiga-ui/core';

import {TuiPageShell} from '../page-shell/page-shell.component';

@Component({
    selector: 'otus-getting-started',
    imports: [TuiButton, TuiPageShell],
    templateUrl: './getting-started.component.html',
    styleUrl: './getting-started.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiGettingStartedStory {}
