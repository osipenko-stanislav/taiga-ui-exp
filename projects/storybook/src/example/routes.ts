import {type Routes} from '@angular/router';
import {tuiRouteDialog} from '@taiga-ui/kit';

import {DialogExample as EagerDialog} from '../../../demo/src/pages/components/dialog-routable/2/dialog.component';
import {DialogExample as NamedDialog} from '../../../demo/src/pages/components/dialog-routable/3/dialog.component';

export const STORYBOOK_ROUTES: Routes = [
    tuiRouteDialog(
        async () =>
            import('../../../demo/src/pages/components/dialog-routable/1/dialog.component'),
        {path: 'path/to/lazy'},
    ),
    tuiRouteDialog(EagerDialog, {path: 'path/to/eager'}),
    tuiRouteDialog(NamedDialog, {path: 'path/to/named-outlet', outlet: 'myOutlet'}),
    {path: '**', children: []},
];
