import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TuiButton} from '@taiga-ui/core';

@Component({
    imports: [TuiButton],
    template: `
        <button
            appearance="flat-grayscale"
            iconStart="@otus.outline.zap-lined"
            size="xs"
            tuiButton
            type="button"
        >
            Edit
        </button>
    `,
    styleUrl: './index.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackblitzEditButton {}
