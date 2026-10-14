import {ChangeDetectionStrategy, Component, effect, input} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {
    TuiDataList,
    TuiInput,
    type TuiInteractiveState,
    type TuiTextfieldOptions,
} from '@taiga-ui/core';

@Component({
    selector: 'storybook-textfield',
    imports: [ReactiveFormsModule, TuiDataList, TuiInput],
    templateUrl: './textfield.component.html',
    styleUrl: './textfield.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiTextfieldStory {
    protected readonly control = new FormControl('', {nonNullable: true});
    protected readonly suggestions = ['Angular', 'Nx', 'Taiga UI'];
    protected readonly syncValue = effect(() => this.control.setValue(this.value()));
    protected readonly syncDisabled = effect(() => {
        if (this.disabled()) {
            this.control.disable();
        } else {
            this.control.enable();
        }
    });

    public readonly label = input('Technology');
    public readonly placeholder = input('Enter a value');
    public readonly value = input('');
    public readonly size = input<ReturnType<TuiTextfieldOptions['size']>>('l');
    public readonly appearance = input('textfield');
    public readonly cleaner = input(true);
    public readonly disabled = input(false);
    public readonly readonly = input(false);
    public readonly invalid = input<boolean | null>(null);
    public readonly iconStart = input('');
    public readonly iconEnd = input('');
    public readonly state = input<TuiInteractiveState | null>(null);
    public readonly focus = input<boolean | null>(null);
    public readonly dropdown = input(false);
}
