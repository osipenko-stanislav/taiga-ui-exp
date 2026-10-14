import {ChangeDetectionStrategy, Component, effect, input} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {
    TuiCheckbox,
    type TuiCheckboxOptions,
    type TuiInteractiveState,
} from '@taiga-ui/core';

@Component({
    selector: 'storybook-checkbox',
    imports: [ReactiveFormsModule, TuiCheckbox],
    templateUrl: './checkbox.component.html',
    styleUrl: './checkbox.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiCheckboxStory {
    protected readonly control = new FormControl<boolean | null>(false);
    protected readonly syncValue = effect(() => this.control.setValue(this.checked()));
    protected readonly syncDisabled = effect(() => {
        if (this.disabled()) {
            this.control.disable();
        } else {
            this.control.enable();
        }
    });

    protected readonly syncValidation = effect(() => {
        this.control.setValidators(this.required() ? Validators.requiredTrue : null);
        this.control.updateValueAndValidity();
        this.control.markAsTouched();
    });

    public readonly label = input('Accept terms');
    public readonly checked = input<boolean | null>(false);
    public readonly size = input<TuiCheckboxOptions['size']>('m');
    public readonly disabled = input(false);
    public readonly required = input(false);
    public readonly state = input<TuiInteractiveState | null>(null);
    public readonly focus = input<boolean | null>(null);
}
