import {ChangeDetectionStrategy, Component, computed, signal} from '@angular/core';

import {OTUS_DIMENSION_TOKENS} from '../generated/catalog';

@Component({
    selector: 'otus-dimensions',
    templateUrl: './otus-dimensions.component.html',
    styleUrl: './otus-dimensions.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiOtusDimensions {
    protected readonly query = signal('');
    protected readonly count = OTUS_DIMENSION_TOKENS.length;
    protected readonly tokens = computed(() => {
        const query = this.query().trim().toLowerCase();

        return OTUS_DIMENSION_TOKENS.filter((token) =>
            `${token.name} ${token.px} px ${token.rem} rem`.includes(query),
        );
    });
}
