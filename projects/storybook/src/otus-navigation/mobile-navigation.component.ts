import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {TuiButton} from '@taiga-ui/core';
import {TuiAvatar} from '@taiga-ui/kit';
import {TuiFloatingContainer} from '@taiga-ui/layout';

import {type TuiOtusNavigationMenu, type TuiOtusNavigationSize} from './navigation.data';

@Component({
    selector: 'otus-mobile-navigation',
    imports: [TuiAvatar, TuiButton, TuiFloatingContainer],
    templateUrl: './mobile-navigation.component.html',
    styleUrl: './mobile-navigation.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiOtusMobileNavigation {
    protected readonly profile = computed(() =>
        this.utilities().find((menu) => menu.id === 'profile'),
    );

    public readonly utilities = input.required<readonly TuiOtusNavigationMenu[]>();
    public readonly size = input<TuiOtusNavigationSize>('m');
}
