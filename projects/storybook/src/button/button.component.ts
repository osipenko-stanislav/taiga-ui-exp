import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {TuiButton, type TuiButtonOptions, type TuiInteractiveState} from '@taiga-ui/core';
import {TuiButtonLoading} from '@taiga-ui/kit';

@Component({
    selector: 'storybook-button',
    imports: [TuiButton, TuiButtonLoading],
    templateUrl: './button.component.html',
    styleUrl: './button.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiButtonStory {
    public readonly label = input('Continue');
    public readonly appearance = input('primary');
    public readonly size = input<TuiButtonOptions['size']>('l');
    public readonly disabled = input(false);
    public readonly loading = input(false);
    public readonly iconStart = input('');
    public readonly iconEnd = input('');
    public readonly state = input<TuiInteractiveState | null>(null);
    public readonly focus = input<boolean | null>(null);
}
