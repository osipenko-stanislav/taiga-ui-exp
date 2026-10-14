import {ChangeDetectionStrategy, Component, computed, signal} from '@angular/core';

import {BRAND_COLOR_GROUPS} from './palette';

@Component({
    selector: 'otus-brand-colors',
    templateUrl: './brand-colors.component.html',
    styleUrl: './brand-colors.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiOtusBrandColors {
    protected readonly query = signal('');
    protected readonly count = BRAND_COLOR_GROUPS.reduce(
        (total, group) => total + group.colors.length,
        0,
    );

    protected readonly groups = computed(() => {
        const query = this.query().trim().toLowerCase();

        return BRAND_COLOR_GROUPS.map((group) => ({
            name: group.name,
            colors: group.colors.filter((color) =>
                `${group.name} ${color.name} ${color.hex}`.toLowerCase().includes(query),
            ),
        })).filter((group) => group.colors.length);
    });
}
