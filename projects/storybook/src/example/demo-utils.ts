import {
    AsyncPipe,
    NgForOf,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
} from '@angular/common';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {TuiAddonDoc} from '@taiga-ui/addon-doc';
import {TuiLink, TuiNotification} from '@taiga-ui/core';

import {TuiDisabledDirective} from '../../../demo/src/utils/disabled.directive';

export {TuiDisabledDirective};
export {TuiFont} from '../../../demo/src/utils/font.component';
export {assets} from '../../../demo/src/utils/load-assets';

export const TuiDemo = [
    ...TuiAddonDoc,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TuiLink,
    TuiNotification,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    AsyncPipe,
    NgForOf,
    NgIf,
    TuiDisabledDirective,
] as const;
